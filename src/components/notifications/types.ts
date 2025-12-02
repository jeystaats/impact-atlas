export type NotificationType = "success" | "error" | "warning" | "info" | "ai-insight" | "progress";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  persistent: boolean; // If true, appears in notification center
  duration?: number; // Toast duration in ms (default 5000, 0 = persistent)
  progress?: number; // 0-100 for progress notifications
  action?: {
    label: string;
    onClick: () => void;
  };
  meta?: {
    moduleId?: string;
    moduleSlug?: string;
    cityId?: string;
    cityName?: string;
    aiGenerated?: boolean;
  };
}

export interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  unreadCount: number;
}
