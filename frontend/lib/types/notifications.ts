/**
 * Notifications Types
 * Type definitions for email and system notifications
 */

export enum NotificationType {
  EMAIL = 'email',
  SYSTEM = 'system',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationTemplate {
  WELCOME = 'welcome',
  OVERDUE_ITEM = 'overdue_item',
  RESERVATION_READY = 'reservation_ready',
  DUE_SOON = 'due_soon',
  FINE_NOTICE = 'fine_notice',
  PASSWORD_RESET = 'password_reset',
  ACCOUNT_CREATED = 'account_created',
  INSPECTION_DUE = 'inspection_due',
  RESTORATION_URGENT = 'restoration_urgent',
  SYSTEM_MAINTENANCE = 'system_maintenance',
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  template?: NotificationTemplate;
  template_data?: Record<string, any>;
  priority?: NotificationPriority;
  scheduled_at?: string;
}

export interface BulkEmailNotification {
  recipients: string[];
  subject: string;
  body: string;
  template?: NotificationTemplate;
  template_data?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  notification_id?: string;
  sent_at?: string;
  error?: string;
}

export interface BulkNotificationResponse {
  total_requested: number;
  successful: number;
  failed: number;
  results: Array<{
    email: string;
    status: string;
    error?: string;
  }>;
  message: string;
}

export interface OverdueNotificationRequest {
  send_immediately?: boolean;
  dry_run?: boolean;
}

export interface DueSoonNotificationRequest {
  days_before?: number;
  send_immediately?: boolean;
  dry_run?: boolean;
}

export interface NotificationStatistics {
  total_sent: number;
  successful: number;
  failed: number;
  pending: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
  recent_notifications: Array<Record<string, any>>;
}

// Helper functions
export const getTemplateLabel = (template: NotificationTemplate): string => {
  const labels: Record<NotificationTemplate, string> = {
    [NotificationTemplate.WELCOME]: 'Welcome Email',
    [NotificationTemplate.OVERDUE_ITEM]: 'Overdue Item Notice',
    [NotificationTemplate.RESERVATION_READY]: 'Reservation Ready',
    [NotificationTemplate.DUE_SOON]: 'Due Soon Reminder',
    [NotificationTemplate.FINE_NOTICE]: 'Fine Notice',
    [NotificationTemplate.PASSWORD_RESET]: 'Password Reset',
    [NotificationTemplate.ACCOUNT_CREATED]: 'Account Created',
    [NotificationTemplate.INSPECTION_DUE]: 'Inspection Due',
    [NotificationTemplate.RESTORATION_URGENT]: 'Urgent Restoration',
    [NotificationTemplate.SYSTEM_MAINTENANCE]: 'System Maintenance',
  };
  return labels[template] || template;
};

export const getPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    [NotificationPriority.LOW]: 'text-gray-600 bg-gray-50',
    [NotificationPriority.NORMAL]: 'text-blue-600 bg-blue-50',
    [NotificationPriority.HIGH]: 'text-orange-600 bg-orange-50',
    [NotificationPriority.URGENT]: 'text-red-600 bg-red-50',
  };
  return colors[priority] || 'text-gray-600 bg-gray-50';
};
