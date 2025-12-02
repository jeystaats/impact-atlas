"use client";

import { useMemo, useId } from "react";
import { motion } from "framer-motion";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  trend?: "up" | "down" | "neutral";
  className?: string;
  animated?: boolean;
}

export function Sparkline({
  data,
  width = 60,
  height = 24,
  trend = "neutral",
  className = "",
  animated = true,
}: SparklineProps) {
  // Use React's useId for SSR-safe unique IDs
  const id = useId();
  const gradientId = `sparkline-gradient-${id}`;

  const { path, fillPath } = useMemo(() => {
    if (data.length < 2) return { path: "", fillPath: "" };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Generate smooth curve points
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((value - min) / range) * chartHeight,
    }));

    // Create smooth bezier curve path
    let pathD = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;

      pathD += ` Q ${current.x + (midX - current.x) * 0.5} ${current.y}, ${midX} ${(current.y + next.y) / 2}`;
      pathD += ` Q ${midX + (next.x - midX) * 0.5} ${next.y}, ${next.x} ${next.y}`;
    }

    // Create fill path (closed shape for gradient)
    const fillPathD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { path: pathD, fillPath: fillPathD };
  }, [data, width, height]);

  const trendColors = {
    up: { stroke: "#10B981", fill: "#10B981" },      // emerald
    down: { stroke: "#EF4444", fill: "#EF4444" },    // red
    neutral: { stroke: "#0D9488", fill: "#0D9488" }, // teal (accent)
  };

  const colors = trendColors[trend];

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.fill} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gradient fill under the line */}
      <motion.path
        d={fillPath}
        fill={`url(#${gradientId})`}
        initial={animated ? { opacity: 0 } : undefined}
        animate={animated ? { opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: 0.3 }}
      />

      {/* The line itself */}
      <motion.path
        d={path}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
        animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* End dot */}
      <motion.circle
        cx={width - 2}
        cy={
          2 +
          (height - 4) -
          ((data[data.length - 1] - Math.min(...data)) /
            (Math.max(...data) - Math.min(...data) || 1)) *
            (height - 4)
        }
        r={2}
        fill={colors.stroke}
        initial={animated ? { scale: 0, opacity: 0 } : undefined}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.3, delay: 0.8 }}
      />
    </svg>
  );
}
