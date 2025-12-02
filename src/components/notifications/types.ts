export type NotificationType = "success" | "error" | "warning" | "info" | "ai-insight";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean; // If true, appears in notification center
  duration?: number; // Toast duration in ms (default 5000)
  action?: {
    label: string;
    onClick: () => void;
  };
  meta?: {
    moduleId?: string;
    cityId?: string;
    aiGenerated?: boolean;
  };
}

export interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
}
