"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import {
  createShareableLink,
  generateEmailShareLink,
  copyToClipboard,
  generatePDFReport,
  ShareLinkParams,
} from "@/lib/export";
import { Module, Hotspot } from "@/types";

// ============================================
// Types
// ============================================

export interface ShareMenuProps {
  /** Module ID for generating shareable links */
  moduleId: string;
  /** Optional module data for downloadable report */
  module?: Module;
  /** Optional hotspots for report */
  hotspots?: Hotspot[];
  /** Current city ID for link context */
  cityId?: string;
  /** City name for display and email */
  cityName?: string;
  /** Current view state */
  currentView?: "map" | "list" | "chart";
  /** Active filters to encode in share link */
  filters?: Record<string, string | number | boolean>;
  /** Custom share message */
  shareMessage?: string;
  /** Callback when share action completes */
  onShare?: (method: ShareMethod, success: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable specific share methods */
  disabledOptions?: ShareMethod[];
}

export type ShareMethod = "link" | "email" | "download";

interface ShareOption {
  id: ShareMethod;
  label: string;
  description: string;
  icon: IconName;
}

// ============================================
// Constants
// ============================================

const shareOptions: ShareOption[] = [
  {
    id: "link",
    label: "Copy Link",
    description: "Copy shareable link to clipboard",
    icon: "externalLink",
  },
  {
    id: "email",
    label: "Share via Email",
    description: "Open email with pre-filled content",
    icon: "chat",
  },
  {
    id: "download",
    label: "Download Report",
    description: "Get shareable PDF report",
    icon: "download",
  },
];

// Animation configuration
const springTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...springTransition,
      delay: i * 0.03,
    },
  }),
};

