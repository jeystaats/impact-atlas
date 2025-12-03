"use client";

import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: IconName;
  };
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Unified EmptyState component for showing "no data" or "no results" states.
 *
 * @example No search results
 * <EmptyState
 *   icon="search"
 *   title="No quick wins found"
 *   description="Try adjusting your filters"
 *   action={{ label: "Reset Filters", onClick: handleReset }}
 * />
 *
 * @example Nothing created yet
 * <EmptyState
 *   icon="layers"
 *   title="No Action Plans Yet"
 *   description="Create your first plan to start making climate impact."
 *   action={{ label: "Create Your First Plan", onClick: handleCreate, icon: "plus" }}
 * />
 */
export function EmptyState({
  icon = "search",
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isCompact ? "py-8" : "py-16 px-6",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className={cn(
          "rounded-2xl bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center justify-center mb-4",
          isCompact ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <Icon
          name={icon}
          className={cn(
            "text-[var(--foreground-muted)]",
            isCompact ? "w-6 h-6" : "w-8 h-8"
          )}
        />
      </motion.div>

      <h3
        className={cn(
          "font-semibold text-[var(--foreground)] mb-2",
          isCompact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-[var(--foreground-secondary)] max-w-md",
            isCompact ? "text-sm" : "text-base"
          )}
        >
          {description}
        </p>
      )}

      {action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <Button onClick={action.onClick} size={isCompact ? "sm" : "default"}>
            {action.icon && <Icon name={action.icon} className="w-4 h-4" />}
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
