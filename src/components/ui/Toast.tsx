"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useToastStore, Toast as ToastType } from "@/stores/toastStore";
import { Icon, IconName } from "./icons";
import { cn } from "@/lib/utils";

const MODULE_ICONS: Record<string, { icon: IconName; color: string }> = {
  "urban-heat": { icon: "thermometer", color: "#EF4444" },
  "coastal-plastic": { icon: "waves", color: "#3B82F6" },
  "ocean-plastic": { icon: "droplets", color: "#06B6D4" },
  "port-emissions": { icon: "ship", color: "#6366F1" },
  biodiversity: { icon: "leaf", color: "#22C55E" },
  restoration: { icon: "trees", color: "#84CC16" },
};

const TYPE_CONFIG: Record<
  ToastType["type"],
  { icon: IconName; color: string; bgColor: string }
> = {
  success: {
    icon: "check",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.1)",
  },
  error: {
    icon: "warning",
    color: "#EF4444",
    bgColor: "rgba(239, 68, 68, 0.1)",
  },
  info: {
    icon: "sparkles",
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.1)",
  },
  progress: {
    icon: "loader",
    color: "#0D9488",
    bgColor: "rgba(13, 148, 136, 0.1)",
  },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToastStore();

  // Get module-specific styling if applicable
  const moduleConfig = toast.moduleSlug
    ? MODULE_ICONS[toast.moduleSlug]
    : null;
  const typeConfig = TYPE_CONFIG[toast.type];

  const iconName = moduleConfig?.icon || typeConfig.icon;
  const iconColor = moduleConfig?.color || typeConfig.color;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm",
        "bg-[var(--background-tertiary)]/95 border-[var(--border)]",
        "min-w-[320px] max-w-[400px]"
      )}
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        {toast.type === "progress" ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Icon name="loader" className="w-4 h-4" style={{ color: iconColor }} />
          </motion.div>
        ) : (
          <Icon name={iconName} className="w-4 h-4" style={{ color: iconColor }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)]">
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
            {toast.message}
          </p>
        )}

        {/* Progress bar for progress type */}
        {toast.type === "progress" && toast.progress !== undefined && (
          <div className="mt-2 h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: iconColor }}
              initial={{ width: 0 }}
              animate={{ width: `${toast.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 rounded-md hover:bg-[var(--background-secondary)] transition-colors"
      >
        <Icon name="x" className="w-3 h-3 text-[var(--foreground-muted)]" />
      </button>

      {/* Colored accent line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: iconColor }}
      />
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
