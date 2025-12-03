// =============================================================================
// UNIFIED CHART SYSTEM
// =============================================================================

// Main unified Chart component (recommended for most use cases)
export { Chart, type ChartConfig, type ChartProps } from "./Chart";

// =============================================================================
// INDIVIDUAL CHART COMPONENTS (for advanced customization)
// =============================================================================

export {
  AreaChart,
  generateMockAreaData,
  type AreaDataPoint,
  type AreaSeries,
  type AreaChartProps,
} from "./AreaChart";

export {
  BarChart,
  generateMockBarData,
  type BarDataPoint,
  type BarChartProps,
} from "./BarChart";

export {
  DonutChart,
  generateMockDonutData,
  type DonutSegment,
  type DonutChartProps,
} from "./DonutChart";

export {
  TrendChart,
  generateMockTrendData,
  type TrendDataPoint,
} from "./TrendChart";

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

export {
  ChartTooltip,
  useChartTooltip,
  type TooltipData,
  type ChartTooltipProps,
} from "./ChartTooltip";

// =============================================================================
// UTILITIES & CONFIGURATION
// =============================================================================

export {
  // Scale calculations
  calculateNiceScale,
  calculateNiceMax,
  // Path generation
  generateSmoothPath,
  generateAreaPath,
  generateClosedPath,
  // Polar coordinates
  polarToCartesian,
  describeArc,
  // Value formatting
  formatNumber,
  formatCompactNumber,
  formatPercentage,
  // Math utilities
  clamp,
  lerp,
  mapRange,
  // Types
  type NiceScale,
  type Point,
} from "./chartUtils";

export {
  // Color palettes
  CHART_COLORS,
  TREND_COLORS,
  SEVERITY_COLORS,
  // Padding & dimensions
  DEFAULT_CHART_PADDING,
  COMPACT_CHART_PADDING,
  HORIZONTAL_CHART_PADDING,
  DEFAULT_VIEWBOX_WIDTH,
  // Animation settings
  SPRING_TRANSITION,
  BOUNCY_SPRING_TRANSITION,
  SPRING_EASING,
  CHART_ELEMENT_VARIANTS,
  VERTICAL_BAR_VARIANTS,
  HORIZONTAL_BAR_VARIANTS,
  PATH_DRAW_VARIANTS,
  FADE_IN_VARIANTS,
  PULSE_ANIMATION,
  // Tooltip settings
  TOOLTIP_OFFSET,
  TOOLTIP_PADDING,
  // Style utilities
  GRID_LINE_STYLE,
  AXIS_LABEL_STYLE,
  VALUE_LABEL_STYLE,
  // Helper functions
  getChartColor,
  getTrendColors,
  getChartPadding,
} from "./chartConfig";
