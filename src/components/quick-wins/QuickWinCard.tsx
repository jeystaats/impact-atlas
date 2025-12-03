"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Icon, ModuleIcon } from "@/components/ui/icons";
import { AIGeneratedBadge, isAIGenerated } from "@/components/ui/AIGeneratedBadge";
import { QuickWinActions } from "./QuickWinActions";
import { impactConfig, effortConfig, itemVariants, checkVariants } from "./constants";
import type { NormalizedQuickWin, NormalizedModule } from "./types";

interface QuickWinCardProps {
  win: NormalizedQuickWin;
  module: NormalizedModule | undefined;
  isCompleted: boolean;
  onToggleComplete: (win: NormalizedQuickWin) => void;
}

export function QuickWinCard({
  win,
  module,
  isCompleted,
  onToggleComplete,
}: QuickWinCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      layout
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`group relative p-4 lg:p-5 rounded-xl border transition-all duration-300 ${
        isCompleted
          ? "bg-[var(--background-secondary)] border-[var(--border)] opacity-60"
          : "bg-[var(--background-tertiary)] border-[var(--border)] hover:border-[var(--accent)]"
      }`}
    >
      {/* Accent line on hover */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: module?.color }}
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: 1 }}
        transition={{ duration: 0.2 }}
      />

      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggleComplete(win)}
          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
            isCompleted
              ? "border-[var(--accent)] bg-[var(--accent)]"
              : "border-[var(--border)] hover:border-[var(--accent)]"
          }`}
        >
          <AnimatePresence>
            {isCompleted && (
              <motion.svg
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 12l5 5L20 7"
                  variants={checkVariants}
                  initial="unchecked"
                  animate="checked"
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 mb-2">
            <h3
              className={`font-semibold text-[var(--foreground)] transition-all ${
                isCompleted ? "line-through opacity-60" : ""
              }`}
            >
              {win.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Module badge */}
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: module?.color + "15",
                  color: module?.color,
                }}
              >
                <ModuleIcon
                  moduleId={win.moduleId}
                  className="w-3 h-3"
                  style={{ color: module?.color }}
                />
                {module?.title.split(" ").slice(0, 2).join(" ")}
              </div>
              {/* Impact badge */}
              <div
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{
                  backgroundColor: impactConfig[win.impact].bgColor,
                  color: impactConfig[win.impact].color,
                }}
              >
                {impactConfig[win.impact].label}
              </div>
              {/* AI Generated badge */}
              {isAIGenerated(win.tags) && <AIGeneratedBadge size="sm" />}
            </div>
          </div>
          <p
            className={`text-sm text-[var(--foreground-secondary)] mb-3 ${
              isCompleted ? "line-through opacity-60" : ""
            }`}
          >
            {win.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--foreground-muted)]">
            {/* Effort */}
            <div className="flex items-center gap-1.5">
              <Icon name={effortConfig[win.effort].icon} className="w-3.5 h-3.5" />
              <span>{effortConfig[win.effort].label}</span>
            </div>
            {/* Timeline */}
            <div className="flex items-center gap-1.5">
              <Icon name="target" className="w-3.5 h-3.5" />
              <span>{win.estimatedDays} days</span>
            </div>
            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {win.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] text-[var(--foreground-muted)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <QuickWinActions win={win} module={module} />
      </div>
    </motion.div>
  );
}
