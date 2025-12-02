"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { ExportMenu, ExportType } from "./ExportMenu";
import { ShareMenu, ShareMethod } from "./ShareMenu";
import { Module, Hotspot } from "@/types";
import { cn } from "@/lib/utils";

// ============================================
// Types
// ============================================

export interface ModuleActionBarProps {
  /** Module data for exports and sharing */
  module: Module;
  /** Hotspots data for exports */
  hotspots?: Hotspot[];
  /** Current city ID */
  cityId?: string;
  /** City name for display */
  cityName?: string;
  /** Current view mode */
  currentView?: "map" | "list" | "chart";
  /** Active filters */
  filters?: Record<string, string | number | boolean>;
  /** Reference to chart element for PNG export */
  chartRef?: React.RefObject<HTMLElement>;
  /** Whether filter panel is open */
  isFilterOpen?: boolean;
  /** Filter panel toggle handler */
  onFilterToggle?: () => void;
  /** Active filter count */
  activeFilterCount?: number;
  /** Refresh data handler */
  onRefresh?: () => void;
  /** Whether data is currently loading */
  isRefreshing?: boolean;
  /** Last refresh timestamp */
  lastUpdated?: Date;
  /** Callback when any action completes */
  onAction?: (action: ActionType, success: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Layout variant */
  variant?: "default" | "compact" | "minimal";
  /** Disable specific actions */
  disabledActions?: ActionType[];
}

export type ActionType = "export" | "share" | "filter" | "refresh";

// ============================================
// Constants
// ============================================

const springTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// ============================================
// Component
// ============================================

export function ModuleActionBar({
  module,
  hotspots = [],
  cityId,
  cityName,
  currentView,
  filters,
  chartRef,
  isFilterOpen = false,
  onFilterToggle,
  activeFilterCount = 0,
  onRefresh,
  isRefreshing = false,
  lastUpdated,
  onAction,
  className = "",
  variant = "default",
  disabledActions = [],
}: ModuleActionBarProps) {
  const [showLastUpdated, setShowLastUpdated] = useState(false);

  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  // Handle export completion
  const handleExportComplete = (type: ExportType, success: boolean) => {
    onAction?.("export", success);
  };

  // Handle share completion
  const handleShareComplete = (method: ShareMethod, success: boolean) => {
    onAction?.("share", success);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (!isRefreshing && onRefresh) {
      onRefresh();
      onAction?.("refresh", true);
    }
  };

  // Handle filter toggle
  const handleFilterToggle = () => {
    onFilterToggle?.();
    onAction?.("filter", true);
  };

  // Render compact variant
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* Export Button */}
        {!disabledActions.includes("export") && (
          <ExportMenu
            module={module}
            hotspots={hotspots}
            cityName={cityName}
            chartRef={chartRef}
            onExportComplete={handleExportComplete}
          />
        )}

        {/* Share Button */}
        {!disabledActions.includes("share") && (
          <ShareMenu
            moduleId={module.id}
            module={module}
            hotspots={hotspots}
            cityId={cityId}
            cityName={cityName}
            currentView={currentView}
            filters={filters}
            onShare={handleShareComplete}
          />
        )}

        {/* Filter Button */}
        {!disabledActions.includes("filter") && onFilterToggle && (
          <ActionButton
            icon="filter"
            label="Filters"
            isActive={isFilterOpen}
            badge={activeFilterCount > 0 ? activeFilterCount : undefined}
            onClick={handleFilterToggle}
          />
        )}

