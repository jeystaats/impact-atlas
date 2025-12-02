"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// Module stages with their display info
const GENERATION_STAGES = [
  {
    id: "locating",
    label: "Locating city data...",
    icon: "mapPin" as IconName,
    color: "#0D9488",
  },
  {
    id: "urban-heat",
    label: "Scanning urban heat patterns...",
    icon: "thermometer" as IconName,
    color: "#EF4444",
  },
  {
    id: "coastal-plastic",
    label: "Analyzing coastal plastic hotspots...",
    icon: "waves" as IconName,
    color: "#3B82F6",
  },
  {
    id: "ocean-plastic",
    label: "Classifying ocean plastic sources...",
    icon: "droplets" as IconName,
    color: "#06B6D4",
  },
  {
    id: "port-emissions",
    label: "Mapping port emission zones...",
    icon: "ship" as IconName,
    color: "#6366F1",
  },
  {
    id: "biodiversity",
    label: "Discovering biodiversity opportunities...",
    icon: "leaf" as IconName,
    color: "#22C55E",
  },
  {
    id: "restoration",
    label: "Finding restoration sites...",
    icon: "trees" as IconName,
    color: "#84CC16",
  },
  {
    id: "insights",
    label: "Generating AI insights...",
    icon: "sparkles" as IconName,
    color: "#8B5CF6",
  },
];

interface ModuleProgressItem {
  moduleSlug: string;
  status: "pending" | "generating" | "completed" | "failed";
  hotspotsCreated: number;
  quickWinsCreated: number;
  error?: string;
}

interface OnboardingProgress {
  status: "pending" | "generating" | "completed" | "failed";
  currentStage: string;
  currentStageLabel: string;
  progress: number;
  moduleProgress: ModuleProgressItem[];
  error?: string;
}

interface CityOnboardingModalProps {
  isOpen: boolean;
  cityName: string;
  country: string;
  progress: OnboardingProgress | null;
  onClose?: () => void;
  onEnterDashboard?: () => void;
}

export function CityOnboardingModal({
  isOpen,
  cityName,
  country,
  progress,
  onClose,
  onEnterDashboard,
}: CityOnboardingModalProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Generate floating particles
  useEffect(() => {
    if (isOpen) {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  // Find current stage info
  const currentStageInfo = GENERATION_STAGES.find((s) => s.id === progress?.currentStage) || GENERATION_STAGES[0];

  // Count completed modules
  const completedModules = progress?.moduleProgress.filter((m) => m.status === "completed").length || 0;
  const totalModules = 6;

  // Can enter early if 2+ modules done
  const canEnterEarly = completedModules >= 2 && progress?.status === "generating";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop with gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.98) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 rounded-full bg-[var(--accent)]"
                style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: particle.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[var(--background-tertiary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            {/* Header with city name */}
            <div className="p-6 pb-4 text-center border-b border-[var(--border)]">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${currentStageInfo.color}20` }}
              >
                <motion.div
                  animate={{ rotate: progress?.status === "generating" ? 360 : 0 }}
                  transition={{ duration: 2, repeat: progress?.status === "generating" ? Infinity : 0, ease: "linear" }}
                >
                  <Icon
                    name={currentStageInfo.icon}
                    className="w-8 h-8"
                    style={{ color: currentStageInfo.color }}
                  />
                </motion.div>
              </motion.div>

              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {progress?.status === "completed" ? "Ready to explore!" : `Loading ${cityName}`}
              </h2>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">{country}</p>
            </div>

            {/* Progress section */}
            <div className="p-6">
              {/* Current stage label */}
              <div className="text-center mb-6">
                <motion.p
                  key={progress?.currentStageLabel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm font-medium text-[var(--foreground)]"
                >
                  {progress?.currentStageLabel || "Initializing..."}
                </motion.p>
              </div>

              {/* Main progress bar */}
              <div className="relative h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden mb-6">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: currentStageInfo.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress?.progress || 0}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x: [-80, 400] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Module progress grid */}
              <div className="grid grid-cols-3 gap-3">
                {GENERATION_STAGES.slice(1, 7).map((stage, index) => {
                  const moduleProgress = progress?.moduleProgress.find(
                    (m) => m.moduleSlug === stage.id
                  );
                  const status = moduleProgress?.status || "pending";

                  return (
                    <motion.div
                      key={stage.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className={cn(
                        "p-3 rounded-xl border text-center transition-all",
                        status === "completed"
                          ? "bg-[var(--accent-bg)] border-[var(--accent)]"
                          : status === "generating"
                          ? "bg-[var(--background-secondary)] border-[var(--accent-muted)]"
                          : status === "failed"
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-[var(--background-secondary)] border-[var(--border)]"
                      )}
                    >
                      <div className="flex justify-center mb-2">
                        {status === "completed" ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Icon name="check" className="w-5 h-5 text-[var(--accent)]" />
                          </motion.div>
                        ) : status === "generating" ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Icon name="loader" className="w-5 h-5" style={{ color: stage.color }} />
                          </motion.div>
                        ) : status === "failed" ? (
                          <Icon name="warning" className="w-5 h-5 text-red-500" />
                        ) : (
                          <Icon name={stage.icon} className="w-5 h-5 text-[var(--foreground-muted)]" />
                        )}
                      </div>
                      <p className="text-xs font-medium text-[var(--foreground-muted)] truncate">
                        {stage.id.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </p>
                      {status === "completed" && moduleProgress && (
                        <p className="text-[10px] text-[var(--foreground-muted)] mt-1">
                          {moduleProgress.hotspotsCreated} hotspots
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Stats summary */}
              {progress?.status === "generating" && completedModules > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl bg-[var(--background-secondary)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Icon name="target" className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm text-[var(--foreground)]">
                      {progress.moduleProgress.reduce((sum, m) => sum + m.hotspotsCreated, 0)} hotspots found
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="zap" className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-sm text-[var(--foreground)]">
                      {progress.moduleProgress.reduce((sum, m) => sum + m.quickWinsCreated, 0)} quick wins
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              {progress?.error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center"
                >
                  <p className="text-sm text-red-400">{progress.error}</p>
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 flex gap-3">
              {progress?.status === "completed" ? (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onEnterDashboard}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="arrowRight" className="w-4 h-4" />
                  Enter Dashboard
                </motion.button>
              ) : canEnterEarly ? (
                <>
                  <button
                    onClick={onEnterDashboard}
                    className="flex-1 py-3 px-4 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="arrowRight" className="w-4 h-4" />
                    Enter Early
                  </button>
                  <div className="flex-1 py-3 px-4 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-muted)] text-sm text-center">
                    {completedModules}/{totalModules} ready
                  </div>
                </>
              ) : (
                <div className="flex-1 py-3 px-4 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-muted)] text-center text-sm">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {progress?.status === "failed" ? "Generation failed" : "Please wait..."}
                  </motion.span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
