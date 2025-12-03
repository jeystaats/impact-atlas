"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { HotspotData } from "@/data/hotspots";

// Extended hotspot data with additional fields for rich popup
export interface EnhancedHotspotData extends HotspotData {
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  lastUpdated?: string;
  dataPoints?: number;
}

interface MapPopupProps {
  hotspot: EnhancedHotspotData;
  onViewDetails?: (hotspot: EnhancedHotspotData) => void;
  onClose?: () => void;
  compact?: boolean;
}

// Severity configurations
const severityConfig = {
  low: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    color: "#10B981",
  },
  medium: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    color: "#F59E0B",
  },
  high: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    color: "#F97316",
  },
  critical: {
    bg: "bg-red-500",
    bgLight: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    color: "#EF4444",
  },
};

const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

// Staggered content reveal
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Full popup with rich data display
export function MapPopup({
  hotspot,
  onViewDetails,
  onClose: _onClose,
  compact = false,
}: MapPopupProps) {
  const config = severityConfig[hotspot.severity];

  if (compact) {
    return <MapPopupCompact hotspot={hotspot} />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-w-[280px] max-w-[320px]"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-start gap-3 mb-3"
      >
        {/* Severity indicator with pulse */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full mt-1.5 ${config.bg}`}
          />
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

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--foreground)] text-sm leading-tight">
            {hotspot.label}
          </h3>
          {hotspot.location && (
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5 flex items-center gap-1">
              <Icon name="mapPin" className="w-3 h-3" />
              {hotspot.location}
            </p>
          )}
        </div>

        {/* Severity badge */}
        <span
          className={`
            px-2 py-0.5 rounded-full text-xs font-medium capitalize
            ${config.bgLight} ${config.text}
          `}
        >
          {hotspot.severity}
        </span>
      </motion.div>

      {/* Value and Trend Row */}
      {(hotspot.value || hotspot.trend) && (
        <motion.div
          variants={itemVariants}
          className={`
            flex items-center justify-between p-3 rounded-lg mb-3
            ${config.bgLight} ${config.border} border
          `}
        >
          {hotspot.value && (
            <div>
              <p className="text-lg font-bold text-[var(--foreground)]">
                {hotspot.value}
              </p>
              <p className="text-xs text-[var(--foreground-muted)]">Current value</p>
            </div>
          )}

          {hotspot.trend && (
            <div className="flex items-center gap-1.5">
              <div
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${hotspot.trend === "up" ? "bg-red-100 text-red-600" :
                    hotspot.trend === "down" ? "bg-emerald-100 text-emerald-600" :
                    "bg-gray-100 text-gray-600"}
                `}
              >
                <Icon
                  name={hotspot.trend === "up" ? "trendingUp" :
                        hotspot.trend === "down" ? "trendingDown" : "minus"}
                  className="w-4 h-4"
                />
              </div>
              {hotspot.trendValue && (
                <span className="text-sm font-medium text-[var(--foreground-secondary)]">
                  {hotspot.trendValue}
                </span>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Description */}
      {hotspot.description && (
        <motion.p
          variants={itemVariants}
          className="text-xs text-[var(--foreground-secondary)] leading-relaxed mb-3"
        >
          {hotspot.description.length > 150
            ? `${hotspot.description.slice(0, 150)}...`
            : hotspot.description}
        </motion.p>
      )}

      {/* Meta info row */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 text-xs text-[var(--foreground-muted)] mb-3"
      >
        {hotspot.lastUpdated && (
          <span className="flex items-center gap-1">
            <Icon name="clock" className="w-3 h-3" />
            {hotspot.lastUpdated}
          </span>
        )}
        {hotspot.dataPoints && (
          <span className="flex items-center gap-1">
            <Icon name="activity" className="w-3 h-3" />
            {hotspot.dataPoints} data points
          </span>
        )}
      </motion.div>

      {/* Recommendations preview */}
      {hotspot.recommendations && hotspot.recommendations.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mb-3"
        >
          <p className="text-xs font-medium text-[var(--foreground)] mb-1.5 flex items-center gap-1">
            <Icon name="zap" className="w-3 h-3 text-[var(--accent)]" />
            Quick actions
          </p>
          <ul className="space-y-1">
            {hotspot.recommendations.slice(0, 2).map((rec, index) => (
              <li
                key={index}
                className="text-xs text-[var(--foreground-secondary)] pl-4 relative before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--accent-muted)]"
              >
                {rec.length > 50 ? `${rec.slice(0, 50)}...` : rec}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Action Button */}
      {onViewDetails && (
        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewDetails(hotspot)}
          className="
            w-full py-2 px-3 rounded-lg
            bg-[var(--accent)] text-white text-sm font-medium
            hover:bg-[var(--accent-dark)] transition-colors
            flex items-center justify-center gap-2
          "
        >
          View Details
          <Icon name="arrowRight" className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}

// Compact preview popup for hover state
interface MapPopupCompactProps {
  hotspot: EnhancedHotspotData;
}

export function MapPopupCompact({ hotspot }: MapPopupCompactProps) {
  const config = severityConfig[hotspot.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      transition={springTransition}
      className="min-w-[180px] max-w-[220px] p-2"
    >
      <div className="flex items-start gap-2">
        <div className={`w-2 h-2 rounded-full mt-1 ${config.bg}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--foreground)] text-xs truncate">
            {hotspot.label}
          </p>
          {hotspot.value && (
            <p className="text-sm font-semibold text-[var(--accent)] mt-0.5">
              {hotspot.value}
            </p>
          )}
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            Click for details
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Hover tooltip (even more minimal)
interface HoverTooltipProps {
  hotspot: EnhancedHotspotData;
}

export function HoverTooltip({ hotspot }: HoverTooltipProps) {
  const config = severityConfig[hotspot.severity];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="
        px-2.5 py-1.5 rounded-lg
        bg-[var(--foreground)] text-white text-xs font-medium
        shadow-lg whitespace-nowrap
      "
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span>{hotspot.label}</span>
        {hotspot.value && (
          <>
            <span className="opacity-50">|</span>
            <span className="text-[var(--accent-lighter)]">{hotspot.value}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
