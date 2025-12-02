"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icons";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { NotificationItem } from "./NotificationItem";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useNotificationStore((state) => state.notifications);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearAll = useNotificationStore((state) => state.clearAll);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const count = unreadCount();

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && count > 0) {
            markAllAsRead();
          }
        }}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-[var(--background-secondary)]",
          isOpen && "bg-[var(--background-secondary)]"
        )}
      >
        <Icon
          name="activity"
          className="w-5 h-5 text-[var(--foreground-secondary)]"
        />

        {/* Unread badge */}
        <AnimatePresence>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] text-white text-xs font-medium flex items-center justify-center"
            >
              {count > 9 ? "9+" : count}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring for new notifications */}
        {count > 0 && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-[var(--accent)]"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "absolute right-0 top-full mt-2 z-50",
                "w-96 max-h-[480px] overflow-hidden",
                "bg-[var(--background-tertiary)] rounded-xl",
                "border border-[var(--border)] shadow-xl"
              )}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--foreground)]">
                  Notifications
                </h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Notification list */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <Icon
                      name="activity"
                      className="w-8 h-8 mx-auto text-[var(--foreground-muted)] mb-2"
                    />
                    <p className="text-sm text-[var(--foreground-muted)]">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border)]">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
