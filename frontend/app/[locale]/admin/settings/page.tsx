'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { SettingsTabs } from '@/components/settings/SettingsTabs';
import { SettingsFooter } from '@/components/settings/SettingsFooter';
import { ResetConfirmDialog } from '@/components/settings/dialogs/ResetConfirmDialog';
import { useSettings, useUpdateSettings, useResetSettings } from '@/hooks/useSettings';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { useToast } from '@/hooks/use-toast';
import type { SettingsFormData, UserSettings } from '@/lib/types/settings';

export default function SettingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { toast } = useToast();

  // Fetch settings
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const resetSettings = useResetSettings();

  // Form state
  const [formData, setFormData] = useState<SettingsFormData>({
    // General
    displayName: '',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    defaultLandingPage: 'dashboard',
    itemsPerPage: 12,
    defaultViewMode: 'grid',
    // Appearance
    theme: 'light',
    interfaceDensity: 'default',
    fontSize: 'medium',
    animationSpeed: 'default',
    showBreadcrumbs: true,
    // Notifications - Email
    emailSystemAnnouncements: true,
    emailDueDateReminders: true,
    emailOverdueNotifications: true,
    emailNewCirculationRequests: true,
    emailUserRegistration: false,
    emailDailyDigest: false,
    emailDigestTime: '09:00',
    // Notifications - In-App
    inAppEnabled: true,
    inAppSound: true,
    inAppBadgeCounters: true,
    inAppPosition: 'top-right',
    inAppAutoDismissTime: 5,
    // Security
    twoFactorEnabled: false,
    sessionTimeout: 3600,
  });

  // Reset dialog state
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Initialize form with fetched settings
  useEffect(() => {
    if (settings) {
      setFormData({
        // General
        displayName: settings.general.display_name || '',
        language: settings.general.language,
        dateFormat: settings.general.date_format,
        timeFormat: settings.general.time_format,
        defaultLandingPage: settings.general.default_landing_page,
        itemsPerPage: settings.general.items_per_page,
        defaultViewMode: settings.general.default_view_mode,
        // Appearance
        theme: settings.appearance.theme,
        interfaceDensity: settings.appearance.interface_density,
        fontSize: settings.appearance.font_size,
        animationSpeed: settings.appearance.animation_speed,
        showBreadcrumbs: settings.appearance.show_breadcrumbs,
        // Notifications - Email
        emailSystemAnnouncements: settings.notifications.email.system_announcements,
        emailDueDateReminders: settings.notifications.email.due_date_reminders,
        emailOverdueNotifications: settings.notifications.email.overdue_notifications,
        emailNewCirculationRequests: settings.notifications.email.new_circulation_requests,
        emailUserRegistration: settings.notifications.email.user_registration,
        emailDailyDigest: settings.notifications.email.daily_digest,
        emailDigestTime: settings.notifications.email.digest_time,
        // Notifications - In-App
        inAppEnabled: settings.notifications.in_app.enabled,
        inAppSound: settings.notifications.in_app.sound,
        inAppBadgeCounters: settings.notifications.in_app.badge_counters,
        inAppPosition: settings.notifications.in_app.position,
        inAppAutoDismissTime: settings.notifications.in_app.auto_dismiss_time,
        // Security
        twoFactorEnabled: settings.security.two_factor_enabled,
        sessionTimeout: settings.security.session_timeout,
      });
    }
  }, [settings]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!settings) return false;
    return JSON.stringify(formData) !== JSON.stringify({
      displayName: settings.general.display_name || '',
      language: settings.general.language,
      dateFormat: settings.general.date_format,
      timeFormat: settings.general.time_format,
      defaultLandingPage: settings.general.default_landing_page,
      itemsPerPage: settings.general.items_per_page,
      defaultViewMode: settings.general.default_view_mode,
      theme: settings.appearance.theme,
      interfaceDensity: settings.appearance.interface_density,
      fontSize: settings.appearance.font_size,
      animationSpeed: settings.appearance.animation_speed,
      showBreadcrumbs: settings.appearance.show_breadcrumbs,
      emailSystemAnnouncements: settings.notifications.email.system_announcements,
      emailDueDateReminders: settings.notifications.email.due_date_reminders,
      emailOverdueNotifications: settings.notifications.email.overdue_notifications,
      emailNewCirculationRequests: settings.notifications.email.new_circulation_requests,
      emailUserRegistration: settings.notifications.email.user_registration,
      emailDailyDigest: settings.notifications.email.daily_digest,
      emailDigestTime: settings.notifications.email.digest_time,
      inAppEnabled: settings.notifications.in_app.enabled,
      inAppSound: settings.notifications.in_app.sound,
      inAppBadgeCounters: settings.notifications.in_app.badge_counters,
      inAppPosition: settings.notifications.in_app.position,
      inAppAutoDismissTime: settings.notifications.in_app.auto_dismiss_time,
      twoFactorEnabled: settings.security.two_factor_enabled,
      sessionTimeout: settings.security.session_timeout,
    });
  }, [formData, settings]);

  // Unsaved changes warning
  useUnsavedChanges({ hasUnsavedChanges });

  // Handlers
  const handleFieldChange = (field: keyof SettingsFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      general: {
        display_name: formData.displayName || null,
        language: formData.language,
        date_format: formData.dateFormat,
        time_format: formData.timeFormat,
        default_landing_page: formData.defaultLandingPage,
        items_per_page: formData.itemsPerPage,
        default_view_mode: formData.defaultViewMode,
      },
      appearance: {
        theme: formData.theme,
        interface_density: formData.interfaceDensity,
        font_size: formData.fontSize,
        animation_speed: formData.animationSpeed,
        show_breadcrumbs: formData.showBreadcrumbs,
      },
      notifications: {
        email: {
          system_announcements: formData.emailSystemAnnouncements,
          due_date_reminders: formData.emailDueDateReminders,
          overdue_notifications: formData.emailOverdueNotifications,
          new_circulation_requests: formData.emailNewCirculationRequests,
          user_registration: formData.emailUserRegistration,
          daily_digest: formData.emailDailyDigest,
          digest_time: formData.emailDigestTime,
        },
        in_app: {
          enabled: formData.inAppEnabled,
          sound: formData.inAppSound,
          badge_counters: formData.inAppBadgeCounters,
          position: formData.inAppPosition,
          auto_dismiss_time: formData.inAppAutoDismissTime,
        },
      },
      security: {
        two_factor_enabled: formData.twoFactorEnabled,
        session_timeout: formData.sessionTimeout,
        last_password_change: settings?.security.last_password_change || null,
      },
    });
  };

  const handleCancel = () => {
    if (settings) {
      // Reset form to current settings
      setFormData({
        displayName: settings.general.display_name || '',
        language: settings.general.language,
        dateFormat: settings.general.date_format,
        timeFormat: settings.general.time_format,
        defaultLandingPage: settings.general.default_landing_page,
        itemsPerPage: settings.general.items_per_page,
        defaultViewMode: settings.general.default_view_mode,
        theme: settings.appearance.theme,
        interfaceDensity: settings.appearance.interface_density,
        fontSize: settings.appearance.font_size,
        animationSpeed: settings.appearance.animation_speed,
        showBreadcrumbs: settings.appearance.show_breadcrumbs,
        emailSystemAnnouncements: settings.notifications.email.system_announcements,
        emailDueDateReminders: settings.notifications.email.due_date_reminders,
        emailOverdueNotifications: settings.notifications.email.overdue_notifications,
        emailNewCirculationRequests: settings.notifications.email.new_circulation_requests,
        emailUserRegistration: settings.notifications.email.user_registration,
        emailDailyDigest: settings.notifications.email.daily_digest,
        emailDigestTime: settings.notifications.email.digest_time,
        inAppEnabled: settings.notifications.in_app.enabled,
        inAppSound: settings.notifications.in_app.sound,
        inAppBadgeCounters: settings.notifications.in_app.badge_counters,
        inAppPosition: settings.notifications.in_app.position,
        inAppAutoDismissTime: settings.notifications.in_app.auto_dismiss_time,
        twoFactorEnabled: settings.security.two_factor_enabled,
        sessionTimeout: settings.security.session_timeout,
      });
    }
  };

  const handleResetToDefaults = () => {
    setShowResetDialog(true);
  };

  const handleConfirmReset = async () => {
    await resetSettings.mutateAsync({ section: 'all' });
    setShowResetDialog(false);
  };

  const handleExportData = () => {
    toast({
      title: t('settings.system.export.title'),
      description: t('settings.system.export.description'),
    });
  };

  const handleClearCache = () => {
    toast({
      title: t('settings.system.cache.cleared'),
      description: t('settings.system.cache.clearedDesc'),
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: t('nav.dashboard'), href: '/dashboard' },
    { label: t('nav.settings'), href: '/admin/settings', current: true },
  ];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B1538] mx-auto" />
            <p className="mt-4 text-[#6B7280]">{t('common.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div
        className="space-y-6 bg-[#F5F1E8] min-h-screen pb-24"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#8B2635] to-[#6B1F2E] rounded-xl shadow-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#8B1538]">
                {t('settings.title')}
              </h1>
              <p className="text-[#6B7280] text-sm">
                {t('settings.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <SettingsTabs
          formData={formData}
          onFieldChange={handleFieldChange}
          t={t}
          isRTL={isRTL}
          onExportData={handleExportData}
          onClearCache={handleClearCache}
        />

        {/* Footer */}
        <SettingsFooter
          hasUnsavedChanges={hasUnsavedChanges}
          isSaving={updateSettings.isPending}
          isRTL={isRTL}
          onSave={handleSave}
          onCancel={handleCancel}
          onResetToDefaults={handleResetToDefaults}
          t={t}
        />

        {/* Reset Confirmation Dialog */}
        <ResetConfirmDialog
          open={showResetDialog}
          onOpenChange={setShowResetDialog}
          onConfirm={handleConfirmReset}
          t={t}
        />
      </div>
    </AdminLayout>
  );
}
