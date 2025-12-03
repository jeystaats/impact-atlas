"use client";

import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { AreaChart, type AreaChartProps, type AreaDataPoint, type AreaSeries } from "./AreaChart";
import { BarChart, type BarChartProps, type BarDataPoint } from "./BarChart";
import { DonutChart, type DonutChartProps, type DonutSegment } from "./DonutChart";
import { TrendChart, type TrendDataPoint } from "./TrendChart";

// =============================================================================
// TYPES
// =============================================================================

interface BaseChartProps {
  /** Chart height in pixels */
  height?: number;
  /** Show interactive tooltip on hover */
  showTooltip?: boolean;
  /** Animate chart on mount */
  animated?: boolean;
  /** Custom class name */
  className?: string;
}

interface AreaChartConfig extends BaseChartProps {
  type: "area";
  data?: AreaDataPoint[];
  series?: AreaSeries[];
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  stacked?: boolean;
  color?: string;
}

interface BarChartConfig extends BaseChartProps {
  type: "bar";
  data: BarDataPoint[];
  orientation?: "vertical" | "horizontal";
  showGrid?: boolean;
  showValues?: boolean;
  grouped?: boolean;
  color?: string;
  onBarClick?: (data: BarDataPoint, index: number) => void;
}

interface DonutChartConfig extends BaseChartProps {
  type: "donut";
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  showCenterLabel?: boolean;
  centerTitle?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  legendPosition?: "bottom" | "right";
  onSegmentClick?: (segment: DonutSegment, index: number) => void;
}

interface TrendChartConfig extends BaseChartProps {
  type: "trend";
  data: TrendDataPoint[];
  trend?: "up" | "down" | "stable";
  unit?: string;
  timePeriod?: "7d" | "30d";
  onTimePeriodChange?: (period: "7d" | "30d") => void;
}

export type ChartConfig =
  | AreaChartConfig
  | BarChartConfig
  | DonutChartConfig
  | TrendChartConfig;

export type ChartProps = ChartConfig;

// =============================================================================
// LOADING SKELETON
// =============================================================================

function ChartSkeleton({ height = 200, className }: { height?: number; className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--background-secondary)] rounded-xl",
        className
      )}
      style={{ height }}
    />
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function ChartEmptyState({ height = 200, className }: { height?: number; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center text-[var(--foreground-muted)] text-sm",
        className
      )}
      style={{ height }}
    >
      No data available
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Unified Chart Component
 *
 * A single entry point for all chart types with a consistent API.
 * Provides automatic loading states, empty states, and type-safe props.
 *
 * @example
 * ```tsx
 * // Area chart
 * <Chart type="area" data={areaData} height={300} />
 *
 * // Bar chart
 * <Chart type="bar" data={barData} orientation="horizontal" />
 *
 * // Donut chart
 * <Chart type="donut" data={donutData} showCenterLabel />
 *
 * // Trend chart
 * <Chart type="trend" data={trendData} trend="up" />
 * ```
 */
export function Chart(props: ChartProps) {
  const { type, className } = props;

  // Check for empty data
  const hasData = checkHasData(props);
  if (!hasData) {
    return <ChartEmptyState height={props.height} className={className} />;
  }

  return (
    <Suspense fallback={<ChartSkeleton height={props.height} className={className} />}>
      {type === "area" && <AreaChartWrapper {...props} />}
      {type === "bar" && <BarChartWrapper {...props} />}
      {type === "donut" && <DonutChartWrapper {...props} />}
      {type === "trend" && <TrendChartWrapper {...props} />}
    </Suspense>
  );
}

// =============================================================================
// CHART WRAPPERS
// =============================================================================

function AreaChartWrapper(props: AreaChartConfig) {
  const {
    type: _type,
    data,
    series,
    height = 240,
    showTooltip = true,
    animated = true,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    stacked = false,
    color,
    className,
  } = props;

  return (
    <AreaChart
      data={data}
      series={series}
      height={height}
      showTooltip={showTooltip}
      animated={animated}
      showGrid={showGrid}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      stacked={stacked}
      color={color}
      className={className}
    />
  );
}

function BarChartWrapper(props: BarChartConfig) {
  const {
    type: _type,
    data,
    height = 280,
    showTooltip = true,
    animated = true,
    orientation = "vertical",
    showGrid = true,
    showValues = true,
    grouped = false,
    color,
    className,
    onBarClick,
  } = props;

  return (
    <BarChart
      data={data}
      height={height}
      showTooltip={showTooltip}
      animated={animated}
      orientation={orientation}
      showGrid={showGrid}
      showValues={showValues}
      grouped={grouped}
      color={color}
      className={className}
      onBarClick={onBarClick}
    />
  );
}

function DonutChartWrapper(props: DonutChartConfig) {
  const {
    type: _type,
    data,
    height: _height,
    size = 200,
    showTooltip = true,
    animated = true,
    thickness = 0.35,
    showCenterLabel = true,
    centerTitle,
    centerValue,
    showLegend = true,
    legendPosition = "bottom",
    className,
    onSegmentClick,
  } = props;

  return (
    <DonutChart
      data={data}
      size={size}
      showTooltip={showTooltip}
      animated={animated}
      thickness={thickness}
      showCenterLabel={showCenterLabel}
      centerTitle={centerTitle}
      centerValue={centerValue}
      showLegend={showLegend}
      legendPosition={legendPosition}
      className={className}
      onSegmentClick={onSegmentClick}
    />
  );
}

function TrendChartWrapper(props: TrendChartConfig) {
  const {
    type: _type,
    data,
    height = 180,
    showTooltip = true,
    animated = true,
    trend = "stable",
    unit = "",
    timePeriod = "7d",
    className,
    onTimePeriodChange,
  } = props;

  return (
    <TrendChart
      data={data}
      height={height}
      showTooltip={showTooltip}
      animated={animated}
      trend={trend}
      unit={unit}
      timePeriod={timePeriod}
      onTimePeriodChange={onTimePeriodChange}
      className={className}
    />
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function checkHasData(props: ChartProps): boolean {
  switch (props.type) {
    case "area":
      return Boolean((props.data && props.data.length > 0) || (props.series && props.series.length > 0));
    case "bar":
      return Boolean(props.data && props.data.length > 0);
    case "donut":
      return Boolean(props.data && props.data.length > 0);
    case "trend":
      return Boolean(props.data && props.data.length >= 2);
    default:
      return false;
  }
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Export individual chart components for direct use when needed
export { AreaChart, BarChart, DonutChart, TrendChart };
export type { AreaChartProps, BarChartProps, DonutChartProps };
export type { AreaDataPoint, AreaSeries, BarDataPoint, DonutSegment, TrendDataPoint };