        {/* Refresh Button */}
        {!disabledActions.includes("refresh") && onRefresh && (
          <ActionButton
            icon="refresh"
            label="Refresh"
            isLoading={isRefreshing}
            onClick={handleRefresh}
          />
        )}
      </div>
    );
  }

  // Render minimal variant
  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {!disabledActions.includes("export") && (
          <IconButton
            icon="download"
            label="Export"
            onClick={() => {
              // Open export in a simple way for minimal variant
            }}
          />
        )}
        {!disabledActions.includes("share") && (
          <IconButton
            icon="share"
            label="Share"
            onClick={() => {
              // Quick share for minimal variant
            }}
          />
        )}
        {!disabledActions.includes("filter") && onFilterToggle && (
          <IconButton
            icon="filter"
            label="Filter"
            isActive={isFilterOpen}
            badge={activeFilterCount}
            onClick={handleFilterToggle}
          />
        )}
        {!disabledActions.includes("refresh") && onRefresh && (
          <IconButton
            icon="refresh"
            label="Refresh"
            isLoading={isRefreshing}
            onClick={handleRefresh}
          />
        )}
      </div>
    );
  }

  // Default variant - full featured toolbar
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--background-tertiary)] border border-[var(--border)]",
        className
      )}
    >
      {/* Left Section - Module Info */}
      <div className="flex items-center gap-3">
        {/* Module Status Indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span className="text-xs text-[var(--foreground-muted)]">
            Live Data
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block h-4 w-px bg-[var(--border)]" />

        {/* Last Updated */}
        {lastUpdated && (
          <div
            className="relative"
            onMouseEnter={() => setShowLastUpdated(true)}
            onMouseLeave={() => setShowLastUpdated(false)}
          >
            <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
              <Icon name="clock" className="w-3.5 h-3.5" />
              <span>Updated {formatLastUpdated(lastUpdated)}</span>
            </div>

            {/* Tooltip with exact time */}
            <AnimatePresence>
              {showLastUpdated && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute left-0 top-full mt-1 px-2 py-1 bg-[var(--foreground)] text-white text-[10px] rounded whitespace-nowrap z-50"
                >
                  {lastUpdated.toLocaleString()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Hotspot Count */}
        {hotspots.length > 0 && (
          <>
            <div className="hidden sm:block h-4 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-[var(--accent)] tabular-nums">
                {hotspots.length}
              </span>
              <span className="text-[var(--foreground-muted)]">hotspots</span>
            </div>
          </>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        {/* Filter Button */}
        {!disabledActions.includes("filter") && onFilterToggle && (
          <ActionButton
            icon="filter"
            label="Filters"
            isActive={isFilterOpen}
            badge={activeFilterCount > 0 ? activeFilterCount : undefined}
            onClick={handleFilterToggle}
          />
        )}

        {/* Divider */}
        {!disabledActions.includes("filter") && onFilterToggle && (
          <div className="h-6 w-px bg-[var(--border)]" />
        )}

        {/* Export Menu */}
        {!disabledActions.includes("export") && (
          <ExportMenu
            module={module}
            hotspots={hotspots}
            cityName={cityName}
            chartRef={chartRef}
            filenamePrefix={`impact-atlas-${module.id}`}
            onExportComplete={handleExportComplete}
          />
        )}

        {/* Share Menu */}
        {!disabledActions.includes("share") && (
          <ShareMenu
            moduleId={module.id}
            module={module}
            hotspots={hotspots}
            cityId={cityId}
            cityName={cityName}
            currentView={currentView}
            filters={filters}
            onShare={handleShareComplete}
          />
        )}

        {/* Refresh Button */}
        {!disabledActions.includes("refresh") && onRefresh && (
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variants={buttonVariants}
            initial="idle"
            whileHover={!isRefreshing ? "hover" : undefined}
            whileTap={!isRefreshing ? "tap" : undefined}
            transition={springTransition}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
              isRefreshing
                ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--border)]"
            )}
            title="Refresh data"
          >
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isRefreshing
                  ? { duration: 1, repeat: Infinity, ease: "linear" }
                  : { duration: 0 }
              }
            >
              <Icon name="refresh" className="w-4 h-4" />
            </motion.div>
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// Sub-components
// ============================================

interface ActionButtonProps {
  icon: IconName;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

function ActionButton({
  icon,
  label,
  isActive = false,
  isLoading = false,
  badge,
  onClick,
  className = "",
}: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      variants={buttonVariants}
      initial="idle"
      whileHover={!isLoading ? "hover" : undefined}
      whileTap={!isLoading ? "tap" : undefined}
      transition={springTransition}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--foreground-muted)]",
        className
      )}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="loader" className="w-4 h-4" />
        </motion.div>
      ) : (
        <Icon name={icon} className="w-4 h-4" />
      )}
      <span>{label}</span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold",
            isActive
              ? "bg-white text-[var(--accent)]"
              : "bg-[var(--accent)] text-white"
          )}
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

interface IconButtonProps {
  icon: IconName;
  label: string;
  isActive?: boolean;
  isLoading?: boolean;
  badge?: number;
  onClick?: () => void;
  className?: string;
}

function IconButton({
  icon,
  label,
  isActive = false,
  isLoading = false,
  badge,
  onClick,
  className = "",
}: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      variants={buttonVariants}
      initial="idle"
      whileHover={!isLoading ? "hover" : undefined}
      whileTap={!isLoading ? "tap" : undefined}
      transition={springTransition}
      className={cn(
        "relative p-2 rounded-lg transition-colors duration-200",
        isActive
          ? "bg-[var(--accent)] text-white"
          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)]",
        className
      )}
      title={label}
      aria-label={label}
    >
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon name="loader" className="w-4 h-4" />
        </motion.div>
      ) : (
        <Icon name={icon} className="w-4 h-4" />
      )}

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center px-0.5 rounded-full text-[9px] font-bold",
            isActive
              ? "bg-white text-[var(--accent)]"
              : "bg-[var(--accent)] text-white"
          )}
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}

// ============================================
// Floating Action Bar (Alternative)
// ============================================

interface FloatingActionBarProps extends Omit<ModuleActionBarProps, "variant"> {
  position?: "top" | "bottom";
}

export function FloatingActionBar({
  position = "bottom",
  className = "",
  ...props
}: FloatingActionBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: position === "bottom" ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50",
        position === "bottom" ? "bottom-6" : "top-20",
        className
      )}
    >
      <div className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-[var(--border)] shadow-xl">
        <ModuleActionBar {...props} variant="compact" className="bg-transparent border-none p-0" />
      </div>
    </motion.div>
  );
}
