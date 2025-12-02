"use client";

import { useState, useMemo, useId, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChartTooltip, type TooltipData } from "./ChartTooltip";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
  secondaryValue?: number;
}

export interface BarChartProps {
  /** Chart data */
  data: BarDataPoint[];
  /** Chart height in pixels */
  height?: number;
  /** Orientation: vertical (default) or horizontal */
  orientation?: "vertical" | "horizontal";
  /** Show interactive tooltip on hover */
  showTooltip?: boolean;
  /** Animate chart on mount */
  animated?: boolean;
  /** Show grid lines */
  showGrid?: boolean;
  /** Show value labels on bars */
  showValues?: boolean;
  /** Value label position */
  valuePosition?: "inside" | "outside" | "top";
  /** Show axis labels */
  showAxisLabels?: boolean;
  /** Value format function */
  formatValue?: (value: number) => string;
  /** Primary color */
  color?: string;
  /** Secondary color for grouped bars */
  secondaryColor?: string;
  /** Hover color */
  hoverColor?: string;
  /** Bar corner radius */
  barRadius?: number;
  /** Bar padding (0-1) */
  barPadding?: number;
  /** Custom class name */
  className?: string;
  /** Stagger animation delay between bars */
  staggerDelay?: number;
  /** Show secondary values (grouped bar chart) */
  grouped?: boolean;
  /** Callback when bar is clicked */
  onBarClick?: (data: BarDataPoint, index: number) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const DEFAULT_COLOR = "#0D9488";
const DEFAULT_SECONDARY_COLOR = "#3B82F6";
const DEFAULT_HOVER_COLOR = "#14B8A6";
const DEFAULT_PADDING = { top: 24, right: 16, bottom: 40, left: 48 };
const HORIZONTAL_PADDING = { top: 16, right: 48, bottom: 16, left: 100 };

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function calculateNiceScale(
  max: number,
  tickCount: number = 5
): { max: number; ticks: number[] } {
  if (max === 0) return { max: 10, ticks: [0, 2, 4, 6, 8, 10] };

  const roughStep = max / (tickCount - 1);
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const residual = roughStep / magnitude;

  let niceStep: number;
  if (residual <= 1.5) niceStep = 1 * magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let val = 0; val <= niceMax + niceStep * 0.1; val += niceStep) {
    ticks.push(Math.round(val * 1000) / 1000);
  }

  return { max: niceMax, ticks };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BarChart({
  data,
  height = 280,
  orientation = "vertical",
  showTooltip = true,
  animated = true,
  showGrid = true,
  showValues = true,
  valuePosition = "top",
  showAxisLabels = true,
  formatValue = (v) => v.toLocaleString(),
  color = DEFAULT_COLOR,
  secondaryColor = DEFAULT_SECONDARY_COLOR,
  hoverColor = DEFAULT_HOVER_COLOR,
  barRadius = 6,
  barPadding = 0.3,
  className,
  staggerDelay = 0.05,
  grouped = false,
  onBarClick,
}: BarChartProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredType, setHoveredType] = useState<"primary" | "secondary">("primary");
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

  const isHorizontal = orientation === "horizontal";
  const hasSecondary = grouped && data.some((d) => d.secondaryValue !== undefined);

  // Calculate chart dimensions and scales
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    const padding = isHorizontal ? HORIZONTAL_PADDING : DEFAULT_PADDING;
    const viewBoxWidth = 400;
    const viewBoxHeight = height;
    const chartWidth = viewBoxWidth - padding.left - padding.right;
    const chartHeight = viewBoxHeight - padding.top - padding.bottom;

    // Find max value
    let maxValue = Math.max(...data.map((d) => d.value));
    if (hasSecondary) {
      maxValue = Math.max(maxValue, ...data.map((d) => d.secondaryValue || 0));
    }

    const scale = calculateNiceScale(maxValue);

    // Calculate bar dimensions
    const barCount = data.length;
    const totalPadding = barPadding * barCount;
    const barGroupWidth = isHorizontal
      ? chartHeight / barCount
      : chartWidth / barCount;
    const barGap = barGroupWidth * barPadding;
    const actualBarGroupWidth = barGroupWidth - barGap;

    // For grouped bars, divide the group width
    const barWidth = hasSecondary ? actualBarGroupWidth / 2 - 2 : actualBarGroupWidth;

