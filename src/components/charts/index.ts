// Existing charts
export { TrendChart, generateMockTrendData, type TrendDataPoint } from "./TrendChart";

// New interactive charts
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
  ChartTooltip,
  useChartTooltip,
  type TooltipData,
  type ChartTooltipProps,
} from "./ChartTooltip";
