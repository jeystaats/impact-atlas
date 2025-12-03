/**
 * Shared Chart Configuration
 *
 * This file contains common configuration, constants, and animation settings
 * used across all chart components for consistency.
 */

import type { Transition, Variants } from "framer-motion";

// =============================================================================
// COLOR PALETTES
// =============================================================================

/**
 * Default color palette for multi-series charts
 * Follows the design system accent colors
 */
export const CHART_COLORS = [
  "#0D9488", // teal (accent)
  "#3B82F6", // blue (info)
  "#10B981", // emerald (success)
  "#F59E0B", // amber (warning)
  "#EF4444", // red (danger)
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316", // orange
] as const;

/**
 * Trend-based color schemes
 */
export const TREND_COLORS = {
  up: {
    stroke: "#EF4444",
    fill: "#EF4444",
    bg: "rgba(239, 68, 68, 0.1)",
  },
  down: {
    stroke: "#10B981",
    fill: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
  },
  stable: {
    stroke: "#0D9488",
    fill: "#0D9488",
    bg: "rgba(13, 148, 136, 0.1)",
  },
} as const;

/**
 * Severity-based color schemes
 */
export const SEVERITY_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  critical: "#EF4444",
} as const;

// =============================================================================
// PADDING & DIMENSIONS
// =============================================================================

/**
 * Default chart padding (with axes)
 */
export const DEFAULT_CHART_PADDING = {
  top: 20,
  right: 20,
  bottom: 36,
  left: 48,
} as const;

/**
 * Compact chart padding (minimal or no axes)
 */
export const COMPACT_CHART_PADDING = {
  top: 12,
  right: 12,
  bottom: 12,
  left: 12,
} as const;

/**
 * Horizontal bar chart padding
 */
export const HORIZONTAL_CHART_PADDING = {
  top: 16,
  right: 48,
  bottom: 16,
  left: 100,
} as const;

/**
 * Default viewbox width for SVG charts
 */
export const DEFAULT_VIEWBOX_WIDTH = 400;

// =============================================================================
// ANIMATION SETTINGS
// =============================================================================

/**
 * Smooth spring transition for chart interactions
 */
export const SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

/**
 * Bouncy spring for emphasis animations
 */
export const BOUNCY_SPRING_TRANSITION: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

/**
 * Spring-like easing curve (for non-motion animations)
 */
export const SPRING_EASING: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

/**
 * Standard fade/scale animation for chart elements
 */
export const CHART_ELEMENT_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay,
      ease: SPRING_EASING,
    },
  }),
  exit: { opacity: 0, scale: 0 },
};

/**
 * Animation variants for bar charts (vertical)
 */
export const VERTICAL_BAR_VARIANTS: Variants = {
  hidden: { scaleY: 0, originY: 1 },
  visible: (i: number) => ({
    scaleY: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: SPRING_EASING,
    },
  }),
};

/**
 * Animation variants for bar charts (horizontal)
 */
export const HORIZONTAL_BAR_VARIANTS: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: {
      duration: 0.5,
      delay: i * 0.05,
      ease: SPRING_EASING,
    },
  }),
};

/**
 * Path drawing animation for line/area charts
 */
export const PATH_DRAW_VARIANTS: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: "easeOut",
    },
  },
};

/**
 * Fade in animation for area fills
 */
export const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.6,
      delay,
    },
  }),
};

/**
 * Pulse animation for data point highlights
 */
export const PULSE_ANIMATION = {
  scale: [1, 1.5, 1],
  opacity: [0.4, 0, 0.4],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeOut",
  },
};

// =============================================================================
// TOOLTIP SETTINGS
// =============================================================================

/**
 * Tooltip offset from pointer
 */
export const TOOLTIP_OFFSET = 12;

/**
 * Tooltip container padding
 */
export const TOOLTIP_PADDING = 8;

// =============================================================================
// STYLE UTILITIES
// =============================================================================

/**
 * Grid line default style
 */
export const GRID_LINE_STYLE = {
  stroke: "var(--border)",
  strokeWidth: 1,
  strokeDasharray: "4,4",
  opacity: 0.5,
} as const;

/**
 * Axis label default style
 */
export const AXIS_LABEL_STYLE = {
  fill: "var(--foreground-muted)",
  fontSize: 11,
  fontFamily: "var(--font-sans)",
} as const;

/**
 * Value label default style
 */
export const VALUE_LABEL_STYLE = {
  fill: "var(--foreground-secondary)",
  fontSize: 11,
  fontWeight: 600,
  fontFamily: "var(--font-sans)",
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Gets a color from the default palette by index (wraps around)
 */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Gets trend colors based on direction
 */
export function getTrendColors(trend: "up" | "down" | "stable") {
  return TREND_COLORS[trend];
}

/**
 * Gets padding configuration based on axis visibility
 */
export function getChartPadding(options: {
  showXAxis?: boolean;
  showYAxis?: boolean;
  orientation?: "vertical" | "horizontal";
}) {
  const { showXAxis = true, showYAxis = true, orientation = "vertical" } = options;

  if (orientation === "horizontal") {
    return HORIZONTAL_CHART_PADDING;
  }

  return {
    top: DEFAULT_CHART_PADDING.top,
    right: DEFAULT_CHART_PADDING.right,
    bottom: showXAxis ? DEFAULT_CHART_PADDING.bottom : COMPACT_CHART_PADDING.bottom,
    left: showYAxis ? DEFAULT_CHART_PADDING.left : COMPACT_CHART_PADDING.left,
  };
}
