"use client";

import { useState, useMemo, useId, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChartTooltip, type TooltipData } from "./ChartTooltip";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface AreaDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export interface AreaSeries {
  id: string;
  name: string;
  data: AreaDataPoint[];
  color?: string;
  gradient?: { from: string; to: string };
}

export interface AreaChartProps {
  /** Single series data (use this OR series, not both) */
  data?: AreaDataPoint[];
  /** Multiple series data */
  series?: AreaSeries[];
  /** Chart height in pixels */
  height?: number;
  /** Show interactive tooltip on hover */
  showTooltip?: boolean;
  /** Animate chart on mount */
  animated?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show X-axis labels */
  showXAxis?: boolean;
  /** Show Y-axis labels */
  showYAxis?: boolean;
  /** Y-axis label format function */
  formatYLabel?: (value: number) => string;
  /** X-axis label format function */
  formatXLabel?: (value: string | number) => string;
  /** Value format function for tooltip */
  formatValue?: (value: number) => string;
  /** Primary color (for single series) */
  color?: string;
  /** Gradient colors (for single series) */
  gradient?: { from: string; to: string };
  /** Custom class name */
  className?: string;
  /** Curve tension (0-1, higher = smoother) */
  curveTension?: number;
  /** Number of Y-axis ticks */
  yTicks?: number;
  /** Stacked area chart */
  stacked?: boolean;
}

interface ChartDimensions {
  width: number;
  height: number;
  chartWidth: number;
  chartHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

interface ProcessedPoint {
  x: number;
  y: number;
  dataX: string | number;
  dataY: number;
  seriesIndex: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_COLORS = [
  "#0D9488", // teal (accent)
  "#3B82F6", // blue (info)
  "#10B981", // emerald (success)
  "#F59E0B", // amber (warning)
  "#EF4444", // red (danger)
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
];

const DEFAULT_PADDING = { top: 20, right: 20, bottom: 36, left: 48 };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateSmoothPath(
  points: { x: number; y: number }[],
  tension: number = 0.3
): string {
  if (points.length < 2) return "";

  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return pathD;
}

function generateAreaPath(
  points: { x: number; y: number }[],
  baseY: number,
  tension: number = 0.3
): string {
  if (points.length < 2) return "";

  const linePath = generateSmoothPath(points, tension);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];

