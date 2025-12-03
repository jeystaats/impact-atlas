"use client";

import { motion } from "framer-motion";
import type { PlanStatus } from "./types";

interface FilterTabsProps {
  activeFilter: "all" | PlanStatus;
  onFilterChange: (filter: "all" | PlanStatus) => void;
  counts: Record<"all" | PlanStatus, number>;
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  counts,
}: FilterTabsProps) {
  const filters: { key: "all" | PlanStatus; label: string }[] = [
    { key: "all", label: "All Plans" },
    { key: "active", label: "Active" },
    { key: "draft", label: "Drafts" },
    { key: "completed", label: "Completed" },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <motion.button
          key={filter.key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onFilterChange(filter.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
            activeFilter === filter.key
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          }`}
        >
          {filter.label}
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.key
                ? "bg-white/20"
                : "bg-[var(--background-secondary)]"
            }`}
          >
            {counts[filter.key]}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
