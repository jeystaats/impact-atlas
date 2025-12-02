"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FilterState,
  Severity,
  Trend,
  DateRangePreset,
  ValueRange,
  DEFAULT_FILTER_STATE,
  SEVERITY_OPTIONS,
  TREND_OPTIONS,
  DATE_RANGE_OPTIONS,
  countActiveFilters,
  isDefaultFilterState,
  toggleArrayFilter,
} from "@/lib/filters";

// =============================================================================
// TYPES
// =============================================================================

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  resultsCount: number;
  totalCount: number;
  valueRangeConfig?: {
    label: string;
    unit: string;
    min: number;
    max: number;
    step?: number;
  };
  className?: string;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { x: "100%", opacity: 0.8 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    x: "100%",
    opacity: 0.8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
};

const checkVariants: Variants = {
  unchecked: { scale: 0, opacity: 0 },
  checked: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25,
    },
  },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  count?: number;
}

function SectionHeader({ title, icon, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-[var(--accent)]">{icon}</span>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          {title}
        </h3>
      </div>
      {count !== undefined && count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-1.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[10px] font-semibold"
        >
          {count}
        </motion.span>
      )}
    </div>
  );
}

interface CheckboxOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: string;
  icon?: React.ReactNode;
}

function CheckboxOption({
  label,
  checked,
  onChange,
  color,
  icon,
}: CheckboxOptionProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onChange}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-xl border transition-all duration-200",
        checked
          ? "bg-[var(--accent-bg)] border-[var(--accent)]"
          : "bg-[var(--background-secondary)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      type="button"
    >
      {/* Checkbox indicator */}
      <div
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200",
          checked
            ? "border-[var(--accent)] bg-[var(--accent)]"
            : "border-[var(--border)]"
        )}
        style={{
          borderColor: checked && color ? color : undefined,
          backgroundColor: checked && color ? color : undefined,
        }}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              variants={checkVariants}
              initial="unchecked"
              animate="checked"
              exit="unchecked"
            >
              <Icon name="check" className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Color indicator (for severity) */}
      {color && !checked && (
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}

      {/* Icon (for trends) */}
      {icon && <span className="text-[var(--foreground-muted)]">{icon}</span>}

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          checked ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}

interface RadioOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

function RadioOption({ label, checked, onChange }: RadioOptionProps) {
  return (
    <motion.button
      variants={itemVariants}
      onClick={onChange}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-xl border transition-all duration-200",
        checked
          ? "bg-[var(--accent-bg)] border-[var(--accent)]"
          : "bg-[var(--background-secondary)] border-[var(--border)] hover:border-[var(--foreground-muted)]"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      type="button"
    >
      {/* Radio indicator */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
          checked
            ? "border-[var(--accent)]"
            : "border-[var(--border)]"
        )}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          checked ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
        )}
      >
        {label}
      </span>
    </motion.button>
  );
}

interface RangeSliderProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  value: ValueRange | null;
  onChange: (range: ValueRange | null) => void;
}