  return `${linePath} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;
}

function calculateNiceScale(
  min: number,
  max: number,
  tickCount: number
): { min: number; max: number; ticks: number[] } {
  const range = max - min || 1;
  const roughStep = range / (tickCount - 1);

  // Find nice step size
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = niceMin; val <= niceMax + niceStep * 0.1; val += niceStep) {
    ticks.push(Math.round(val * 1000) / 1000);
  }

  return { min: niceMin, max: niceMax, ticks };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AreaChart({
  data,
  series,
  height = 240,
  showTooltip = true,
  animated = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  formatYLabel = (v) => v.toLocaleString(),
  formatXLabel = (v) => String(v),
  formatValue = (v) => v.toLocaleString(),
  color = DEFAULT_COLORS[0],
  gradient,
  className,
  curveTension = 0.3,
  yTicks = 5,
  stacked = false,
}: AreaChartProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: TooltipData | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  // Normalize data to series format
  const normalizedSeries = useMemo((): AreaSeries[] => {
    if (series) return series;
    if (data) {
      return [
        {
          id: "default",
          name: "Value",
          data,
          color,
          gradient,
        },
      ];
    }
    return [];
  }, [data, series, color, gradient]);

  // Calculate chart dimensions and data bounds
  const chartData = useMemo(() => {
    if (normalizedSeries.length === 0) return null;

    const padding = {
      ...DEFAULT_PADDING,
      left: showYAxis ? DEFAULT_PADDING.left : 12,
      bottom: showXAxis ? DEFAULT_PADDING.bottom : 12,
    };

    // Use percentage-based width for responsiveness
    const viewBoxWidth = 400;
    const viewBoxHeight = height;
    const chartWidth = viewBoxWidth - padding.left - padding.right;
    const chartHeight = viewBoxHeight - padding.top - padding.bottom;

    // Collect all data points
    const allPoints = normalizedSeries.flatMap((s) => s.data);
    const allY = allPoints.map((d) => d.y);

    let minY = Math.min(...allY);
    let maxY = Math.max(...allY);

    // For stacked charts, calculate cumulative max
    if (stacked && normalizedSeries.length > 1) {
      const xValues = new Set(allPoints.map((p) => p.x));
      xValues.forEach((xVal) => {
        const sum = normalizedSeries.reduce((acc, s) => {
          const point = s.data.find((d) => d.x === xVal);
          return acc + (point?.y || 0);
        }, 0);
        maxY = Math.max(maxY, sum);
      });
      minY = 0;
    }

    // Ensure we include 0 if data is all positive
    if (minY > 0) minY = 0;

    const scale = calculateNiceScale(minY, maxY, yTicks);

    // Process points for each series
    const firstSeries = normalizedSeries[0];
    const xCount = firstSeries.data.length;

    const processedSeries = normalizedSeries.map((s, seriesIndex) => {
      const points: ProcessedPoint[] = s.data.map((d, i) => {
        let yValue = d.y;

        // For stacked charts, add previous series values
        if (stacked && seriesIndex > 0) {
          for (let j = 0; j < seriesIndex; j++) {
            const prevPoint = normalizedSeries[j].data[i];
            if (prevPoint) yValue += prevPoint.y;
          }
        }

        return {
          x: padding.left + (i / (xCount - 1 || 1)) * chartWidth,
          y: padding.top + chartHeight - ((yValue - scale.min) / (scale.max - scale.min)) * chartHeight,
          dataX: d.x,
          dataY: d.y,
          seriesIndex,
        };
      });

      return {
        ...s,
        points,
        color: s.color || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length],
        gradient: s.gradient || {
          from: s.color || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length],
          to: s.color || DEFAULT_COLORS[seriesIndex % DEFAULT_COLORS.length],
        },
      };
    });

    // Get X-axis labels
    const xLabels = firstSeries.data.map((d) => d.x);

    return {
      series: processedSeries,
      scale,
      xLabels,
      dimensions: {
        width: viewBoxWidth,
        height: viewBoxHeight,
        chartWidth,
        chartHeight,
        padding,
      },
      baseY: padding.top + chartHeight,
    };
  }, [normalizedSeries, height, showXAxis, showYAxis, yTicks, stacked]);

  // Handle mouse interactions
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!showTooltip || !chartData || !containerRef.current) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const { padding, chartWidth, width } = chartData.dimensions;

      // Calculate position in viewBox coordinates
      const mouseX = ((e.clientX - rect.left) / rect.width) * width;
      const relativeX = mouseX - padding.left;

      // Find closest data point index
      const dataLength = chartData.series[0].points.length;
      const index = Math.round((relativeX / chartWidth) * (dataLength - 1));
      const clampedIndex = Math.max(0, Math.min(dataLength - 1, index));

      if (clampedIndex !== hoveredIndex) {
        setHoveredIndex(clampedIndex);

        // Build tooltip data
        const tooltipItems = chartData.series.map((s) => ({
          label: s.name,
          value: formatValue(s.points[clampedIndex].dataY),
          color: s.color,
        }));

        const point = chartData.series[0].points[clampedIndex];

        // Convert viewBox coordinates to pixel coordinates
        const pixelX = (point.x / width) * rect.width;
        const pixelY = (point.y / chartData.dimensions.height) * rect.height;

        setTooltip({
          visible: true,
          x: pixelX,
          y: pixelY,
          data: {
            label: formatXLabel(point.dataX),
            value: tooltipItems.length === 1 ? formatValue(point.dataY) : "",
            items: tooltipItems.length > 1 ? tooltipItems : undefined,
          },
        });
      }
    },
    [showTooltip, chartData, hoveredIndex, formatXLabel, formatValue]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Early return if no data
  if (!chartData || chartData.series.length === 0) {
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

  const { series: processedSeries, scale, xLabels, dimensions, baseY } = chartData;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradients for each series */}
          {processedSeries.map((s, i) => (
            <linearGradient
              key={`gradient-${s.id}`}
              id={`area-gradient-${id}-${i}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={s.gradient?.from || s.color} stopOpacity="0.4" />
              <stop offset="50%" stopColor={s.gradient?.to || s.color} stopOpacity="0.15" />
              <stop offset="100%" stopColor={s.gradient?.to || s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="chart-grid">
            {/* Horizontal grid lines */}
            {scale.ticks.map((tick, i) => {
              const y =
                dimensions.padding.top +
                dimensions.chartHeight -
                ((tick - scale.min) / (scale.max - scale.min)) * dimensions.chartHeight;
              return (
                <line
                  key={`h-grid-${i}`}
                  x1={dimensions.padding.left}
                  y1={y}
                  x2={dimensions.padding.left + dimensions.chartWidth}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
              );
            })}
          </g>
        )}

        {/* Y-axis labels */}
        {showYAxis && (
          <g className="y-axis">
            {scale.ticks.map((tick, i) => {
              const y =
                dimensions.padding.top +
                dimensions.chartHeight -
                ((tick - scale.min) / (scale.max - scale.min)) * dimensions.chartHeight;
              return (
                <text
                  key={`y-label-${i}`}
                  x={dimensions.padding.left - 8}
                  y={y}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="var(--foreground-muted)"
                  fontSize="11"
                  fontFamily="var(--font-sans)"
                >
                  {formatYLabel(tick)}
                </text>
              );
            })}
          </g>
        )}

        {/* X-axis labels */}
        {showXAxis && xLabels.length > 0 && (
          <g className="x-axis">
            {/* Show first, middle, and last labels for cleaner display */}
            {[0, Math.floor(xLabels.length / 2), xLabels.length - 1]
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .map((index) => {
                const x =
                  dimensions.padding.left +
                  (index / (xLabels.length - 1 || 1)) * dimensions.chartWidth;
                return (
                  <text
                    key={`x-label-${index}`}
                    x={x}
                    y={dimensions.height - 8}
                    textAnchor="middle"
                    fill="var(--foreground-muted)"
                    fontSize="11"
                    fontFamily="var(--font-sans)"
                  >
                    {formatXLabel(xLabels[index])}
                  </text>
                );
              })}
          </g>
        )}

