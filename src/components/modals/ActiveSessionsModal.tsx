"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useClerk, useSession } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icons";
import { Monitor, Smartphone, Tablet, Globe, MapPin, Clock, Shield, LogOut } from "lucide-react";
import { overlayVariants, modalVariants } from "./modalAnimations";

interface SessionInfo {
  id: string;
  device: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
  location: string;
  lastActive: Date;
  isCurrent: boolean;
  ipAddress?: string;
}

interface ActiveSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe,
};

// Parse user agent to get device info
function parseUserAgent(userAgent: string): { device: string; deviceType: "desktop" | "mobile" | "tablet" | "unknown"; browser: string } {
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "unknown";
  let device = "Unknown Device";
  let browser = "Unknown Browser";

  // Detect device type
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    if (/iPad|Tablet/i.test(userAgent)) {
      deviceType = "tablet";
      device = /iPad/i.test(userAgent) ? "iPad" : "Tablet";
    } else {
      deviceType = "mobile";
      device = /iPhone/i.test(userAgent) ? "iPhone" : "Android Phone";
    }
  } else {
    deviceType = "desktop";
    if (/Mac/i.test(userAgent)) device = "Mac";
    else if (/Windows/i.test(userAgent)) device = "Windows PC";
    else if (/Linux/i.test(userAgent)) device = "Linux";
    else device = "Desktop";
  }

  // Detect browser
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
  else if (/Edge|Edg/i.test(userAgent)) browser = "Edge";
  else if (/Opera|OPR/i.test(userAgent)) browser = "Opera";

  return { device, deviceType, browser };
}

export function ActiveSessionsModal({ isOpen, onClose }: ActiveSessionsModalProps) {
  const { signOut: _signOut } = useClerk();
  const { session: currentSession } = useSession();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch sessions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen]);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from Clerk's API
      // For demo, we'll create mock sessions including the current one
      const currentUserAgent = navigator.userAgent;
      const { device, deviceType, browser } = parseUserAgent(currentUserAgent);

      const mockSessions: SessionInfo[] = [
        {
          id: currentSession?.id || "current",
          device,
          deviceType,
          browser,
          location: "Current Location",
          lastActive: new Date(),
          isCurrent: true,
        },
        // Add some mock historical sessions for demo
        {
          id: "session-2",
          device: "iPhone",
          deviceType: "mobile",
          browser: "Safari",
          location: "Amsterdam, NL",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isCurrent: false,
        },
        {
          id: "session-3",
          device: "Windows PC",
          deviceType: "desktop",
          browser: "Chrome",
          location: "Rotterdam, NL",
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          isCurrent: false,
        },
      ];

      setSessions(mockSessions);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingId(sessionId);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Remove the session from the list
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked", {
        description: "The device has been signed out",
      });
    } catch (error) {
      console.error("Failed to revoke session:", error);
      toast.error("Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    const otherSessions = sessions.filter((s) => !s.isCurrent);
    if (otherSessions.length === 0) {
      toast.info("No other sessions to revoke");
      return;
    }

    setRevokingId("all");
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Keep only the current session
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      toast.success("All other sessions revoked", {
        description: `${otherSessions.length} device(s) have been signed out`,
      });
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      toast.error("Failed to revoke sessions");
    } finally {
      setRevokingId(null);
    }
  };

  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-sessions-title"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-4 lg:inset-auto lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:w-full lg:max-w-lg lg:max-h-[80vh] z-50 flex flex-col rounded-2xl bg-[var(--background-secondary)] border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h2 id="active-sessions-title" className="text-lg font-semibold text-[var(--foreground)]">Active Sessions</h2>
                  <p className="text-xs text-[var(--foreground-muted)]">
                    {sessions.length} device{sessions.length !== 1 ? "s" : ""} signed in
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close active sessions modal"
                className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <Icon name="x" className="w-5 h-5 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Icon name="loader" className="w-8 h-8 text-[var(--accent)]" />
                  </motion.div>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => {
                    const DeviceIcon = deviceIcons[session.deviceType];
                    const isRevoking = revokingId === session.id || revokingId === "all";

                    return (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-4 rounded-xl border transition-all ${
                          session.isCurrent
                            ? "bg-[var(--accent-bg)] border-[var(--accent)]/30"
                            : "bg-[var(--background-tertiary)] border-[var(--border)]"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              session.isCurrent
                                ? "bg-[var(--accent)]/20"
                                : "bg-[var(--background-secondary)]"
                            }`}
                          >
                            <DeviceIcon
                              className="w-5 h-5"
                              style={{ color: session.isCurrent ? "var(--accent)" : "var(--foreground-muted)" }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-[var(--foreground)]">
                                {session.device}
                              </h3>
                              {session.isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)] text-white">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
                              {session.browser}
                            </p>

                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--foreground-muted)]">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {session.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatLastActive(session.lastActive)}
                              </span>
                            </div>
                          </div>

                          {!session.isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={isRevoking}
                              aria-label={`Sign out ${session.device}`}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            >
                              {isRevoking ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                  <Icon name="loader" className="w-4 h-4" />
                                </motion.div>
                              ) : (
                                <LogOut className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)] transition-colors"
              >
                Close
              </button>
              {sessions.filter((s) => !s.isCurrent).length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRevokeAllOther}
                  disabled={revokingId !== null}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {revokingId === "all" ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon name="loader" className="w-4 h-4" />
                      </motion.div>
                      Revoking...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      Sign Out Other Devices
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
