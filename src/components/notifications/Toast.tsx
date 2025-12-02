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
};

interface ToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const config = typeConfig[notification.type];

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
      {/* Progress bar for auto-dismiss */}
      {notification.duration !== 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 rounded-b-xl"
          style={{ backgroundColor: config.color }}
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{
            duration: (notification.duration || 5000) / 1000,
            ease: "linear",
          }}
        />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: config.bgColor }}
        >
          <Icon
            name={config.icon}
            className="w-4 h-4"
            style={{ color: config.color }}
          />
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
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-xs font-medium mt-2 hover:underline"
              style={{ color: config.color }}
            >
              {notification.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
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
