"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
  animatePercentage?: boolean;
  className?: string;
}

/**
 * Unified ProgressRing component with configurable options.
 * Used for action plan progress, loading states, etc.
 */
export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4,
  color = "var(--accent)",
  showPercentage = true,
  animatePercentage = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const percentageValue = Math.floor(progress);

  return (
    <div
      className={`relative ${className || ""}`}
      style={{ width: size, height: size }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          {animatePercentage ? (
            <motion.span
              key={percentageValue}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-semibold text-[var(--foreground)] tabular-nums"
              style={{ fontSize: size > 60 ? "1.125rem" : "0.75rem" }}
            >
              {percentageValue}%
            </motion.span>
          ) : (
            <span
              className="font-semibold text-[var(--foreground)] tabular-nums"
              style={{ fontSize: size > 60 ? "1.125rem" : "0.75rem" }}
            >
              {percentageValue}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
