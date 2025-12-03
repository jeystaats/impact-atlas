"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import type { QuickWinStats } from "./types";

interface ProgressIndicatorProps {
  stats: QuickWinStats;
}

export function ProgressIndicator({ stats }: ProgressIndicatorProps) {
  if (stats.completed === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border)] shadow-2xl flex items-center gap-4"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="flex items-center gap-2">
        <Icon name="success" className="w-5 h-5 text-[#10B981]" />
        <span className="text-sm text-[var(--foreground)]">
          <span className="font-semibold">{stats.completed}</span> of{" "}
          <span className="font-semibold">{stats.total}</span> completed
        </span>
      </div>
      <div className="w-32 h-2 rounded-full bg-[var(--background-secondary)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[#10B981]"
          initial={{ width: 0 }}
          animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs text-[var(--foreground-muted)] tabular-nums">
        {Math.round((stats.completed / stats.total) * 100)}%
      </span>
    </motion.div>
  );
}
