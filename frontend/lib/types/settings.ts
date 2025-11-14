/**
 * Settings types for user preferences and configuration
 */

export interface GeneralSettings {
  display_name?: string | null;
  language: 'en' | 'ar';
  date_format: string;
  time_format: '12h' | '24h';
  default_landing_page: string;
  items_per_page: number;
  default_view_mode: 'grid' | 'list' | 'table';
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  interface_density: 'compact' | 'default' | 'comfortable';
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  animation_speed: 'none' | 'reduced' | 'default' | 'fast';
  show_breadcrumbs: boolean;
}

export interface EmailNotificationSettings {
  system_announcements: boolean;
  due_date_reminders: boolean;
  overdue_notifications: boolean;
  new_circulation_requests: boolean;
  user_registration: boolean;
  daily_digest: boolean;
  digest_time: string;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  sound: boolean;
  badge_counters: boolean;
  position: 'top-right' | 'top-center' | 'bottom-right';
  auto_dismiss_time: number;
}

export interface NotificationSettings {
  email: EmailNotificationSettings;
  in_app: InAppNotificationSettings;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  last_password_change?: string | null;
}

export interface UserSettings {
  id: string;
  user_id: string;
  general: GeneralSettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  created_at: string;
  updated_at: string;
}

export interface SettingsUpdate {
  general?: Partial<GeneralSettings>;
  appearance?: Partial<AppearanceSettings>;
  notifications?: Partial<NotificationSettings>;
  security?: Partial<SecuritySettings>;
}

export interface SettingsResetRequest {
  section: 'all' | 'general' | 'appearance' | 'notifications' | 'security';
}

// Form data types for react-hook-form
export interface SettingsFormData {
  // General
  displayName: string;
  language: 'en' | 'ar';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  defaultLandingPage: string;
  itemsPerPage: number;
  defaultViewMode: 'grid' | 'list' | 'table';

  // Appearance
  theme: 'light' | 'dark' | 'auto';
  interfaceDensity: 'compact' | 'default' | 'comfortable';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  animationSpeed: 'none' | 'reduced' | 'default' | 'fast';
  showBreadcrumbs: boolean;

  // Notifications - Email
  emailSystemAnnouncements: boolean;
  emailDueDateReminders: boolean;
  emailOverdueNotifications: boolean;
  emailNewCirculationRequests: boolean;
  emailUserRegistration: boolean;
  emailDailyDigest: boolean;
  emailDigestTime: string;

  // Notifications - In-App
  inAppEnabled: boolean;
  inAppSound: boolean;
  inAppBadgeCounters: boolean;
  inAppPosition: 'top-right' | 'top-center' | 'bottom-right';
  inAppAutoDismissTime: number;

  // Security
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

// Helper type for select options
export interface SelectOption<T = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}
