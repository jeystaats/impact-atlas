"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { HotspotData } from "@/data/hotspots";
import { TrendChart, generateMockTrendData, type TrendDataPoint } from "@/components/charts/TrendChart";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface HotspotDetailDrawerProps {
  hotspot: HotspotData | null;
  isOpen: boolean;
  onClose: () => void;
  onExportData?: (hotspot: HotspotData) => void;
  onShare?: (hotspot: HotspotData) => void;
  onAddToActionPlan?: (hotspot: HotspotData) => void;
  onApplyRecommendation?: (hotspot: HotspotData, recommendation: string) => void;
}

interface RecommendationWithPriority {
  text: string;
  priority: "high" | "medium" | "low";
  estimatedImpact?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const severityConfig = {
  low: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    bgMuted: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    color: "#10B981",
    label: "Low Severity",
  },
  medium: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    bgMuted: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    color: "#F59E0B",
    label: "Medium Severity",
  },
  high: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    bgMuted: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    color: "#F97316",
    label: "High Severity",
  },
  critical: {
    bg: "bg-red-500",
    bgLight: "bg-red-50",
    bgMuted: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    color: "#EF4444",
    label: "Critical",
  },
};

const priorityConfig = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dot: "bg-red-500",
    label: "High Priority",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
    label: "Medium",
  },
  low: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    label: "Quick Win",
  },
};

