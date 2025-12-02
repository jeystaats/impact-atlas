"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { Hotspot, Module } from "@/types";
import {
  exportToCSV,
  exportHotspotsToCSV,
  generatePDFReport,
  copyToClipboard,
  copyHotspotsData,
  exportChartAsPNG,
} from "@/lib/export";

// ============================================
// Types
// ============================================

export interface ExportMenuProps {
  /** Module data for PDF report generation */
  module?: Module;
  /** Hotspots data for CSV export */
  hotspots?: Hotspot[];
  /** City name for report context */
  cityName?: string;
  /** Reference to chart element for PNG export */
  chartRef?: React.RefObject<HTMLElement>;
  /** Custom data for CSV export (overrides hotspots) */
  customData?: Record<string, unknown>[];
  /** Custom filename prefix */
  filenamePrefix?: string;
  /** Callback when export starts */
  onExportStart?: (type: ExportType) => void;
  /** Callback when export completes */
  onExportComplete?: (type: ExportType, success: boolean) => void;
  /** Additional CSS classes */
  className?: string;
  /** Disable specific export types */
  disabledOptions?: ExportType[];
}

export type ExportType = "csv" | "pdf" | "png" | "clipboard";

interface ExportOption {
  id: ExportType;
  label: string;
  description: string;
  icon: IconName;
  shortcut?: string;
}

// ============================================
// Constants
// ============================================

const exportOptions: ExportOption[] = [
  {
    id: "csv",
    label: "Export as CSV",
    description: "Download data as spreadsheet",
    icon: "download",
    shortcut: "C",
  },
  {
    id: "pdf",
    label: "Export as PDF",
    description: "Generate summary report",
    icon: "clipboard",
    shortcut: "P",
  },
  {
    id: "png",
    label: "Export Chart as PNG",
    description: "Download visualization",
    icon: "chart",
    shortcut: "I",
  },
  {
    id: "clipboard",
    label: "Copy to Clipboard",
    description: "Copy data as text",
    icon: "clipboard",
    shortcut: "V",
  },
];

// Animation configuration
const springTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 30,
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: -8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      ...springTransition,
      delay: i * 0.03,
    },
  }),
};

// ============================================
// Component
// ============================================

export function ExportMenu({
  module,
  hotspots = [],
  cityName,
  chartRef,
  customData,
  filenamePrefix = "impact-atlas",
  onExportStart,
  onExportComplete,
  className = "",
  disabledOptions = [],
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportingType, setExportingType] = useState<ExportType | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case "c":
        case "C":
          if (event.metaKey || event.ctrlKey) return;
          handleExport("csv");
          break;
        case "p":
        case "P":
          if (event.metaKey || event.ctrlKey) return;
          handleExport("pdf");
          break;
        case "i":
        case "I":
          handleExport("png");
          break;
        case "v":
        case "V":
          if (event.metaKey || event.ctrlKey) return;
          handleExport("clipboard");
          break;
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Clear feedback after delay
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleExport = useCallback(
    async (type: ExportType) => {
      if (disabledOptions.includes(type)) return;
      if (exportingType) return; // Prevent concurrent exports

      setExportingType(type);
      onExportStart?.(type);

      let success = false;

      try {
        switch (type) {
          case "csv":
            if (customData && customData.length > 0) {
              exportToCSV(customData, filenamePrefix);
              success = true;
            } else if (hotspots.length > 0) {
              exportHotspotsToCSV(hotspots, module?.id || "data");
              success = true;
            } else {
              setFeedback({ type: "error", message: "No data available to export" });
            }
            break;

          case "pdf":
            if (module) {
              generatePDFReport({
                module,
                hotspots,
                cityName,
                generatedAt: new Date(),
              });
              success = true;
            } else {
              setFeedback({ type: "error", message: "Module data required for PDF export" });
            }
            break;

          case "png":
            if (chartRef?.current) {
              success = await exportChartAsPNG(
                chartRef.current,
                `${filenamePrefix}-chart`
              );
              if (!success) {
                setFeedback({ type: "error", message: "Failed to export chart" });
              }
            } else {
              setFeedback({ type: "error", message: "No chart available to export" });
            }
            break;

          case "clipboard":
            if (hotspots.length > 0) {
              const result = await copyHotspotsData(hotspots, "text");
              success = result.success;
              setFeedback({
                type: result.success ? "success" : "error",
                message: result.message,
              });
            } else if (customData && customData.length > 0) {
              const result = await copyToClipboard(JSON.stringify(customData, null, 2));
              success = result.success;
              setFeedback({
                type: result.success ? "success" : "error",
                message: result.message,
              });
            } else {
              setFeedback({ type: "error", message: "No data available to copy" });
            }
            break;
        }

        if (success && type !== "clipboard") {
          setFeedback({ type: "success", message: "Export successful" });
        }
      } catch (error) {
        console.error("Export failed:", error);
        setFeedback({ type: "error", message: "Export failed. Please try again." });
      } finally {
        setExportingType(null);
        onExportComplete?.(type, success);
        setIsOpen(false);
      }
    },
    [customData, hotspots, module, cityName, chartRef, filenamePrefix, disabledOptions, exportingType, onExportStart, onExportComplete]
  );

  const availableOptions = exportOptions.filter(
    (opt) => !disabledOptions.includes(opt.id)
  );

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={springTransition}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${isOpen
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--background-tertiary)] border border-[var(--border)] text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:border-[var(--foreground-muted)]"
          }
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Icon name="download" className="w-4 h-4" />
        <span>Export</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springTransition}
        >
          <Icon name="chevronDown" className="w-3 h-3" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 top-full mt-2 w-64 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]">
                <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wide">
                  Export Options
                </p>
              </div>

              {/* Options */}
              <div className="py-1">
                {availableOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => handleExport(option.id)}
                    disabled={exportingType !== null}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left
                      transition-colors duration-150
                      ${exportingType === option.id
                        ? "bg-[var(--accent-bg)]"
                        : "hover:bg-[var(--background-secondary)]"
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    role="menuitem"
                  >
                    {/* Icon */}
                    <div
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${exportingType === option.id
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
                        }
                      `}
                    >
                      {exportingType === option.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Icon name="loader" className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <Icon name={option.icon} className="w-4 h-4" />
                      )}
                    </div>

                    {/* Label & Description */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {option.label}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] truncate">
                        {option.description}
                      </p>
                    </div>

                    {/* Keyboard Shortcut */}
                    {option.shortcut && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-[var(--foreground-muted)] bg-[var(--background-secondary)] rounded border border-[var(--border)]">
                        {option.shortcut}
                      </kbd>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Feedback Toast */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`
                      mx-3 mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2
                      ${feedback.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                      }
                    `}
                  >
                    <Icon
                      name={feedback.type === "success" ? "check" : "warning"}
                      className="w-3.5 h-3.5"
                    />
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
