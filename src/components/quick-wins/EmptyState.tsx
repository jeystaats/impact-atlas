"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons";

interface EmptyStateProps {
  onResetFilters: () => void;
}

export function EmptyState({ onResetFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--background-tertiary)] flex items-center justify-center">
        <Icon name="search" className="w-8 h-8 text-[var(--foreground-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        No quick wins found
      </h3>
      <p className="text-[var(--foreground-secondary)] max-w-md mx-auto">
        Try adjusting your filters or search query to find more opportunities.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onResetFilters}
        className="mt-4 px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium"
      >
        Reset Filters
      </motion.button>
    </motion.div>
  );
}