// Animation variants
const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const drawerVariants: Variants = {
  hidden: { x: "100%", opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    x: "100%",
    opacity: 0.8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function assignRecommendationPriority(
  recommendations: string[],
  severity: HotspotData["severity"]
): RecommendationWithPriority[] {
  // Assign priorities based on recommendation index and severity
  return recommendations.map((text, index) => {
    let priority: "high" | "medium" | "low";

    if (severity === "critical" || severity === "high") {
      priority = index === 0 ? "high" : index === 1 ? "medium" : "low";
    } else if (severity === "medium") {
      priority = index === 0 ? "medium" : "low";
    } else {
      priority = "low";
    }

    // Generate estimated impact based on priority
    const impactMap = {
      high: "High impact - immediate action recommended",
      medium: "Moderate impact - plan within 30 days",
      low: "Quick win - easy to implement",
    };

    return {
      text,
      priority,
      estimatedImpact: impactMap[priority],
    };
  });
}

function parseValueFromHotspot(value: string | undefined): number {
  if (!value) return 0;
  // Extract number from strings like "+5.2degC", "2,400 kg/week", etc.
  const match = value.match(/[\d,.]+/);
  if (match) {
    return parseFloat(match[0].replace(",", ""));
  }
  return 0;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  className?: string;
}

function StatCard({ label, value, icon, trend, trendValue, className = "" }: StatCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={`p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wide">
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-[var(--accent)]">
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--foreground)] tabular-nums">{value}</p>
      {trend && trendValue && (
        <div className="flex items-center gap-1 mt-1">
          <div
            className={`
              w-5 h-5 rounded flex items-center justify-center
              ${trend === "up" ? "bg-red-100 text-red-600" : trend === "down" ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"}
            `}
          >
            <Icon
              name={trend === "up" ? "trendingUp" : trend === "down" ? "trendingDown" : "minus"}
              className="w-3 h-3"
            />
          </div>
          <span className="text-xs text-[var(--foreground-secondary)]">{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}

interface RecommendationCardProps {
  recommendation: RecommendationWithPriority;
  index: number;
  onApply: () => void;
  isApplying?: boolean;
}

function RecommendationCard({
  recommendation,
  index,
  onApply,
  isApplying = false,
}: RecommendationCardProps) {
  const config = priorityConfig[recommendation.priority];

  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className={`
        relative p-4 rounded-xl border transition-all duration-200
        ${config.bg} ${config.border}
        hover:shadow-md hover:scale-[1.01]
      `}
      whileHover={{ y: -2 }}
    >
      {/* Priority indicator with subtle pulse for high priority */}
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
          {recommendation.priority === "high" && (
            <motion.div
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 rounded-full ${config.dot}`}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${config.text}`}>{config.label}</span>
          </div>
          <p className="text-sm text-[var(--foreground)] leading-relaxed">
            {recommendation.text}
          </p>
          {recommendation.estimatedImpact && (
            <p className="text-xs text-[var(--foreground-muted)] mt-2 flex items-center gap-1">
              <Icon name="zap" className="w-3 h-3" />
              {recommendation.estimatedImpact}
            </p>
          )}
        </div>

        <motion.button
          onClick={onApply}
          disabled={isApplying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium
            bg-[var(--accent)] text-white
            hover:bg-[var(--accent-dark)] transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-1.5
          `}
        >
          {isApplying ? (
            <>
              <Icon name="loader" className="w-3 h-3 animate-spin" />
              Applying
            </>
          ) : (
            <>
              <Icon name="plus" className="w-3 h-3" />
              Apply
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function ActionButton({ icon, label, onClick, variant = "secondary" }: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
        font-medium text-sm transition-all duration-200
        ${
          variant === "primary"
            ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] shadow-md hover:shadow-lg"
            : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border border-[var(--border)] hover:bg-[var(--background)] hover:text-[var(--foreground)] hover:border-[var(--foreground-muted)]"
        }
      `}
    >
      {icon}
      {label}
    </motion.button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function HotspotDetailDrawer({
  hotspot,
  isOpen,
  onClose,
  onExportData,
  onShare,
  onAddToActionPlan,
  onApplyRecommendation,
}: HotspotDetailDrawerProps) {
  const [timePeriod, setTimePeriod] = useState<"7d" | "30d">("7d");
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);

  // Generate mock trend data based on hotspot
  const trendData: TrendDataPoint[] = useMemo(() => {
    if (!hotspot) return [];

    const days = timePeriod === "7d" ? 7 : 30;
    const baseValue = parseValueFromHotspot(hotspot.value);
    const trend = hotspot.trend || "stable";

    return generateMockTrendData(days, baseValue || 5, baseValue * 0.1 || 0.5, trend);
  }, [hotspot, timePeriod]);

  // Process recommendations with priorities
  const recommendations = useMemo(() => {
    if (!hotspot?.recommendations) return [];
    return assignRecommendationPriority(hotspot.recommendations, hotspot.severity);
  }, [hotspot]);

  const config = hotspot ? severityConfig[hotspot.severity] : severityConfig.low;

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleApplyRecommendation = useCallback(
    async (index: number) => {
      if (!hotspot || !onApplyRecommendation) return;

      setApplyingIndex(index);
      // Simulate async action
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onApplyRecommendation(hotspot, recommendations[index].text);
      setApplyingIndex(null);
    },
    [hotspot, onApplyRecommendation, recommendations]
  );

  const handleExport = useCallback(() => {
    if (hotspot && onExportData) {
      onExportData(hotspot);
    }
  }, [hotspot, onExportData]);

  const handleShare = useCallback(() => {
    if (hotspot && onShare) {
      onShare(hotspot);
    }
  }, [hotspot, onShare]);

  const handleAddToActionPlan = useCallback(() => {
    if (hotspot && onAddToActionPlan) {
      onAddToActionPlan(hotspot);
    }
  }, [hotspot, onAddToActionPlan]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && hotspot && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--background-tertiary)] shadow-2xl z-50 flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            {/* ================================================================
                HEADER SECTION
                ================================================================ */}
            <motion.header
              variants={sectionVariants}
              className="shrink-0 px-6 py-5 border-b border-[var(--border)] bg-[var(--background-tertiary)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Severity indicator with pulse for critical */}
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${config.bg}`} />
                      {(hotspot.severity === "critical" || hotspot.severity === "high") && (
                        <motion.div
                          animate={{
                            scale: [1, 1.8, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`absolute inset-0 rounded-full ${config.bg}`}
                        />
                      )}
                    </div>

                    <h2
                      id="drawer-title"
                      className="text-xl font-semibold text-[var(--foreground)] truncate"
                    >
                      {hotspot.label}
                    </h2>

                    {/* Severity badge */}
                    <span
                      className={`
                        shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize
                        ${config.bgLight} ${config.text}
                      `}
                    >
                      {hotspot.severity}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]">
                    <Icon name="mapPin" className="w-4 h-4 text-[var(--foreground-muted)]" />
                    <span>{hotspot.location}</span>
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="shrink-0 w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
                  aria-label="Close drawer"
                >
                  <Icon name="x" className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.header>

            {/* ================================================================
                SCROLLABLE CONTENT
                ================================================================ */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-6">
                {/* ============================================================
                    OVERVIEW STATS
                    ============================================================ */}
                <motion.section variants={sectionVariants}>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <Icon name="activity" className="w-4 h-4 text-[var(--accent)]" />
                    Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label="Current Value"
                      value={hotspot.value || "N/A"}
                      icon={<Icon name="target" className="w-4 h-4" />}
                      trend={hotspot.trend}
                      trendValue={hotspot.trendValue}
                    />
                    <StatCard
                      label="Data Points"
                      value={hotspot.dataPoints?.toLocaleString() || "N/A"}
                      icon={<Icon name="chart" className="w-4 h-4" />}
                    />
                  </div>

                  {/* Last updated */}
                  {hotspot.lastUpdated && (
                    <motion.div
                      variants={itemVariants}
                      className="mt-3 flex items-center gap-2 text-xs text-[var(--foreground-muted)]"
                    >
                      <Icon name="clock" className="w-3.5 h-3.5" />
                      Last updated: {hotspot.lastUpdated}
                    </motion.div>
                  )}
                </motion.section>

                {/* ============================================================
                    DESCRIPTION
                    ============================================================ */}
                {hotspot.description && (
                  <motion.section variants={sectionVariants}>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2 flex items-center gap-2">
                      <Icon name="info" className="w-4 h-4 text-[var(--accent)]" />
                      Analysis
                    </h3>
                    <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                      {hotspot.description}
                    </p>
                  </motion.section>
                )}

                {/* ============================================================
                    TREND CHART
                    ============================================================ */}
                <motion.section variants={sectionVariants}>
                  <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                    <Icon name="trendingUp" className="w-4 h-4 text-[var(--accent)]" />
                    Historical Trend
                  </h3>
                  <div className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)]">
                    <TrendChart
                      data={trendData}
                      height={180}
                      trend={hotspot.trend || "stable"}
                      unit={hotspot.value?.includes("C") ? "C" : ""}
                      timePeriod={timePeriod}
                      onTimePeriodChange={setTimePeriod}
                      showTooltip
                      animated
                    />
                  </div>
                </motion.section>

                {/* ============================================================
                    RECOMMENDATIONS PANEL
                    ============================================================ */}
                {recommendations.length > 0 && (
                  <motion.section variants={sectionVariants}>
                    <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
                      <Icon name="sparkles" className="w-4 h-4 text-[var(--accent)]" />
                      AI Recommendations
                      <span className="ml-auto text-xs font-normal text-[var(--foreground-muted)] bg-[var(--accent-bg)] px-2 py-0.5 rounded-full">
                        {recommendations.length} actions
                      </span>
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <RecommendationCard
                          key={index}
                          recommendation={rec}
                          index={index}
                          onApply={() => handleApplyRecommendation(index)}
                          isApplying={applyingIndex === index}
                        />
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            </div>

            {/* ================================================================
                FOOTER ACTIONS
                ================================================================ */}
            <motion.footer
              variants={sectionVariants}
              className="shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]"
            >
              <div className="grid grid-cols-3 gap-3 mb-3">
                <ActionButton
                  icon={<Icon name="download" className="w-4 h-4" />}
                  label="Export"
                  onClick={handleExport}
                />
                <ActionButton
                  icon={<Icon name="share" className="w-4 h-4" />}
                  label="Share"
                  onClick={handleShare}
                />
                <ActionButton
                  icon={<Icon name="clipboard" className="w-4 h-4" />}
                  label="Add to Plan"
                  onClick={handleAddToActionPlan}
                  variant="primary"
                />
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-[var(--foreground-muted)]">
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] font-mono text-[10px]">ESC</kbd> to close
              </p>
            </motion.footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default HotspotDetailDrawer;