function RangeSlider({
  label,
  unit,
  min,
  max,
  step = 1,
  value,
  onChange,
}: RangeSliderProps) {
  const [localMin, setLocalMin] = useState(value?.min ?? min);
  const [localMax, setLocalMax] = useState(value?.max ?? max);
  const [isActive, setIsActive] = useState(value !== null);

  // Calculate percentage for gradient
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(newMin);
    if (isActive) {
      onChange({ min: newMin, max: localMax, unit });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(newMax);
    if (isActive) {
      onChange({ min: localMin, max: newMax, unit });
    }
  };

  const toggleActive = () => {
    if (isActive) {
      setIsActive(false);
      onChange(null);
    } else {
      setIsActive(true);
      onChange({ min: localMin, max: localMax, unit });
    }
  };

  return (
    <motion.div variants={sectionVariants} className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeader
          title={label}
          icon={<Icon name="activity" className="w-4 h-4" />}
        />
        <button
          onClick={toggleActive}
          className={cn(
            "relative w-10 h-6 rounded-full transition-colors duration-200",
            isActive ? "bg-[var(--accent)]" : "bg-[var(--border)]"
          )}
          type="button"
        >
          <motion.div
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
            animate={{ left: isActive ? 20 : 4 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Value display */}
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                {localMin}
                {unit}
              </span>
              <span className="text-xs text-[var(--foreground-muted)]">to</span>
              <span className="text-sm font-semibold text-[var(--foreground)] tabular-nums">
                {localMax}
                {unit}
              </span>
            </div>

            {/* Dual range slider */}
            <div className="relative h-6 px-2">
              {/* Track background */}
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-2 rounded-full bg-[var(--border)]" />

              {/* Active track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-[var(--accent)]"
                style={{
                  left: `calc(${minPercent}% + 8px)`,
                  right: `calc(${100 - maxPercent}% + 8px)`,
                }}
              />

              {/* Min slider */}
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localMin}
                onChange={handleMinChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                style={{ pointerEvents: "auto" }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[var(--accent)] shadow-md cursor-pointer"
                style={{ left: `calc(${minPercent}% - 2px)` }}
                whileHover={{ scale: 1.1 }}
              />

              {/* Max slider */}
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={localMax}
                onChange={handleMaxChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                style={{ pointerEvents: "auto" }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[var(--accent)] shadow-md cursor-pointer"
                style={{ left: `calc(${maxPercent}% - 2px)` }}
                whileHover={{ scale: 1.1 }}
              />
            </div>

            {/* Min/Max labels */}
            <div className="flex items-center justify-between px-2 text-xs text-[var(--foreground-muted)]">
              <span>{min}{unit}</span>
              <span>{max}{unit}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  resultsCount,
  totalCount,
  valueRangeConfig,
  className,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync with external filters
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const activeFilterCount = useMemo(
    () => countActiveFilters(localFilters),
    [localFilters]
  );

  const isDefault = useMemo(
    () => isDefaultFilterState(localFilters),
    [localFilters]
  );

  // Handlers
  const handleSeverityToggle = useCallback((severity: Severity) => {
    setLocalFilters((prev) => ({
      ...prev,
      severities: toggleArrayFilter(prev.severities, severity),
    }));
  }, []);

  const handleTrendToggle = useCallback((trend: Trend) => {
    setLocalFilters((prev) => ({
      ...prev,
      trends: toggleArrayFilter(prev.trends, trend),
    }));
  }, []);

  const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
    setLocalFilters((prev) => ({
      ...prev,
      dateRange: { preset },
    }));
  }, []);

  const handleValueRangeChange = useCallback((range: ValueRange | null) => {
    setLocalFilters((prev) => ({
      ...prev,
      valueRange: range,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setLocalFilters(DEFAULT_FILTER_STATE);
  }, []);

  const handleApply = useCallback(() => {
    onFiltersChange(localFilters);
    onApply();
    onClose();
  }, [localFilters, onFiltersChange, onApply, onClose]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "fixed right-0 top-0 bottom-0 w-full max-w-md",
              "bg-[var(--background-tertiary)] shadow-2xl z-50",
              "flex flex-col overflow-hidden",
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-panel-title"
          >
            {/* Header */}
            <motion.header
              variants={sectionVariants}
              className="shrink-0 px-6 py-5 border-b border-[var(--border)] bg-[var(--background-tertiary)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--accent-bg)] flex items-center justify-center">
                    <Icon name="filter" className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <h2
                      id="filter-panel-title"
                      className="text-lg font-semibold text-[var(--foreground)]"
                    >
                      Filters
                    </h2>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Refine your hotspot view
                    </p>
                  </div>
                </div>

                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-[var(--background-secondary)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  aria-label="Close filters"
                  type="button"
                >
                  <Icon name="x" className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.header>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-6 space-y-8">
                {/* Severity section */}
                <motion.section variants={sectionVariants}>
                  <SectionHeader
                    title="Severity Level"
                    icon={<Icon name="target" className="w-4 h-4" />}
                    count={localFilters.severities.length}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {SEVERITY_OPTIONS.map((option) => (
                      <CheckboxOption
                        key={option.value}
                        label={option.label}
                        checked={localFilters.severities.includes(option.value)}
                        onChange={() => handleSeverityToggle(option.value)}
                        color={option.color}
                      />
                    ))}
                  </div>
                </motion.section>

                {/* Date range section */}
                <motion.section variants={sectionVariants}>
                  <SectionHeader
                    title="Time Period"
                    icon={<Icon name="calendar" className="w-4 h-4" />}
                  />
                  <div className="space-y-2">
                    {DATE_RANGE_OPTIONS.map((option) => (
                      <RadioOption
                        key={option.value}
                        label={option.label}
                        checked={localFilters.dateRange.preset === option.value}
                        onChange={() => handleDateRangeChange(option.value)}
                      />
                    ))}
                  </div>

                  {/* Custom date inputs */}
                  <AnimatePresence>
                    {localFilters.dateRange.preset === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 grid grid-cols-2 gap-3"
                      >
                        <div>
                          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                            Start date
                          </label>
                          <input
                            type="date"
                            value={
                              localFilters.dateRange.startDate
                                ?.toISOString()
                                .split("T")[0] || ""
                            }
                            onChange={(e) =>
                              setLocalFilters((prev) => ({
                                ...prev,
                                dateRange: {
                                  ...prev.dateRange,
                                  startDate: e.target.value
                                    ? new Date(e.target.value)
                                    : undefined,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                            End date
                          </label>
                          <input
                            type="date"
                            value={
                              localFilters.dateRange.endDate
                                ?.toISOString()
                                .split("T")[0] || ""
                            }
                            onChange={(e) =>
                              setLocalFilters((prev) => ({
                                ...prev,
                                dateRange: {
                                  ...prev.dateRange,
                                  endDate: e.target.value
                                    ? new Date(e.target.value)
                                    : undefined,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.section>

                {/* Trend section */}
                <motion.section variants={sectionVariants}>
                  <SectionHeader
                    title="Trend Direction"
                    icon={<Icon name="trendingUp" className="w-4 h-4" />}
                    count={localFilters.trends.length}
                  />
                  <div className="space-y-2">
                    {TREND_OPTIONS.map((option) => (
                      <CheckboxOption
                        key={option.value}
                        label={option.label}
                        checked={localFilters.trends.includes(option.value)}
                        onChange={() => handleTrendToggle(option.value)}
                        icon={
                          <Icon
                            name={option.icon as "trendingUp" | "trendingDown" | "minus"}
                            className="w-4 h-4"
                          />
                        }
                      />
                    ))}
                  </div>
                </motion.section>

                {/* Value range section (optional) */}
                {valueRangeConfig && (
                  <RangeSlider
                    label={valueRangeConfig.label}
                    unit={valueRangeConfig.unit}
                    min={valueRangeConfig.min}
                    max={valueRangeConfig.max}
                    step={valueRangeConfig.step}
                    value={localFilters.valueRange}
                    onChange={handleValueRangeChange}
                  />
                )}
              </div>
            </div>

            {/* Footer */}
            <motion.footer
              variants={sectionVariants}
              className="shrink-0 px-6 py-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]"
            >
              {/* Results preview */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="layers" className="w-4 h-4 text-[var(--foreground-muted)]" />
                  <span className="text-sm text-[var(--foreground-secondary)]">
                    Matching results:
                  </span>
                </div>
                <motion.span
                  key={resultsCount}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "text-lg font-bold tabular-nums",
                    resultsCount === 0 ? "text-red-500" : "text-[var(--accent)]"
                  )}
                >
                  {resultsCount}
                  <span className="text-sm font-normal text-[var(--foreground-muted)]">
                    {" "}
                    / {totalCount}
                  </span>
                </motion.span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isDefault}
                  className="flex-1"
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  Reset
                  {activeFilterCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent-bg)] text-[var(--accent)] text-[10px] font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
                <Button onClick={handleApply} className="flex-1">
                  <Icon name="check" className="w-4 h-4" />
                  Apply Filters
                </Button>
              </div>

              {/* Keyboard hint */}
              <p className="text-center text-xs text-[var(--foreground-muted)] mt-3">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-secondary)] font-mono text-[10px]">
                  ESC
                </kbd>{" "}
                to close
              </p>
            </motion.footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FilterPanel;
