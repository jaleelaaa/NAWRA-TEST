'use client';

import { motion } from 'framer-motion';
import { Bell, Mail } from 'lucide-react';
import { SettingToggle, SettingSelect, SettingSlider } from '../fields';
import type { SettingsFormData, SelectOption } from '@/lib/types/settings';

interface NotificationSettingsProps {
  formData: SettingsFormData;
  onFieldChange: (field: keyof SettingsFormData, value: any) => void;
  t: (key: string) => string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function NotificationSettings({ formData, onFieldChange, t }: NotificationSettingsProps) {
  const positionOptions: SelectOption<'top-right' | 'top-center' | 'bottom-right'>[] = [
    { value: 'top-right', label: t('settings.notifications.position.topRight') },
    { value: 'top-center', label: t('settings.notifications.position.topCenter') },
    { value: 'bottom-right', label: t('settings.notifications.position.bottomRight') },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Mail className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.notifications.email.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.notifications.email.description')}</p>
          </div>
        </div>
        <div className="space-y-2">
          <SettingToggle id="emailSystemAnnouncements" label={t('settings.notifications.email.systemAnnouncements')} checked={formData.emailSystemAnnouncements} onCheckedChange={(value) => onFieldChange('emailSystemAnnouncements', value)} />
          <SettingToggle id="emailDueDateReminders" label={t('settings.notifications.email.dueDateReminders')} checked={formData.emailDueDateReminders} onCheckedChange={(value) => onFieldChange('emailDueDateReminders', value)} />
          <SettingToggle id="emailOverdueNotifications" label={t('settings.notifications.email.overdueNotifications')} checked={formData.emailOverdueNotifications} onCheckedChange={(value) => onFieldChange('emailOverdueNotifications', value)} />
          <SettingToggle id="emailNewCirculationRequests" label={t('settings.notifications.email.newRequests')} checked={formData.emailNewCirculationRequests} onCheckedChange={(value) => onFieldChange('emailNewCirculationRequests', value)} />
        </div>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Bell className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.notifications.inApp.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.notifications.inApp.description')}</p>
          </div>
        </div>
        <div className="space-y-4">
          <SettingToggle id="inAppEnabled" label={t('settings.notifications.inApp.enabled')} checked={formData.inAppEnabled} onCheckedChange={(value) => onFieldChange('inAppEnabled', value)} />
          <SettingToggle id="inAppSound" label={t('settings.notifications.inApp.sound')} checked={formData.inAppSound} onCheckedChange={(value) => onFieldChange('inAppSound', value)} />
          <SettingToggle id="inAppBadgeCounters" label={t('settings.notifications.inApp.badges')} checked={formData.inAppBadgeCounters} onCheckedChange={(value) => onFieldChange('inAppBadgeCounters', value)} />
          <SettingSelect id="inAppPosition" label={t('settings.notifications.inApp.position')} value={formData.inAppPosition} onValueChange={(value) => onFieldChange('inAppPosition', value)} options={positionOptions} />
          <SettingSlider id="inAppAutoDismissTime" label={t('settings.notifications.inApp.autoDismiss')} value={formData.inAppAutoDismissTime} onValueChange={(value) => onFieldChange('inAppAutoDismissTime', value)} min={3} max={30} formatValue={(v) => `${v}s`} />
        </div>
      </motion.div>
    </div>
  );
}
