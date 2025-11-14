'use client';

import { motion } from 'framer-motion';
import { User, Globe, Layout } from 'lucide-react';
import { SettingInput, SettingSelect, SettingSlider } from '../fields';
import type { SettingsFormData, SelectOption } from '@/lib/types/settings';

interface GeneralSettingsProps {
  formData: SettingsFormData;
  onFieldChange: (field: keyof SettingsFormData, value: any) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

export function GeneralSettings({
  formData,
  onFieldChange,
  t,
  isRTL,
}: GeneralSettingsProps) {
  const languageOptions: SelectOption<'en' | 'ar'>[] = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];

  const dateFormatOptions: SelectOption[] = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  ];

  const timeFormatOptions: SelectOption<'12h' | '24h'>[] = [
    { value: '12h', label: '12 Hour' },
    { value: '24h', label: '24 Hour' },
  ];

  const landingPageOptions: SelectOption[] = [
    { value: 'dashboard', label: t('settings.general.pages.dashboard') },
    { value: 'catalog', label: t('settings.general.pages.catalog') },
    { value: 'circulation', label: t('settings.general.pages.circulation') },
    { value: 'reports', label: t('settings.general.pages.reports') },
  ];

  const viewModeOptions: SelectOption<'grid' | 'list' | 'table'>[] = [
    { value: 'grid', label: t('settings.general.viewModes.grid') },
    { value: 'list', label: t('settings.general.viewModes.list') },
    { value: 'table', label: t('settings.general.viewModes.table') },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <User className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#8B1538]">
              {t('settings.general.profile.title')}
            </h3>
            <p className="text-sm text-[#6B7280]">
              {t('settings.general.profile.description')}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <SettingInput
            id="displayName"
            label={t('settings.general.profile.displayName')}
            description={t('settings.general.profile.displayNameDesc')}
            value={formData.displayName}
            onChange={(value) => onFieldChange('displayName', value)}
            placeholder={t('settings.general.profile.displayNamePlaceholder')}
          />
        </div>
      </motion.div>

      {/* Language & Region */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Globe className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#8B1538]">
              {t('settings.general.language.title')}
            </h3>
            <p className="text-sm text-[#6B7280]">
              {t('settings.general.language.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <SettingSelect
            id="language"
            label={t('settings.general.language.interface')}
            description={t('settings.general.language.interfaceDesc')}
            value={formData.language}
            onValueChange={(value) => onFieldChange('language', value)}
            options={languageOptions}
          />

          <SettingSelect
            id="dateFormat"
            label={t('settings.general.language.dateFormat')}
            value={formData.dateFormat}
            onValueChange={(value) => onFieldChange('dateFormat', value)}
            options={dateFormatOptions}
          />

          <SettingSelect
            id="timeFormat"
            label={t('settings.general.language.timeFormat')}
            value={formData.timeFormat}
            onValueChange={(value) => onFieldChange('timeFormat', value)}
            options={timeFormatOptions}
          />
        </div>
      </motion.div>

      {/* Default Preferences */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Layout className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[#8B1538]">
              {t('settings.general.defaults.title')}
            </h3>
            <p className="text-sm text-[#6B7280]">
              {t('settings.general.defaults.description')}
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <SettingSelect
            id="defaultLandingPage"
            label={t('settings.general.defaults.landingPage')}
            description={t('settings.general.defaults.landingPageDesc')}
            value={formData.defaultLandingPage}
            onValueChange={(value) => onFieldChange('defaultLandingPage', value)}
            options={landingPageOptions}
          />

          <SettingSlider
            id="itemsPerPage"
            label={t('settings.general.defaults.itemsPerPage')}
            description={t('settings.general.defaults.itemsPerPageDesc')}
            value={formData.itemsPerPage}
            onValueChange={(value) => onFieldChange('itemsPerPage', value)}
            min={10}
            max={100}
            step={6}
            minLabel="10"
            maxLabel="100"
          />

          <SettingSelect
            id="defaultViewMode"
            label={t('settings.general.defaults.viewMode')}
            description={t('settings.general.defaults.viewModeDesc')}
            value={formData.defaultViewMode}
            onValueChange={(value) => onFieldChange('defaultViewMode', value)}
            options={viewModeOptions}
          />
        </div>
      </motion.div>
    </div>
  );
}
