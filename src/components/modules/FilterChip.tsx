"use client";

import { useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export interface FilterChipData {
  id: string;
  label: string;
  value: string;
  icon?: IconName;
  color?: string;
}

interface FilterChipProps {
  chip: FilterChipData;
  onRemove: (id: string) => void;
  className?: string;
}

interface FilterChipsContainerProps {
  chips: FilterChipData[];
  onRemoveChip: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const chipVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
    y: -10,
  },
  visible: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
    },
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const removeButtonVariants: Variants = {
  idle: { scale: 1, rotate: 0 },
  hover: { scale: 1.2, rotate: 90 },
  tap: { scale: 0.9 },
};

const clearAllVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
      delay: 0.2,
    },
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.15 },
  },
};

// =============================================================================
// SINGLE CHIP COMPONENT
// =============================================================================

export function FilterChip({ chip, onRemove, className }: FilterChipProps) {
  const handleRemove = useCallback(() => {
    onRemove(chip.id);
  }, [chip.id, onRemove]);

  return (
    <motion.div
      layout
      variants={chipVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
        "bg-[var(--background-secondary)] border border-[var(--border)]",
        "text-xs font-medium",
        "hover:border-[var(--foreground-muted)] transition-colors group",
        className
      )}
      style={{
        borderColor: chip.color ? `${chip.color}40` : undefined,
        backgroundColor: chip.color ? `${chip.color}10` : undefined,
      }}
    >
      {/* Icon (if provided) */}
      {chip.icon && (
        <Icon
          name={chip.icon}
          className="w-3 h-3 text-[var(--foreground-muted)]"
          style={{ color: chip.color }}
        />
      )}

      {/* Label */}
      <span className="text-[var(--foreground-muted)]">{chip.label}:</span>

      {/* Value */}
      <span
        className="text-[var(--foreground)]"
        style={{ color: chip.color }}
      >
        {chip.value}
      </span>

      {/* Remove button */}
      <motion.button
        variants={removeButtonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={handleRemove}
        className={cn(
          "ml-0.5 p-0.5 rounded-full",
          "text-[var(--foreground-muted)]",
          "hover:text-[var(--foreground)] hover:bg-[var(--background)]",
          "transition-colors"
        )}
        aria-label={`Remove ${chip.label} filter`}
        type="button"
      >
        <Icon name="x" className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}

// =============================================================================
// CHIPS CONTAINER COMPONENT
// =============================================================================

export function FilterChipsContainer({
  chips,
  onRemoveChip,
  onClearAll,
  className,
}: FilterChipsContainerProps) {
  if (chips.length === 0) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {/* Active filter chips */}
      <AnimatePresence mode="popLayout">
        {chips.map((chip) => (
          <FilterChip key={chip.id} chip={chip} onRemove={onRemoveChip} />
        ))}
      </AnimatePresence>

      {/* Clear all button */}
      <AnimatePresence>
        {chips.length > 1 && (
          <motion.button
            variants={clearAllVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClearAll}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
              "text-xs font-medium",
              "text-red-500 hover:text-red-600",
              "hover:bg-red-50 transition-colors"
            )}
            type="button"
          >
            <Icon name="x" className="w-3 h-3" />
            Clear all
          </motion.button>
        )}
      </AnimatePresence>

      {/* Filter count badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full",
          "bg-[var(--accent-bg)] text-[var(--accent)]",
          "text-[10px] font-semibold"
        )}
      >
        <Icon name="filter" className="w-2.5 h-2.5" />
        {chips.length} active
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// UTILITY: Convert FilterState to chips
// =============================================================================

import type { FilterState, Severity, Trend } from "@/lib/filters";
import { SEVERITY_OPTIONS, TREND_OPTIONS, DATE_RANGE_OPTIONS } from "@/lib/filters";

export function filterStateToChips(filters: FilterState): FilterChipData[] {
  const chips: FilterChipData[] = [];

  // Search chip
  if (filters.search.trim()) {
    chips.push({
      id: "search",
      label: "Search",
      value: `"${filters.search}"`,
      icon: "search",
    });
  }

  // Severity chips
  filters.severities.forEach((severity: Severity) => {
    const option = SEVERITY_OPTIONS.find((opt) => opt.value === severity);
    if (option) {
      chips.push({
        id: `severity-${severity}`,
        label: "Severity",
        value: option.label,
        icon: "target",
        color: option.color,
      });
    }
  });

  // Trend chips
  filters.trends.forEach((trend: Trend) => {
    const option = TREND_OPTIONS.find((opt) => opt.value === trend);
    if (option) {
      chips.push({
        id: `trend-${trend}`,
        label: "Trend",
        value: option.label,
        icon: option.icon as IconName,
      });
    }
  });

  // Date range chip (only if not default)
  if (filters.dateRange.preset !== "30d") {
    const option = DATE_RANGE_OPTIONS.find(
      (opt) => opt.value === filters.dateRange.preset
    );
    if (filters.dateRange.preset === "custom") {
      if (filters.dateRange.startDate || filters.dateRange.endDate) {
        const start = filters.dateRange.startDate?.toLocaleDateString() || "...";
        const end = filters.dateRange.endDate?.toLocaleDateString() || "...";
        chips.push({
          id: "date-range",
          label: "Date",
          value: `${start} - ${end}`,
          icon: "calendar",
        });
      }
    } else if (option) {
      chips.push({
        id: "date-range",
        label: "Date",
        value: option.label,
        icon: "calendar",
      });
    }
  }

  // Value range chip
  if (filters.valueRange) {
    const unit = filters.valueRange.unit || "";
    chips.push({
      id: "value-range",
      label: "Value",
      value: `${filters.valueRange.min}${unit} - ${filters.valueRange.max}${unit}`,
      icon: "activity",
    });
  }

  return chips;
}

// =============================================================================
// UTILITY: Handle chip removal and update filters
// =============================================================================

export function handleChipRemoval(
  chipId: string,
  currentFilters: FilterState
): FilterState {
  const newFilters = { ...currentFilters };

  if (chipId === "search") {
    newFilters.search = "";
  } else if (chipId.startsWith("severity-")) {
    const severity = chipId.replace("severity-", "") as Severity;
    newFilters.severities = newFilters.severities.filter((s) => s !== severity);
  } else if (chipId.startsWith("trend-")) {
    const trend = chipId.replace("trend-", "") as Trend;
    newFilters.trends = newFilters.trends.filter((t) => t !== trend);
  } else if (chipId === "date-range") {
    newFilters.dateRange = { preset: "30d" };
  } else if (chipId === "value-range") {
    newFilters.valueRange = null;
  }

  return newFilters;
}

export default FilterChip;