    const bars = data.map((d, i) => {
      const barX = isHorizontal
        ? padding.left
        : padding.left + i * barGroupWidth + barGap / 2;

      const barY = isHorizontal
        ? padding.top + i * barGroupWidth + barGap / 2
        : padding.top +
          chartHeight -
          (d.value / scale.max) * chartHeight;

      const barHeight = isHorizontal
        ? actualBarGroupWidth
        : (d.value / scale.max) * chartHeight;

      const barW = isHorizontal
        ? (d.value / scale.max) * chartWidth
        : barWidth;

      // Secondary bar for grouped charts
      let secondaryBar = null;
      if (hasSecondary && d.secondaryValue !== undefined) {
        const secValue = d.secondaryValue;
        secondaryBar = {
          x: isHorizontal
            ? padding.left
            : barX + barWidth + 4,
          y: isHorizontal
            ? barY + actualBarGroupWidth / 2 + 2
            : padding.top + chartHeight - (secValue / scale.max) * chartHeight,
          width: isHorizontal
            ? (secValue / scale.max) * chartWidth
            : barWidth,
          height: isHorizontal
            ? actualBarGroupWidth / 2 - 2
            : (secValue / scale.max) * chartHeight,
          value: secValue,
        };
      }

      return {
        ...d,
        x: barX,
        y: barY,
        width: barW,
        height: barHeight,
        secondaryBar,
      };
    });

