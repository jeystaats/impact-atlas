"use client";

import { motion } from "framer-motion";
import { Layers, Plus } from "lucide-react";

interface EmptyStateProps {
  onCreatePlan?: () => void;
}

export function EmptyState({ onCreatePlan }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
        className="w-24 h-24 rounded-3xl bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center justify-center mb-6"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <Layers className="w-12 h-12 text-[var(--foreground-muted)]" />
        </motion.div>
      </motion.div>

      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        No Action Plans Yet
      </h2>
      <p className="text-[var(--foreground-secondary)] max-w-md mb-8">
        Action plans help you organize quick wins into comprehensive strategies.
        Create your first plan to start making measurable climate impact.
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreatePlan}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium shadow-lg"
        style={{
          boxShadow: "0 8px 32px var(--teal-glow)",
        }}
      >
        <Plus className="w-5 h-5" />
        Create Your First Plan
      </motion.button>
    </motion.div>
  );
}
