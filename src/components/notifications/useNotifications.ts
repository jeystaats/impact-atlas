"use client";

import { useCallback } from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationType } from "./types";

export function useNotifications() {
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const dismissToast = useNotificationStore((state) => state.dismissToast);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const notify = useCallback(
    (
      type: NotificationType,
      title: string,
      options?: {
        message?: string;
        persistent?: boolean;
        duration?: number;
        action?: { label: string; onClick: () => void };
        moduleId?: string;
        cityId?: string;
        aiGenerated?: boolean;
      }
    ) => {
      return addNotification({
        type,
        title,
        message: options?.message,
        persistent: options?.persistent ?? type !== "info",
        duration: options?.duration,
        action: options?.action,
        meta: {
          moduleId: options?.moduleId,
          cityId: options?.cityId,
          aiGenerated: options?.aiGenerated,
        },
      });
    },
    [addNotification]
  );

  // Convenience methods
  const success = useCallback(
    (
      title: string,
      message?: string,
      options?: Parameters<typeof notify>[2]
    ) => notify("success", title, { ...options, message }),
    [notify]
  );

  const error = useCallback(
    (
      title: string,
      message?: string,
      options?: Parameters<typeof notify>[2]
    ) => notify("error", title, { ...options, message, duration: 0 }), // Errors don't auto-dismiss
    [notify]
  );

  const warning = useCallback(
    (
      title: string,
      message?: string,
      options?: Parameters<typeof notify>[2]
    ) => notify("warning", title, { ...options, message }),
    [notify]
  );

  const info = useCallback(
    (
      title: string,
      message?: string,
      options?: Parameters<typeof notify>[2]
    ) => notify("info", title, { ...options, message }),
    [notify]
  );

  const aiInsight = useCallback(
    (
      title: string,
      message?: string,
      options?: Parameters<typeof notify>[2]
    ) => notify("ai-insight", title, { ...options, message, aiGenerated: true }),
    [notify]
  );

  return {
    notify,
    success,
    error,
    warning,
    info,
    aiInsight,
    dismiss: dismissToast,
    markAsRead,
    markAllAsRead,
  };
}
