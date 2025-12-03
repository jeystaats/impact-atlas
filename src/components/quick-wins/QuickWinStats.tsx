"use client";

import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import type { QuickWinStats as QuickWinStatsType } from "./types";

interface QuickWinStatsProps {
  stats: QuickWinStatsType;
}

export function QuickWinStats({ stats }: QuickWinStatsProps) {
  const statItems: {
    label: string;
    value: string;
    icon: IconName;
    color: string;
  }[] = [
    {
      label: "Total Quick Wins",
      value: stats.total.toString(),
      icon: "zap",
      color: "var(--accent)",
    },
    {
      label: "High Impact",
      value: stats.highImpact.toString(),
      icon: "trendingUp",
      color: "#10B981",
    },
    {
      label: "AI Generated",
      value: stats.aiGenerated.toString(),
      icon: "sparkles",
      color: "#8B5CF6",
    },
    {
      label: "Completed",
      value: stats.completed.toString(),
      icon: "success",
      color: "#10B981",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          className="p-4 lg:p-6 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] group cursor-default"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: stat.color + "15" }}
            >
              <Icon
                name={stat.icon}
                className="w-5 h-5"
                style={{ color: stat.color }}
              />
            </motion.div>
            <div>
              <p className="text-xs text-[var(--foreground-muted)]">{stat.label}</p>
              <p className="text-xl lg:text-2xl font-bold text-[var(--foreground)] tabular-nums">
                {stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
