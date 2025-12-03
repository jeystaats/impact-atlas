"use client";

import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { Notification, NotificationType } from "./types";
import { cn } from "@/lib/utils";

const typeConfig: Record<
  NotificationType,
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
  warning: {
    icon: "warning",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.1)",
  },
  info: { icon: "info", color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" },
  "ai-insight": {
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

// Module-specific icons and colors
const moduleConfig: Record<string, { icon: IconName; color: string }> = {
  "urban-heat": { icon: "thermometer", color: "#EF4444" },
  "coastal-plastic": { icon: "waves", color: "#3B82F6" },
  "ocean-plastic": { icon: "droplets", color: "#06B6D4" },
  "port-emissions": { icon: "ship", color: "#6366F1" },
  biodiversity: { icon: "leaf", color: "#22C55E" },
  restoration: { icon: "trees", color: "#84CC16" },
};

interface ToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const config = typeConfig[notification.type];

  // Use module-specific styling if available
  const moduleStyle = notification.meta?.moduleSlug
    ? moduleConfig[notification.meta.moduleSlug]
    : null;
  const iconName = moduleStyle?.icon || config.icon;
  const iconColor = moduleStyle?.color || config.color;

  const isProgress = notification.type === "progress";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{
        type: "spring",
        damping: 25,
        stiffness: 300,
      }}
      className={cn(
        "relative w-80 p-4 rounded-xl",
        "bg-[var(--background-tertiary)] border border-[var(--border)]",
        "shadow-lg backdrop-blur-sm"
      )}
    >
      {/* Progress bar for auto-dismiss (non-progress notifications) */}
      {notification.duration !== 0 && !isProgress && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl"
          style={{ backgroundColor: iconColor }}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (notification.duration || 5000) / 1000,
            ease: "linear",
          }}
        />
      )}

      {/* Colored accent line for progress type */}
      {isProgress && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
          style={{ backgroundColor: iconColor }}
        />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          {isProgress ? (
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
            {notification.title}
          </p>
          {notification.message && (
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          )}

          {/* Progress bar for progress notifications */}
          {isProgress && notification.progress !== undefined && (
            <div className="mt-2 h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: iconColor }}
                initial={{ width: 0 }}
                animate={{ width: `${notification.progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs font-medium mt-2 hover:underline"
              style={{ color: iconColor }}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Icon name="x" className="w-4 h-4" />
        </button>
      </div>

      {/* AI badge */}
      {notification.meta?.aiGenerated && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[10px] font-medium flex items-center gap-1">
          <Icon name="sparkles" className="w-3 h-3" />
          AI
        </div>
      )}
    </motion.div>
  );
}