    return {
      bars,
      scale,
      dimensions: {
        width: viewBoxWidth,
        height: viewBoxHeight,
        chartWidth,
        chartHeight,
        padding,
      },
    };
  }, [data, height, isHorizontal, barPadding, hasSecondary]);

  // Handle mouse interactions
  const handleBarHover = useCallback(
    (
      e: React.MouseEvent,
      index: number,
      type: "primary" | "secondary" = "primary"
    ) => {
      if (!showTooltip || !chartData || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const bar = chartData.bars[index];
      const value = type === "secondary" && bar.secondaryBar ? bar.secondaryBar.value : bar.value;

      // Calculate tooltip position
      const { dimensions } = chartData;
      let x: number, y: number;

      if (isHorizontal) {
        const barRight = type === "secondary" && bar.secondaryBar
          ? bar.secondaryBar.x + bar.secondaryBar.width
          : bar.x + bar.width;
        x = (barRight / dimensions.width) * rect.width;
        const barCenterY = type === "secondary" && bar.secondaryBar
          ? bar.secondaryBar.y + bar.secondaryBar.height / 2
          : bar.y + bar.height / 2;
        y = (barCenterY / dimensions.height) * rect.height;
      } else {
        const barCenterX = type === "secondary" && bar.secondaryBar
          ? bar.secondaryBar.x + bar.secondaryBar.width / 2
          : bar.x + bar.width / 2;
        x = (barCenterX / dimensions.width) * rect.width;
        const barTop = type === "secondary" && bar.secondaryBar
          ? bar.secondaryBar.y
          : bar.y;
        y = (barTop / dimensions.height) * rect.height;
      }

      setHoveredIndex(index);
      setHoveredType(type);
      setTooltip({
        visible: true,
        x,
        y,
        data: {
          label: bar.label,
          value: formatValue(value),
          color: type === "secondary" ? secondaryColor : bar.color || color,
          subtitle: hasSecondary
            ? type === "primary"
              ? "Primary"
              : "Secondary"
            : undefined,
        },
      });
    },
    [showTooltip, chartData, isHorizontal, formatValue, color, secondaryColor, hasSecondary]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleBarClick = useCallback(
    (index: number) => {
      if (onBarClick && chartData) {
        onBarClick(data[index], index);
      }
    },
    [onBarClick, data, chartData]
  );

  // Early return if no data
  if (!chartData || data.length === 0) {
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

  const { bars, scale, dimensions } = chartData;

  // Spring-like easing curve (exported for type safety)
  const springEasing: [number, number, number, number] = [0.34, 1.56, 0.64, 1];

  // Animation variants
  const barVariants = {
    hidden: isHorizontal
      ? { scaleX: 0, originX: 0 }
      : { scaleY: 0, originY: 1 },
    visible: (i: number) => ({
      scaleX: 1,
      scaleY: 1,
      transition: {
        duration: 0.5,
        delay: i * staggerDelay,
        ease: springEasing,
      },
    }),
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          {/* Gradient for bars */}
          <linearGradient
            id={`bar-gradient-${id}`}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? "100%" : "0%"}
            y2={isHorizontal ? "0%" : "100%"}
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient
            id={`bar-gradient-secondary-${id}`}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? "100%" : "0%"}
            y2={isHorizontal ? "0%" : "100%"}
          >
            <stop offset="0%" stopColor={secondaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient
            id={`bar-gradient-hover-${id}`}
            x1="0%"
            y1="0%"
            x2={isHorizontal ? "100%" : "0%"}
            y2={isHorizontal ? "0%" : "100%"}
          >
            <stop offset="0%" stopColor={hoverColor} stopOpacity="1" />
            <stop offset="100%" stopColor={hoverColor} stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="chart-grid">
            {scale.ticks.map((tick, i) => {
              if (isHorizontal) {
                const x =
                  dimensions.padding.left +
                  (tick / scale.max) * dimensions.chartWidth;
                return (
                  <line
                    key={`grid-${i}`}
                    x1={x}
                    y1={dimensions.padding.top}
                    x2={x}
                    y2={dimensions.padding.top + dimensions.chartHeight}
                    stroke="var(--border)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  />
                );
              } else {
                const y =
                  dimensions.padding.top +
                  dimensions.chartHeight -
                  (tick / scale.max) * dimensions.chartHeight;
                return (
                  <line
                    key={`grid-${i}`}
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
              }
            })}
          </g>
        )}

        {/* Axis labels */}
        {showAxisLabels && (
          <g className="axis-labels">
            {/* Value axis labels */}
            {scale.ticks.map((tick, i) => {
              if (isHorizontal) {
                const x =
                  dimensions.padding.left +
                  (tick / scale.max) * dimensions.chartWidth;
                return (
                  <text
                    key={`value-label-${i}`}
                    x={x}
                    y={dimensions.height - 4}
                    textAnchor="middle"
                    fill="var(--foreground-muted)"
                    fontSize="10"
                    fontFamily="var(--font-sans)"
                  >
                    {formatValue(tick)}
                  </text>
                );
              } else {
                const y =
                  dimensions.padding.top +
                  dimensions.chartHeight -
                  (tick / scale.max) * dimensions.chartHeight;
                return (
                  <text
                    key={`value-label-${i}`}
                    x={dimensions.padding.left - 8}
                    y={y}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="var(--foreground-muted)"
                    fontSize="10"
                    fontFamily="var(--font-sans)"
                  >
                    {formatValue(tick)}
                  </text>
                );
              }
            })}

            {/* Category labels */}
            {bars.map((bar, i) => {
              if (isHorizontal) {
                return (
                  <text
                    key={`cat-label-${i}`}
                    x={dimensions.padding.left - 8}
                    y={bar.y + bar.height / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="var(--foreground-secondary)"
                    fontSize="11"
                    fontFamily="var(--font-sans)"
                    className="truncate"
                  >
                    {bar.label.length > 12 ? bar.label.slice(0, 12) + "..." : bar.label}
                  </text>
                );
              } else {
                return (
                  <text
                    key={`cat-label-${i}`}
                    x={bar.x + bar.width / 2 + (hasSecondary ? bar.width / 2 + 2 : 0)}
                    y={dimensions.height - 8}
                    textAnchor="middle"
                    fill="var(--foreground-secondary)"
                    fontSize="10"
                    fontFamily="var(--font-sans)"
                  >
                    {bar.label.length > 8 ? bar.label.slice(0, 8) + "..." : bar.label}
                  </text>
                );
              }
            })}
          </g>
        )}

        {/* Primary Bars */}
        {bars.map((bar, i) => {
          const isHovered = hoveredIndex === i && hoveredType === "primary";
          const barFill = bar.color
            ? isHovered
              ? hoverColor
              : bar.color
            : isHovered
            ? `url(#bar-gradient-hover-${id})`
            : `url(#bar-gradient-${id})`;

          return (
            <motion.g key={`bar-group-${i}`}>
              {/* Primary bar */}
              <motion.rect
                x={bar.x}
                y={isHorizontal ? bar.y : bar.y}
                width={isHorizontal ? bar.width : bar.width}
                height={isHorizontal ? bar.height : bar.height}
                rx={barRadius}
                ry={barRadius}
                fill={barFill}
                custom={i}
                variants={barVariants}
                initial={shouldAnimate ? "hidden" : undefined}
                animate="visible"
                className={cn(
                  "transition-colors duration-200",
                  onBarClick && "cursor-pointer"
                )}
                style={{
                  transformOrigin: isHorizontal ? "left center" : "center bottom",
                }}
                onMouseEnter={(e) => handleBarHover(e, i, "primary")}
                onClick={() => handleBarClick(i)}
              />

              {/* Hover glow effect */}
              <AnimatePresence>
                {isHovered && (
                  <motion.rect
                    x={bar.x - 2}
                    y={isHorizontal ? bar.y - 2 : bar.y - 2}
                    width={isHorizontal ? bar.width + 4 : bar.width + 4}
                    height={isHorizontal ? bar.height + 4 : bar.height + 4}
                    rx={barRadius + 2}
                    ry={barRadius + 2}
                    fill="none"
                    stroke={bar.color || color}
                    strokeWidth="2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </AnimatePresence>
            </motion.g>
          );
        })}

        {/* Secondary Bars (for grouped charts) */}
        {hasSecondary &&
          bars.map((bar, i) => {
            if (!bar.secondaryBar) return null;
            const isHovered = hoveredIndex === i && hoveredType === "secondary";
            const secBar = bar.secondaryBar;

            return (
              <motion.g key={`sec-bar-group-${i}`}>
                <motion.rect
                  x={secBar.x}
                  y={secBar.y}
                  width={secBar.width}
                  height={secBar.height}
                  rx={barRadius}
                  ry={barRadius}
                  fill={
                    isHovered
                      ? `url(#bar-gradient-hover-${id})`
                      : `url(#bar-gradient-secondary-${id})`
                  }
                  custom={i}
                  variants={barVariants}
                  initial={shouldAnimate ? "hidden" : undefined}
                  animate="visible"
                  className="transition-colors duration-200"
                  style={{
                    transformOrigin: isHorizontal ? "left center" : "center bottom",
                  }}
                  onMouseEnter={(e) => handleBarHover(e, i, "secondary")}
                />

                {/* Hover glow effect */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.rect
                      x={secBar.x - 2}
                      y={secBar.y - 2}
                      width={secBar.width + 4}
                      height={secBar.height + 4}
                      rx={barRadius + 2}
                      ry={barRadius + 2}
                      fill="none"
                      stroke={secondaryColor}
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </motion.g>
            );
          })}

        {/* Value labels on bars */}
        {showValues &&
          bars.map((bar, i) => {
            const isHovered = hoveredIndex === i;
            let labelX: number, labelY: number;
            let textAnchor: "start" | "middle" | "end" = "middle";

            if (isHorizontal) {
              if (valuePosition === "inside") {
                labelX = bar.x + bar.width - 8;
                labelY = bar.y + bar.height / 2;
                textAnchor = "end";
              } else {
                labelX = bar.x + bar.width + 6;
                labelY = bar.y + bar.height / 2;
                textAnchor = "start";
              }
            } else {
              if (valuePosition === "inside") {
                labelX = bar.x + bar.width / 2;
                labelY = bar.y + 16;
              } else {
                labelX = bar.x + bar.width / 2;
                labelY = bar.y - 8;
              }
            }

            return (
              <motion.text
                key={`value-${i}`}
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                dominantBaseline="middle"
                fill={
                  valuePosition === "inside"
                    ? "white"
                    : "var(--foreground-secondary)"
                }
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-sans)"
                initial={shouldAnimate ? { opacity: 0 } : undefined}
                animate={{ opacity: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3, delay: i * staggerDelay + 0.3 }}
              >
                {formatValue(bar.value)}
              </motion.text>
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
        variant="default"
      />

      {/* Legend for grouped charts */}
      {hasSecondary && (
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-[var(--foreground-secondary)]">Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: secondaryColor }}
            />
            <span className="text-xs text-[var(--foreground-secondary)]">Secondary</span>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// UTILITY: Generate mock bar data
// =============================================================================

export function generateMockBarData(
  categories: string[],
  maxValue: number = 100,
  includeSecondary: boolean = false
): BarDataPoint[] {
  return categories.map((label) => ({
    label,
    value: Math.round(Math.random() * maxValue),
    secondaryValue: includeSecondary
      ? Math.round(Math.random() * maxValue)
      : undefined,
  }));
}
