"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Sparkline } from "@/components/ui/Sparkline";

export interface StatCardData {
  label: string;
  value: number;
  displayValue?: string; // Optional override for display (e.g., "57" instead of computed "57")
  icon: IconName;
  color: string;
  trend: "up" | "down" | "neutral";
  trendValue?: string; // e.g., "+12%" or "-3"
  sparklineData: number[];
}

interface StatCardProps {
  stat: StatCardData;
  index?: number;
}

export const StatCard = memo(function StatCard({ stat, index = 0 }: StatCardProps) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-red-500",
    neutral: "text-[var(--foreground-muted)]",
  };

  const trendIcons = {
    up: "trendUp" as const,
    down: "trendDown" as const,
    neutral: "minus" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.05,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{
        y: -2,
        boxShadow: `0 8px 30px -5px ${stat.color}20`,
        transition: { duration: 0.2 },
      }}
      className="relative p-5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] overflow-hidden group cursor-default"
    >
      {/* Subtle gradient background on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${stat.color}08, transparent 70%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-3">
        {/* Left side: Icon + Content */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <motion.div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${stat.color}12` }}
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Icon
              name={stat.icon}
              className="w-5 h-5"
              style={{ color: stat.color }}
            />
          </motion.div>

          {/* Content */}
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--foreground-muted)] mb-0.5">
              {stat.label}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--foreground)]">
                <AnimatedCounter
                  value={stat.value}
                  delay={0.2 + index * 0.1}
                  duration={1.2}
                />
              </span>
              {stat.trendValue && (
                <span
                  className={`text-xs font-medium flex items-center gap-0.5 ${trendColors[stat.trend]}`}
                >
                  <Icon name={trendIcons[stat.trend]} className="w-3 h-3" />
                  {stat.trendValue}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Sparkline */}
        <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          <Sparkline
            data={stat.sparklineData}
            width={56}
            height={28}
            trend={stat.trend}
            animated={true}
          />
        </div>
      </div>
    </motion.div>
  );
});
