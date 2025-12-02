"use client";

import { useState, useMemo, useId, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  height?: number;
  trend?: "up" | "down" | "stable";
  unit?: string;
  showTooltip?: boolean;
  animated?: boolean;
  timePeriod?: "7d" | "30d";
  onTimePeriodChange?: (period: "7d" | "30d") => void;
  className?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: TrendDataPoint | null;
  index: number;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const CHART_PADDING = { top: 20, right: 20, bottom: 32, left: 20 };

const trendColors = {
  up: { stroke: "#EF4444", fill: "#EF4444", bg: "rgba(239, 68, 68, 0.1)" },
  down: { stroke: "#10B981", fill: "#10B981", bg: "rgba(16, 185, 129, 0.1)" },
  stable: { stroke: "#0D9488", fill: "#0D9488", bg: "rgba(13, 148, 136, 0.1)" },
};

// Spring animation for smooth interactions
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateSmoothPath(
  points: { x: number; y: number }[],
  closed = false,
  height = 0
): string {
  if (points.length < 2) return "";

  let pathD = `M ${points[0].x} ${points[0].y}`;

  // Use cardinal spline for smoother curves
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Tension factor for curve smoothness
    const tension = 0.3;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  if (closed && height) {
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    pathD += ` L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`;
  }

  return pathD;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface TimePeriodSelectorProps {
  value: "7d" | "30d";
  onChange: (period: "7d" | "30d") => void;
}

function TimePeriodSelector({ value, onChange }: TimePeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-[var(--background-secondary)] rounded-lg">
      {(["7d", "30d"] as const).map((period) => (
        <motion.button
          key={period}
          onClick={() => onChange(period)}
          className={`
            relative px-3 py-1 text-xs font-medium rounded-md transition-colors
            ${value === period
              ? "text-[var(--foreground)]"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]"
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {value === period && (
            <motion.div
              layoutId="timePeriodIndicator"
              className="absolute inset-0 bg-white rounded-md shadow-sm"
              transition={springTransition}
            />
          )}
          <span className="relative z-10">{period === "7d" ? "7 Days" : "30 Days"}</span>
        </motion.button>
      ))}
    </div>
  );
}

interface ChartTooltipProps {
  tooltip: TooltipState;
  unit?: string;
  colors: typeof trendColors.up;
}

function ChartTooltip({ tooltip, unit, colors }: ChartTooltipProps) {
  if (!tooltip.visible || !tooltip.data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute pointer-events-none z-20"
      style={{
        left: tooltip.x,
        top: tooltip.y - 60,
        transform: "translateX(-50%)",
      }}
    >
      <div className="bg-[var(--foreground)] text-white px-3 py-2 rounded-lg shadow-xl">
        <p className="text-xs text-white/70 mb-0.5">{tooltip.data.date}</p>
        <p className="text-sm font-semibold" style={{ color: colors.fill }}>
          {tooltip.data.value.toFixed(1)}{unit}
        </p>
        {tooltip.data.label && (
          <p className="text-xs text-white/60 mt-0.5">{tooltip.data.label}</p>
        )}
      </div>
      {/* Tooltip arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-[var(--foreground)]"
      />
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TrendChart({
  data,
  height = 180,
  trend = "stable",
  unit = "",
  showTooltip = true,
  animated = true,
  timePeriod = "7d",
  onTimePeriodChange,
  className = "",
}: TrendChartProps) {
  const id = useId();
  const gradientId = `trend-gradient-${id}`;
  const gridId = `trend-grid-${id}`;

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
    index: -1,
  });
  const [isHovering, setIsHovering] = useState(false);

  const colors = trendColors[trend];

  // Calculate chart dimensions and points
  const chartData = useMemo(() => {
    if (data.length < 2) return null;

    const width = 100; // Percentage-based for responsiveness
    const chartWidth = width;
    const chartHeight = height - CHART_PADDING.top - CHART_PADDING.bottom;

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    // Add 10% padding to the range for visual breathing room
    const paddedMin = min - range * 0.1;
    const paddedMax = max + range * 0.1;
    const paddedRange = paddedMax - paddedMin;

    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * chartWidth,
      y: CHART_PADDING.top + chartHeight - ((d.value - paddedMin) / paddedRange) * chartHeight,
      data: d,
    }));

    // Generate Y-axis labels
    const yLabels = [
      { value: paddedMax, y: CHART_PADDING.top },
      { value: (paddedMax + paddedMin) / 2, y: CHART_PADDING.top + chartHeight / 2 },
      { value: paddedMin, y: CHART_PADDING.top + chartHeight },
    ];

    return { points, yLabels, chartWidth, chartHeight };
  }, [data, height]);

  // Handle mouse movement for tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!showTooltip || !chartData) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;

      // Find the closest data point
      const closestIndex = Math.round((x / 100) * (data.length - 1));
      const clampedIndex = Math.max(0, Math.min(data.length - 1, closestIndex));

      if (clampedIndex !== tooltip.index) {
        const point = chartData.points[clampedIndex];
        setTooltip({
          visible: true,
          x: (point.x / 100) * rect.width,
          y: point.y,
          data: data[clampedIndex],
          index: clampedIndex,
        });
      }
    },
    [chartData, data, showTooltip, tooltip.index]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
    setIsHovering(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  if (!chartData || data.length < 2) {
    return (
      <div
        className={`flex items-center justify-center text-[var(--foreground-muted)] text-sm ${className}`}
        style={{ height }}
      >
        Not enough data to display
      </div>
    );
  }

  const { points, chartHeight } = chartData;
  const linePath = generateSmoothPath(points.map((p) => ({ x: p.x, y: p.y })));
  const fillPath = generateSmoothPath(
    points.map((p) => ({ x: p.x, y: p.y })),
    true,
    height - CHART_PADDING.bottom
  );

  return (
    <div className={`relative ${className}`}>
      {/* Time period selector */}
      {onTimePeriodChange && (
        <div className="flex justify-end mb-3">
          <TimePeriodSelector value={timePeriod} onChange={onTimePeriodChange} />
        </div>
      )}

      {/* Chart container */}
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <defs>
            {/* Gradient fill */}
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.fill} stopOpacity="0.25" />
              <stop offset="50%" stopColor={colors.fill} stopOpacity="0.1" />
              <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
            </linearGradient>

            {/* Grid pattern */}
            <pattern id={gridId} width="25" height={chartHeight / 4} patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1={chartHeight / 4}
                x2="100"
                y2={chartHeight / 4}
                stroke="var(--border)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            </pattern>
          </defs>

          {/* Background grid lines */}
          <g opacity="0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="0"
                y1={CHART_PADDING.top + (chartHeight / 4) * i}
                x2="100"
                y2={CHART_PADDING.top + (chartHeight / 4) * i}
                stroke="var(--border)"
                strokeWidth="0.3"
                strokeDasharray="1,3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>

          {/* Gradient fill under the line */}
          <motion.path
            d={fillPath}
            fill={`url(#${gradientId})`}
            initial={animated ? { opacity: 0 } : undefined}
            animate={animated ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.2 }}
          />

          {/* Main line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
            animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Data point dots (visible on hover) */}
          <AnimatePresence>
            {isHovering &&
              points.map((point, i) => (
                <motion.circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={tooltip.index === i ? 5 : 3}
                  fill={tooltip.index === i ? colors.stroke : "white"}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    r: tooltip.index === i ? 5 : 3,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={springTransition}
                />
              ))}
          </AnimatePresence>

          {/* Vertical hover line */}
          <AnimatePresence>
            {tooltip.visible && tooltip.data && (
              <motion.line
                x1={points[tooltip.index].x}
                y1={CHART_PADDING.top}
                x2={points[tooltip.index].x}
                y2={height - CHART_PADDING.bottom}
                stroke={colors.stroke}
                strokeWidth="1"
                strokeDasharray="4,4"
                vectorEffect="non-scaling-stroke"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* End point glow */}
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={4}
            fill={colors.stroke}
            initial={animated ? { scale: 0, opacity: 0 } : undefined}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: 1 }}
          />
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={8}
            fill={colors.stroke}
            initial={animated ? { scale: 0, opacity: 0 } : undefined}
            animate={
              animated
                ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }
                : undefined
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1.2,
            }}
          />
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[10px] text-[var(--foreground-muted)]">
          {data.length > 0 && (
            <>
              <span>{data[0].date}</span>
              {data.length > 2 && (
                <span>{data[Math.floor(data.length / 2)].date}</span>
              )}
              <span>{data[data.length - 1].date}</span>
            </>
          )}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {tooltip.visible && tooltip.data && (
            <ChartTooltip tooltip={tooltip} unit={unit} colors={colors} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// =============================================================================
// UTILITY: Generate mock trend data
// =============================================================================

export function generateMockTrendData(
  days: number,
  baseValue: number,
  volatility: number,
  trend: "up" | "down" | "stable"
): TrendDataPoint[] {
  const data: TrendDataPoint[] = [];
  let currentValue = baseValue;

  const trendFactor = trend === "up" ? 0.02 : trend === "down" ? -0.02 : 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    // Add some randomness
    const randomChange = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + trendFactor) + randomChange;

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(0, currentValue),
    });
  }

  return data;
}
