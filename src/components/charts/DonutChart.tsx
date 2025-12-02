"use client";

import { useState, useMemo, useId, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChartTooltip, type TooltipData } from "./ChartTooltip";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
}

export interface DonutChartProps {
  /** Chart data segments */
  data: DonutSegment[];
  /** Chart size in pixels */
  size?: number;
  /** Donut thickness (0-1, percentage of radius) */
  thickness?: number;
  /** Show interactive tooltip on hover */
  showTooltip?: boolean;
  /** Animate chart on mount */
  animated?: boolean;
  /** Show center label */
  showCenterLabel?: boolean;
  /** Center label title */
  centerTitle?: string;
  /** Center label value */
  centerValue?: string | number;
  /** Center label subtitle */
  centerSubtitle?: string;
  /** Show legend */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: "bottom" | "right";
  /** Allow clicking segments to toggle visibility */
  interactive?: boolean;
  /** Value format function */
  formatValue?: (value: number, total: number) => string;
  /** Custom class name */
  className?: string;
  /** Gap between segments (degrees) */
  segmentGap?: number;
  /** Start angle (degrees, 0 = top) */
  startAngle?: number;
  /** Callback when segment is clicked */
  onSegmentClick?: (segment: DonutSegment, index: number) => void;
  /** Default colors palette */
  colors?: string[];
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
  "#84CC16", // lime
  "#F97316", // orange
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, outerRadius, endAngle);
  const end = polarToCartesian(x, y, outerRadius, startAngle);
  const innerStart = polarToCartesian(x, y, innerRadius, endAngle);
  const innerEnd = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  const d = [
    "M",
    start.x,
    start.y,
    "A",
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "L",
    innerEnd.x,
    innerEnd.y,
    "A",
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    innerStart.x,
    innerStart.y,
    "Z",
  ].join(" ");

  return d;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function DonutChart({
  data,
  size = 200,
  thickness = 0.35,
  showTooltip = true,
  animated = true,
  showCenterLabel = true,
  centerTitle,
  centerValue,
  centerSubtitle,
  showLegend = true,
  legendPosition = "bottom",
  interactive = true,
  formatValue = (value, total) => `${((value / total) * 100).toFixed(1)}%`,
  className,
  segmentGap = 2,
  startAngle = 0,
  onSegmentClick,
  colors = DEFAULT_COLORS,
}: DonutChartProps) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set());
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

  // Calculate chart geometry
  const chartData = useMemo(() => {
    if (data.length === 0) return null;

    // Filter out hidden segments
    const visibleData = data.filter((d) => !hiddenSegments.has(d.id));
    if (visibleData.length === 0) return null;

    const total = visibleData.reduce((sum, d) => sum + d.value, 0);
    const center = size / 2;
    const outerRadius = (size / 2) * 0.9;
    const innerRadius = outerRadius * (1 - thickness);

    // Calculate gap in degrees
    const totalGap = segmentGap * visibleData.length;
    const availableDegrees = 360 - totalGap;

    // Generate segments
    let currentAngle = startAngle;
    const segments = visibleData.map((segment, i) => {
      const percentage = segment.value / total;
      const sweepAngle = percentage * availableDegrees;

      const segmentStartAngle = currentAngle;
      const segmentEndAngle = currentAngle + sweepAngle;

      currentAngle = segmentEndAngle + segmentGap;

      // Calculate midpoint for label positioning
      const midAngle = segmentStartAngle + sweepAngle / 2;
      const labelRadius = (outerRadius + innerRadius) / 2;
      const labelPosition = polarToCartesian(center, center, labelRadius, midAngle);

      return {
        ...segment,
        color: segment.color || colors[i % colors.length],
        path: describeArc(
          center,
          center,
          outerRadius,
          innerRadius,
          segmentStartAngle,
          segmentEndAngle
        ),
        startAngle: segmentStartAngle,
        endAngle: segmentEndAngle,
        percentage,
        midAngle,
        labelPosition,
        originalIndex: data.findIndex((d) => d.id === segment.id),
      };
    });

    // Calculate total for center label
    const displayTotal = data.reduce((sum, d) => sum + d.value, 0);

    return {
      segments,
      total: displayTotal,
      visibleTotal: total,
      center,
      outerRadius,
      innerRadius,
    };
  }, [data, size, thickness, segmentGap, startAngle, hiddenSegments, colors]);

  // Handle segment hover
  const handleSegmentHover = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (!showTooltip || !chartData || !containerRef.current) return;

      const segment = chartData.segments[index];
      const rect = containerRef.current.getBoundingClientRect();

      // Calculate tooltip position at segment midpoint
      const tooltipRadius = (chartData.outerRadius + chartData.innerRadius) / 2;
      const tooltipPos = polarToCartesian(
        chartData.center,
        chartData.center,
        tooltipRadius,
        segment.midAngle
      );

      // Convert to pixel coordinates relative to container
      const x = (tooltipPos.x / size) * Math.min(rect.width, size);
      const y = (tooltipPos.y / size) * Math.min(rect.height, size);

      setHoveredIndex(index);
      setTooltip({
        visible: true,
        x,
        y,
        data: {
          label: segment.label,
          value: formatValue(segment.value, chartData.visibleTotal),
          color: segment.color,
          subtitle: segment.value.toLocaleString(),
        },
      });
    },
    [showTooltip, chartData, size, formatValue]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  // Handle legend click
  const handleLegendClick = useCallback(
    (segment: DonutSegment) => {
      if (!interactive) return;

      // Don't allow hiding all segments
      const newHidden = new Set(hiddenSegments);
      if (newHidden.has(segment.id)) {
        newHidden.delete(segment.id);
      } else {
        const visibleCount = data.filter((d) => !newHidden.has(d.id)).length;
        if (visibleCount > 1) {
          newHidden.add(segment.id);
        }
      }
      setHiddenSegments(newHidden);

      if (onSegmentClick) {
        const index = data.findIndex((d) => d.id === segment.id);
        onSegmentClick(segment, index);
      }
    },
    [interactive, hiddenSegments, data, onSegmentClick]
  );

  // Handle segment click
  const handleSegmentClick = useCallback(
    (index: number) => {
      if (!chartData || !onSegmentClick) return;
      const segment = chartData.segments[index];
      onSegmentClick(data[segment.originalIndex], segment.originalIndex);
    },
    [chartData, data, onSegmentClick]
  );

  // Early return if no data
  if (!chartData || chartData.segments.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-[var(--foreground-muted)] text-sm",
          className
        )}
        style={{ height: size }}
      >
        No data available
      </div>
    );
  }

  const { segments, center, outerRadius, innerRadius, total } = chartData;

  // Determine center label content
  const displayCenterValue = centerValue ?? total.toLocaleString();
  const displayCenterTitle = centerTitle ?? "Total";

  return (
    <div
      className={cn(
        "flex gap-6",
        legendPosition === "right" ? "flex-row items-center" : "flex-col items-center",
        className
      )}
    >
      {/* Chart */}
      <div
        ref={containerRef}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible"
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Drop shadow filter */}
            <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="var(--border)"
            strokeWidth={(outerRadius - innerRadius) * 0.9}
            strokeOpacity="0.3"
          />

          {/* Segments */}
          {segments.map((segment, i) => {
            const isHovered = hoveredIndex === i;
            const scale = isHovered ? 1.05 : 1;

            return (
              <motion.g
                key={segment.id}
                style={{ transformOrigin: `${center}px ${center}px` }}
              >
                <motion.path
                  d={segment.path}
                  fill={segment.color}
                  filter={isHovered ? `url(#shadow-${id})` : undefined}
                  initial={
                    shouldAnimate
                      ? {
                          scale: 0,
                          opacity: 0,
                        }
                      : undefined
                  }
                  animate={{
                    scale,
                    opacity: 1,
                  }}
                  transition={
                    shouldAnimate
                      ? {
                          scale: { type: "spring", stiffness: 300, damping: 25 },
                          opacity: { duration: 0.3 },
                          default: {
                            duration: 0.6,
                            delay: i * 0.1,
                            ease: [0.34, 1.56, 0.64, 1],
                          },
                        }
                      : {
                          scale: { type: "spring", stiffness: 300, damping: 25 },
                        }
                  }
                  className={cn(
                    "transition-[filter] duration-200",
                    onSegmentClick && "cursor-pointer"
                  )}
                  style={{ transformOrigin: `${center}px ${center}px` }}
                  onMouseEnter={(e) => handleSegmentHover(e, i)}
                  onClick={() => handleSegmentClick(i)}
                />

                {/* Hover highlight ring */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.path
                      d={segment.path}
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ transformOrigin: `${center}px ${center}px`, scale }}
                    />
                  )}
                </AnimatePresence>
              </motion.g>
            );
          })}

          {/* Center label */}
          {showCenterLabel && (
            <motion.g
              initial={shouldAnimate ? { opacity: 0, scale: 0.8 } : undefined}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: segments.length * 0.1 + 0.2 }}
            >
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={innerRadius * 0.85}
                fill="var(--background-tertiary)"
              />

              {/* Title */}
              <text
                x={center}
                y={center - 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--foreground-muted)"
                fontSize="11"
                fontWeight="500"
                fontFamily="var(--font-sans)"
              >
                {displayCenterTitle}
              </text>

              {/* Value */}
              <text
                x={center}
                y={center + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--foreground)"
                fontSize="20"
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {displayCenterValue}
              </text>

              {/* Subtitle */}
              {centerSubtitle && (
                <text
                  x={center}
                  y={center + 28}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--foreground-muted)"
                  fontSize="10"
                  fontFamily="var(--font-sans)"
                >
                  {centerSubtitle}
                </text>
              )}
            </motion.g>
          )}
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
      </div>

      {/* Legend */}
      {showLegend && (
        <motion.div
          className={cn(
            "flex flex-wrap gap-3",
            legendPosition === "right" ? "flex-col" : "justify-center"
          )}
          initial={shouldAnimate ? { opacity: 0, y: 10 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: segments.length * 0.1 + 0.3 }}
        >
          {data.map((segment, i) => {
            const isHidden = hiddenSegments.has(segment.id);
            const color = segment.color || colors[i % colors.length];

            return (
              <motion.button
                key={segment.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded-md transition-all duration-200",
                  interactive && "hover:bg-[var(--background-secondary)] cursor-pointer",
                  isHidden && "opacity-40"
                )}
                onClick={() => handleLegendClick(segment)}
                whileHover={interactive ? { scale: 1.02 } : undefined}
                whileTap={interactive ? { scale: 0.98 } : undefined}
              >
                <span
                  className={cn(
                    "w-3 h-3 rounded-full transition-transform duration-200",
                    isHidden && "scale-75"
                  )}
                  style={{ backgroundColor: color }}
                />
                <span
                  className={cn(
                    "text-xs text-[var(--foreground-secondary)] transition-colors",
                    isHidden && "line-through"
                  )}
                >
                  {segment.label}
                </span>
                <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
                  {formatValue(segment.value, total)}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// =============================================================================
// UTILITY: Generate mock donut data
// =============================================================================

export function generateMockDonutData(
  labels: string[],
  maxValue: number = 100
): DonutSegment[] {
  return labels.map((label, i) => ({
    id: `segment-${i}`,
    label,
    value: Math.round(Math.random() * maxValue) + 10,
  }));
}
