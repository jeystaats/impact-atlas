"use client";

import { motion } from "framer-motion";
import { Layers, Play, CheckCircle2 } from "lucide-react";
import { Icon } from "@/components/ui/icons";
import type { NormalizedActionPlan } from "./types";

interface StatsSummaryProps {
  plans: NormalizedActionPlan[];
}

export function StatsSummary({ plans }: StatsSummaryProps) {
  const stats = [
    {
      label: "Total Plans",
      value: plans.length,
      icon: Layers,
      color: "var(--accent)",
    },
    {
      label: "Active",
      value: plans.filter((p) => p.status === "active").length,
      icon: Play,
      color: "var(--accent-light)",
    },
    {
      label: "Completed",
      value: plans.filter((p) => p.status === "completed").length,
      icon: CheckCircle2,
      color: "#10B981",
    },
    {
      label: "Quick Wins",
      value: plans.reduce((sum, p) => sum + p.quickWinsCount, 0),
      icon: Icon,
      iconName: "zap" as const,
      color: "#F59E0B",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-4 lg:p-5 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)] transition-colors hover:border-[var(--stone)]"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              {stat.iconName ? (
                <Icon
                  name={stat.iconName}
                  className="w-5 h-5"
                  style={{ color: stat.color }}
                />
              ) : (
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              )}
            </div>
            <div>
              <p className="text-xs text-[var(--foreground-muted)]">
                {stat.label}
              </p>
              <motion.p
                className="text-xl lg:text-2xl font-bold text-[var(--foreground)] tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {stat.value}
              </motion.p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