const successRipple = {
  initial: { scale: 0, opacity: 0.5 },
  animate: {
    scale: 2.5,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

// ============================================
// Component
// ============================================

export function ShareMenu({
  moduleId,
  module,
  hotspots = [],
  cityId,
  cityName,
  currentView,
  filters,
  shareMessage,
  onShare,
  className = "",
  disabledOptions = [],
}: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [processing, setProcessing] = useState<ShareMethod | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showCopiedRipple, setShowCopiedRipple] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Generate the shareable link params
  const shareLinkParams: ShareLinkParams = {
    moduleId,
    cityId,
    filters,
    view: currentView,
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Clear feedback after delay
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleShare = useCallback(
    async (method: ShareMethod) => {
      if (disabledOptions.includes(method)) return;
      if (processing) return;

      setProcessing(method);
      let success = false;

      try {
        switch (method) {
          case "link": {
            const shareUrl = createShareableLink(shareLinkParams);
            const result = await copyToClipboard(shareUrl);
            success = result.success;

            if (success) {
              setShowCopiedRipple(true);
              setTimeout(() => setShowCopiedRipple(false), 600);
              setFeedback({ type: "success", message: "Link copied!" });
            } else {
              setFeedback({ type: "error", message: result.message });
            }
            break;
          }

          case "email": {
            const emailSubject = shareMessage
              ? shareMessage
              : cityName
                ? `Impact Atlas: ${module?.title || "Environmental Insights"} - ${cityName}`
                : `Impact Atlas: ${module?.title || "Environmental Insights"}`;

            const emailLink = generateEmailShareLink({
              ...shareLinkParams,
              subject: emailSubject,
              body: `${shareMessage || `Check out this environmental data from Impact Atlas${cityName ? ` for ${cityName}` : ""}:`}\n\n`,
            });

            window.location.href = emailLink;
            success = true;
            setFeedback({ type: "success", message: "Opening email client..." });
            break;
          }

          case "download": {
            if (module) {
              generatePDFReport({
                module,
                hotspots,
                cityName,
                generatedAt: new Date(),
              });
              success = true;
              setFeedback({ type: "success", message: "Report generated" });
            } else {
              setFeedback({
                type: "error",
                message: "Module data required for report",
              });
            }
            break;
          }
        }
      } catch (error) {
        console.error("Share failed:", error);
        setFeedback({ type: "error", message: "Share failed. Please try again." });
      } finally {
        setProcessing(null);
        onShare?.(method, success);

        // Close menu after successful share (except for link copy which shows ripple)
        if (success && method !== "link") {
          setTimeout(() => setIsOpen(false), 500);
        }
      }
    },
    [shareLinkParams, module, hotspots, cityName, shareMessage, disabledOptions, processing, onShare]
  );

  const availableOptions = shareOptions.filter(
    (opt) => !disabledOptions.includes(opt.id)
  );

  // Generate preview URL for display
  const previewUrl = createShareableLink(shareLinkParams);
  const truncatedUrl =
    previewUrl.length > 40 ? previewUrl.substring(0, 40) + "..." : previewUrl;

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springTransition}
        className={`
          relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200 overflow-hidden
          ${isOpen
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--foreground-muted)]"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {/* Success Ripple Effect */}
        <AnimatePresence>
          {showCopiedRipple && (
            <motion.div
              variants={successRipple}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--accent)] rounded-lg pointer-events-none"
              style={{ originX: 0.5, originY: 0.5 }}
            />
          )}
        </AnimatePresence>

        <Icon name="share" className="w-4 h-4 relative z-10" />
        <span className="relative z-10">Share</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springTransition}
          className="relative z-10"
        >
          <Icon name="chevronDown" className="w-3 h-3" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2 w-72 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-xl overflow-hidden">
              {/* Header with URL Preview */}
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]">
                <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide mb-2">
                  Share This View
                </p>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-[var(--border)]">
                  <Icon
                    name="externalLink"
                    className="w-3.5 h-3.5 text-[var(--foreground-muted)] flex-shrink-0"
                  />
                  <span className="text-xs text-[var(--foreground-secondary)] truncate font-mono">
                    {truncatedUrl}
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="py-1">
                {availableOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleShare(option.id)}
                    disabled={processing !== null}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-colors duration-150
                      ${processing === option.id
                        ? "bg-[var(--accent-bg)]"
                        : "hover:bg-[var(--background-secondary)]"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    role="menuitem"
                  >
                    {/* Icon */}
                    <div
                      className={`
                        w-9 h-9 rounded-lg flex items-center justify-center
                        transition-colors duration-200
                        ${processing === option.id
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                        }
                      `}
                    >
                      {processing === option.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Icon name="loader" className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Icon name={option.icon} className="w-4 h-4" />
                      )}
                    </div>

                    {/* Label & Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] truncate">
                        {option.description}
                      </p>
                    </div>

                    {/* Arrow Icon */}
                    <Icon
                      name="chevronRight"
                      className="w-4 h-4 text-[var(--foreground-muted)]"
                    />
                  </motion.button>
                ))}
              </div>

              {/* Quick Copy Button */}
              <div className="px-3 pb-3">
                <motion.button
                  onClick={() => handleShare("link")}
                  disabled={processing !== null}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    w-full flex items-center justify-center gap-2 px-4 py-2.5
                    rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${feedback?.type === "success"
                      ? "bg-green-500 text-white"
                      : "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {feedback?.type === "success" ? (
                    <>
                      <Icon name="check" className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Icon name="clipboard" className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Feedback Toast */}
              <AnimatePresence>
                {feedback && feedback.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mx-3 mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-50 text-red-700 border border-red-200"
                  >
                    <Icon name="warning" className="w-3.5 h-3.5" />
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Compact Share Button (Alternative)
// ============================================

interface ShareButtonProps {
  moduleId: string;
  cityId?: string;
  className?: string;
  variant?: "icon" | "text";
}

export function ShareButton({
  moduleId,
  cityId,
  className = "",
  variant = "icon",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const shareUrl = createShareableLink({ moduleId, cityId });
    const result = await copyToClipboard(shareUrl);

    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === "icon") {
    return (
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          p-2 rounded-lg transition-colors duration-200
          ${copied
            ? "bg-green-100 text-green-600"
            : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]"
          }
          ${className}
        `}
        title={copied ? "Copied!" : "Copy share link"}
      >
        <Icon name={copied ? "check" : "share"} className="w-4 h-4" />
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-200
        ${copied
          ? "bg-green-100 text-green-700"
          : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
        }
        ${className}
      `}
    >
      <Icon name={copied ? "check" : "share"} className="w-4 h-4" />
      <span>{copied ? "Copied!" : "Share"}</span>
    </motion.button>
  );
}