        {/* Area fills - render in reverse order for stacked charts */}
        {[...processedSeries].reverse().map((s, reverseIndex) => {
          const i = processedSeries.length - 1 - reverseIndex;
          const points = s.points.map((p) => ({ x: p.x, y: p.y }));

          // For stacked charts, use previous series as base
          let stackedBaseY = baseY;
          if (stacked && i > 0) {
            // Get the previous series points as base
            const prevSeries = processedSeries[i - 1];
            const prevPoints = prevSeries.points.map((p) => ({ x: p.x, y: p.y }));

            // Create a path that fills between this series and the previous
            const areaPath = generateSmoothPath(points, curveTension);
            const reversePrevPath = [...prevPoints]
              .reverse()
              .map((p, idx) => (idx === 0 ? `L ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
              .join(" ");

            return (
              <motion.path
                key={`area-${s.id}`}
                d={`${areaPath} ${reversePrevPath} Z`}
                fill={`url(#area-gradient-${id}-${i})`}
                initial={shouldAnimate ? { opacity: 0 } : undefined}
                animate={shouldAnimate ? { opacity: 1 } : undefined}
                transition={{ duration: 0.6, delay: 0.1 * i }}
              />
            );
          }

          const areaPath = generateAreaPath(points, stackedBaseY, curveTension);

          return (
            <motion.path
              key={`area-${s.id}`}
              d={areaPath}
              fill={`url(#area-gradient-${id}-${i})`}
              initial={shouldAnimate ? { opacity: 0 } : undefined}
              animate={shouldAnimate ? { opacity: 1 } : undefined}
              transition={{ duration: 0.6, delay: 0.1 * i }}
            />
          );
        })}

        {/* Lines */}
        {processedSeries.map((s, i) => {
          const points = s.points.map((p) => ({ x: p.x, y: p.y }));
          const linePath = generateSmoothPath(points, curveTension);

          return (
            <motion.path
              key={`line-${s.id}`}
              d={linePath}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : undefined}
              animate={shouldAnimate ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 1.2, delay: 0.1 * i, ease: "easeOut" }}
            />
          );
        })}

        {/* Hover indicator line */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.line
              x1={processedSeries[0].points[hoveredIndex].x}
              y1={dimensions.padding.top}
              x2={processedSeries[0].points[hoveredIndex].x}
              y2={baseY}
              stroke="var(--foreground-muted)"
              strokeWidth="1"
              strokeDasharray="4,4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>

        {/* Data points on hover */}
        <AnimatePresence>
          {hoveredIndex !== null &&
            processedSeries.map((s) => {
              const point = s.points[hoveredIndex];
              return (
                <motion.g key={`point-${s.id}`}>
                  {/* Glow effect */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={12}
                    fill={s.color}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                  {/* Point */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r={5}
                    fill="var(--background-tertiary)"
                    stroke={s.color}
                    strokeWidth="2.5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                </motion.g>
              );
            })}
        </AnimatePresence>

        {/* End point indicators */}
        {processedSeries.map((s) => {
          const lastPoint = s.points[s.points.length - 1];
          return (
            <motion.g key={`end-${s.id}`}>
              <motion.circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={4}
                fill={s.color}
                initial={shouldAnimate ? { scale: 0, opacity: 0 } : undefined}
                animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
                transition={{ duration: 0.3, delay: 1.3 }}
              />
              {/* Pulse effect */}
              <motion.circle
                cx={lastPoint.x}
                cy={lastPoint.y}
                r={4}
                fill={s.color}
                initial={shouldAnimate ? { scale: 0, opacity: 0 } : undefined}
                animate={
                  shouldAnimate
                    ? {
                        scale: [1, 2, 1],
                        opacity: [0.4, 0, 0.4],
                      }
                    : undefined
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 1.5,
                  ease: "easeOut",
                }}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <ChartTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        data={tooltip.data}
        containerRef={containerRef}
        variant={processedSeries.length > 1 ? "detailed" : "default"}
      />

      {/* Legend for multiple series */}
      {processedSeries.length > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          {processedSeries.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-[var(--foreground-secondary)]">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// UTILITY: Generate mock area data
// =============================================================================

export function generateMockAreaData(
  points: number,
  baseValue: number = 100,
  volatility: number = 20,
  trend: "up" | "down" | "stable" = "stable"
): AreaDataPoint[] {
  const data: AreaDataPoint[] = [];
  let currentValue = baseValue;
  const trendFactor = trend === "up" ? 0.02 : trend === "down" ? -0.02 : 0;

  for (let i = 0; i < points; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (points - 1 - i));

    const randomChange = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + trendFactor) + randomChange;

    data.push({
      x: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      y: Math.max(0, Math.round(currentValue * 10) / 10),
    });
  }

  return data;
}
