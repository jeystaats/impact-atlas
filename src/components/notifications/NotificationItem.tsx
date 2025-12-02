"use client";

import { motion } from "framer-motion";
import { Icon, IconName } from "@/components/ui/icons";
import { Notification, NotificationType } from "./types";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { cn, timeAgo } from "@/lib/utils";

const typeConfig: Record<NotificationType, { icon: IconName; color: string }> = {
  success: { icon: "check", color: "#10B981" },
  error: { icon: "warning", color: "#EF4444" },
  warning: { icon: "warning", color: "#F59E0B" },
  info: { icon: "info", color: "#3B82F6" },
  "ai-insight": { icon: "sparkles", color: "#8B5CF6" },
  progress: { icon: "loader", color: "#0D9488" },
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );
  const config = typeConfig[notification.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group px-4 py-3 hover:bg-[var(--background-secondary)] transition-colors cursor-pointer",
        !notification.read && "bg-[var(--accent-bg)]"
      )}
    >
      <div className="flex gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon
            name={config.icon}
            className="w-4 h-4"
            style={{ color: config.color }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-[var(--foreground)] line-clamp-1">
              {notification.title}
            </p>
            <span className="text-xs text-[var(--foreground-muted)] whitespace-nowrap">
              {timeAgo(notification.timestamp)}
            </span>
          </div>
          {notification.message && (
            <p className="text-xs text-[var(--foreground-muted)] mt-0.5 line-clamp-2">
              {notification.message}
            </p>
          )}

          {notification.meta?.aiGenerated && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-[#8B5CF6]">
              <Icon name="sparkles" className="w-3 h-3" />
              <span>AI Generated</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeNotification(notification.id);
          }}
          className="flex-shrink-0 p-1 rounded text-[var(--foreground-muted)] hover:text-[var(--foreground)] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon name="x" className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
