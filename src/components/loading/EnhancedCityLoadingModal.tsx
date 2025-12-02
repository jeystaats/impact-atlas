"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { ModuleLoadingCard } from "./ModuleLoadingCard";
import { DataStreamAnimation } from "./DataStreamAnimation";
import { ProgressRing } from "./ProgressRing";
import { AIActivityIndicator } from "./AIActivityIndicator";
import { useNotifications } from "@/components/notifications/useNotifications";
import { cn } from "@/lib/utils";

// Generation stages with detailed info
const GENERATION_STAGES = [
  {
    id: "locating",
    label: "Locating satellite data sources",
    description: "Connecting to Sentinel-2 and Landsat imagery",
    icon: "mapPin" as IconName,
    color: "#0D9488",
    estimatedDuration: 3,
  },
  {
    id: "urban-heat",
    label: "Analyzing urban heat islands",
    description: "Processing thermal infrared bands",
    icon: "thermometer" as IconName,
    color: "#EF4444",
    estimatedDuration: 8,
  },
  {
    id: "coastal-plastic",
    label: "Detecting coastal plastic accumulation",
    description: "Running spectral analysis on coastal zones",
    icon: "waves" as IconName,
    color: "#3B82F6",
    estimatedDuration: 10,
  },
  {
    id: "ocean-plastic",
    label: "Mapping ocean plastic pathways",
    description: "Analyzing maritime traffic and current patterns",
    icon: "droplets" as IconName,
    color: "#06B6D4",
    estimatedDuration: 8,
  },
  {
    id: "port-emissions",
    label: "Quantifying port emissions",
    description: "Processing vessel AIS data and emission factors",
    icon: "ship" as IconName,
    color: "#6366F1",
    estimatedDuration: 7,
  },
  {
    id: "biodiversity",
    label: "Identifying biodiversity opportunities",
    description: "Analyzing land cover and habitat connectivity",
    icon: "leaf" as IconName,
    color: "#22C55E",
    estimatedDuration: 9,
  },
  {
    id: "restoration",
    label: "Discovering restoration sites",
    description: "Evaluating ecological restoration potential",
    icon: "trees" as IconName,
    color: "#84CC16",
    estimatedDuration: 7,
  },
  {
    id: "insights",
    label: "Generating AI insights",
    description: "Synthesizing actionable recommendations",
    icon: "sparkles" as IconName,
    color: "#8B5CF6",
    estimatedDuration: 5,
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

interface EnhancedCityLoadingModalProps {
  isOpen: boolean;
  cityName: string;
  country: string;
  progress: OnboardingProgress | null;
  onClose?: () => void;
  onEnterDashboard?: () => void;
  onMinimize?: () => void;
}

export function EnhancedCityLoadingModal({
  isOpen,
  cityName,
  country,
  progress,
  onClose,
  onEnterDashboard,
  onMinimize,
}: EnhancedCityLoadingModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const { info, success, aiInsight } = useNotifications();
  const lastNotifiedModuleCount = useRef(0);
  const hasNotifiedCompletion = useRef(false);

  // Track elapsed time
  useEffect(() => {
    if (!isOpen || progress?.status === "completed") return;

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, progress?.status]);

  // Reset elapsed time when modal opens
  useEffect(() => {
    if (isOpen) {
      setElapsedTime(0);
      lastNotifiedModuleCount.current = 0;
      hasNotifiedCompletion.current = false;
    }
  }, [isOpen]);

  // Send notifications for background progress updates
  useEffect(() => {
    if (!progress || isOpen) return; // Only notify when modal is closed (running in background)

    const completedCount = progress.moduleProgress.filter(
      (m) => m.status === "completed"
    ).length;

    // Notify when new modules complete
    if (completedCount > lastNotifiedModuleCount.current) {
      const newlyCompleted = progress.moduleProgress.filter(
        (m) => m.status === "completed"
      );
      const latestModule = newlyCompleted[newlyCompleted.length - 1];

      if (latestModule) {
        const moduleName = latestModule.moduleSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        info(
          `${moduleName} ready`,
          `${latestModule.hotspotsCreated} hotspots, ${latestModule.quickWinsCreated} quick wins found for ${cityName}`,
          { cityId: cityName, persistent: true }
        );
      }

      lastNotifiedModuleCount.current = completedCount;
    }

    // Notify when fully complete
    if (progress.status === "completed" && !hasNotifiedCompletion.current) {
      const totalHotspots = progress.moduleProgress.reduce(
        (sum, m) => sum + m.hotspotsCreated,
        0
      );
      const totalQuickWins = progress.moduleProgress.reduce(
        (sum, m) => sum + m.quickWinsCreated,
        0
      );

      success(
        `${cityName} is ready!`,
        `All modules loaded: ${totalHotspots} hotspots and ${totalQuickWins} quick wins discovered`,
        {
          cityId: cityName,
          persistent: true,
          action: {
            label: "View Dashboard",
            onClick: () => onEnterDashboard?.(),
          },
        }
      );

      hasNotifiedCompletion.current = true;
    }
  }, [progress, isOpen, cityName, info, success, onEnterDashboard]);

  // Find current stage info
  const currentStageInfo = useMemo(
    () =>
      GENERATION_STAGES.find((s) => s.id === progress?.currentStage) ||
      GENERATION_STAGES[0],
    [progress?.currentStage]
  );

  // Calculate estimated remaining time
  const estimatedTotalTime = useMemo(
    () => GENERATION_STAGES.reduce((sum, s) => sum + s.estimatedDuration, 0),
    []
  );

  const estimatedRemainingTime = useMemo(() => {
    const currentIndex = GENERATION_STAGES.findIndex(
      (s) => s.id === progress?.currentStage
    );
    if (currentIndex === -1) return estimatedTotalTime;

    return GENERATION_STAGES.slice(currentIndex).reduce(
      (sum, s) => sum + s.estimatedDuration,
      0
    );
  }, [progress?.currentStage, estimatedTotalTime]);

  // Count completed modules
  const completedModules =
    progress?.moduleProgress.filter((m) => m.status === "completed").length || 0;
  const totalModules = 6;

  // Calculate total stats
  const totalHotspots =
    progress?.moduleProgress.reduce((sum, m) => sum + m.hotspotsCreated, 0) || 0;
  const totalQuickWins =
    progress?.moduleProgress.reduce((sum, m) => sum + m.quickWinsCreated, 0) || 0;

  // Can enter early if 2+ modules done
  const canEnterEarly = completedModules >= 2 && progress?.status === "generating";

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // AI activity stage
  const aiStage = useMemo(() => {
    if (progress?.status === "completed") return "complete";
    if (progress?.currentStage === "insights") return "streaming";
    if (progress?.status === "generating") return "processing";
    return "thinking";
  }, [progress]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(13, 17, 23, 0.98) 0%, rgba(22, 27, 34, 0.98) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Data stream animation */}
          <DataStreamAnimation
            color={currentStageInfo.color}
            active={progress?.status === "generating"}
          />

          {/* Main modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[var(--background-tertiary)] rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-[var(--border)]">
              {/* Close/Minimize button */}
              {progress?.status === "generating" && (
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      info(
                        `Loading ${cityName} in background`,
                        `You'll be notified when modules complete. ${completedModules}/${totalModules} done so far.`,
                        { cityId: cityName, persistent: true }
                      );
                      onClose?.();
                    }}
                    className="p-2 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors group"
                    title="Continue in background"
                  >
                    <Icon name="x" className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-4">
                {/* Progress ring */}
                <ProgressRing
                  progress={progress?.progress || 0}
                  size={72}
                  color={currentStageInfo.color}
                />

                <div className="text-left">
                  <h2 className="text-xl font-bold text-[var(--foreground)]">
                    {progress?.status === "completed"
                      ? `${cityName} is ready!`
                      : `Loading ${cityName}`}
                  </h2>
                  <p className="text-sm text-[var(--foreground-muted)]">{country}</p>

                  {/* Time indicators */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--foreground-muted)]">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      {formatTime(elapsedTime)} elapsed
                    </span>
                    {progress?.status === "generating" && (
                      <span className="flex items-center gap-1">
                        ~{formatTime(estimatedRemainingTime)} remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current stage detail */}
            <div className="px-6 py-4 bg-[var(--background-secondary)] border-b border-[var(--border)]">
              <div className="flex items-center gap-4">
                <AIActivityIndicator stage={aiStage} color={currentStageInfo.color} />

                <div className="flex-1">
                  <motion.p
                    key={progress?.currentStageLabel}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium text-[var(--foreground)]"
                  >
                    {progress?.currentStageLabel || "Initializing AI systems..."}
                  </motion.p>
                  <motion.p
                    key={currentStageInfo.description}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xs text-[var(--foreground-muted)] mt-0.5"
                  >
                    {currentStageInfo.description}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Module progress grid */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--foreground)]">
                  Module Progress
                </h3>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {completedModules}/{totalModules} complete
                </span>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {GENERATION_STAGES.slice(1, 7).map((stage) => {
                  const moduleProgress = progress?.moduleProgress.find(
                    (m) => m.moduleSlug === stage.id
                  );

                  let status:
                    | "pending"
                    | "loading"
                    | "processing"
                    | "completed"
                    | "failed" = "pending";
                  if (moduleProgress?.status === "completed") status = "completed";
                  else if (moduleProgress?.status === "generating")
                    status = "processing";
                  else if (moduleProgress?.status === "failed") status = "failed";
                  else if (progress?.currentStage === stage.id) status = "loading";

                  return (
                    <ModuleLoadingCard
                      key={stage.id}
                      moduleId={stage.id}
                      moduleName={stage.id
                        .split("-")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                      color={stage.color}
                      status={status}
                      hotspotsFound={moduleProgress?.hotspotsCreated}
                      quickWinsFound={moduleProgress?.quickWinsCreated}
                      estimatedTime={`${stage.estimatedDuration}s`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Stats summary - shows when modules are completing */}
            <AnimatePresence>
              {completedModules > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-4"
                >
                  <div className="flex items-center justify-center gap-6 p-4 rounded-xl bg-[var(--background-secondary)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center">
                        <Icon name="target" className="w-4 h-4 text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
                          {totalHotspots}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Hotspots found
                        </p>
                      </div>
                    </div>

                    <div className="w-px h-10 bg-[var(--border)]" />

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center">
                        <Icon name="zap" className="w-4 h-4 text-[var(--warning)]" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--foreground)] tabular-nums">
                          {totalQuickWins}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          Quick wins
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {progress?.error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30"
              >
                <div className="flex items-center gap-2">
                  <Icon name="warning" className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-400">{progress.error}</p>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="p-6 pt-2 flex gap-3 border-t border-[var(--border)]">
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
                  <button
                    onClick={() => {
                      info(
                        `Loading ${cityName} in background`,
                        `You'll be notified when modules complete. ${completedModules}/${totalModules} done so far.`,
                        { cityId: cityName, persistent: true }
                      );
                      onClose?.();
                    }}
                    className="py-3 px-4 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] text-sm flex items-center gap-2 transition-colors"
                  >
                    <Icon name="bellRing" className="w-4 h-4" />
                    Background
                  </button>
                </>
              ) : (
                <div className="flex-1 flex gap-3">
                  <div className="flex-1 py-3 px-4 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-muted)] text-center text-sm flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon name="loader" className="w-4 h-4" />
                    </motion.div>
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {progress?.status === "failed"
                        ? "Generation failed"
                        : "Generating city data..."}
                    </motion.span>
                  </div>
                  <button
                    onClick={() => {
                      info(
                        `Loading ${cityName} in background`,
                        `You'll be notified when modules complete. ${completedModules}/${totalModules} done so far.`,
                        { cityId: cityName, persistent: true }
                      );
                      onClose?.();
                    }}
                    className="py-3 px-4 rounded-xl border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] text-sm flex items-center gap-2 transition-colors"
                  >
                    <Icon name="bellRing" className="w-4 h-4" />
                    Background
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
