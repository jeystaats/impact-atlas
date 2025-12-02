import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Notification } from "@/components/notifications/types";

interface NotificationStore {
  notifications: Notification[];
  toasts: Notification[];

  // Actions
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => string;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissToast: (id: string) => void;

  // Computed
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      toasts: [],

      addNotification: (notification) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newNotification: Notification = {
          ...notification,
          id,
          timestamp: new Date(),
          read: false,
        };

        set((state) => ({
          notifications: notification.persistent
            ? [newNotification, ...state.notifications].slice(0, 50) // Keep last 50
            : state.notifications,
          toasts: [...state.toasts, newNotification],
        }));

        // Auto-dismiss toast after duration (skip for progress type or duration=0)
        if (notification.duration !== 0 && notification.type !== "progress") {
          setTimeout(() => {
            get().dismissToast(id);
          }, notification.duration || 5000);
        }

        return id;
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, ...updates } : n
          ),
          toasts: state.toasts.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      dismissToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: "impact-atlas-notifications",
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
