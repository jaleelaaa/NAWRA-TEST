'use client';

import { motion } from 'framer-motion';
import { Palette, Layout, Type } from 'lucide-react';
import { SettingSelect, SettingToggle } from '../fields';
import type { SettingsFormData, SelectOption } from '@/lib/types/settings';

interface AppearanceSettingsProps {
  formData: SettingsFormData;
  onFieldChange: (field: keyof SettingsFormData, value: any) => void;
  t: (key: string) => string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function AppearanceSettings({ formData, onFieldChange, t }: AppearanceSettingsProps) {
  const themeOptions: SelectOption<'light' | 'dark' | 'auto'>[] = [
    { value: 'light', label: t('settings.appearance.theme.light') },
    { value: 'dark', label: t('settings.appearance.theme.dark') },
    { value: 'auto', label: t('settings.appearance.theme.auto') },
  ];

  const densityOptions: SelectOption<'compact' | 'default' | 'comfortable'>[] = [
    { value: 'compact', label: t('settings.appearance.density.compact') },
    { value: 'default', label: t('settings.appearance.density.default') },
    { value: 'comfortable', label: t('settings.appearance.density.comfortable') },
  ];

  const fontSizeOptions: SelectOption<'small' | 'medium' | 'large' | 'extra-large'>[] = [
    { value: 'small', label: t('settings.appearance.fontSize.small') },
    { value: 'medium', label: t('settings.appearance.fontSize.medium') },
    { value: 'large', label: t('settings.appearance.fontSize.large') },
    { value: 'extra-large', label: t('settings.appearance.fontSize.extraLarge') },
  ];

  const animationOptions: SelectOption<'none' | 'reduced' | 'default' | 'fast'>[] = [
    { value: 'none', label: t('settings.appearance.animation.none') },
    { value: 'reduced', label: t('settings.appearance.animation.reduced') },
    { value: 'default', label: t('settings.appearance.animation.default') },
    { value: 'fast', label: t('settings.appearance.animation.fast') },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Palette className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.appearance.theme.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.appearance.theme.description')}</p>
          </div>
        </div>
        <SettingSelect id="theme" label={t('settings.appearance.theme.label')} value={formData.theme} onValueChange={(value) => onFieldChange('theme', value)} options={themeOptions} />
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Layout className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.appearance.layout.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.appearance.layout.description')}</p>
          </div>
        </div>
        <div className="space-y-4">
          <SettingSelect id="density" label={t('settings.appearance.density.label')} value={formData.interfaceDensity} onValueChange={(value) => onFieldChange('interfaceDensity', value)} options={densityOptions} />
          <SettingSelect id="animationSpeed" label={t('settings.appearance.animation.label')} value={formData.animationSpeed} onValueChange={(value) => onFieldChange('animationSpeed', value)} options={animationOptions} />
          <SettingToggle id="showBreadcrumbs" label={t('settings.appearance.breadcrumbs.label')} description={t('settings.appearance.breadcrumbs.description')} checked={formData.showBreadcrumbs} onCheckedChange={(value) => onFieldChange('showBreadcrumbs', value)} />
        </div>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Type className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.appearance.typography.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.appearance.typography.description')}</p>
          </div>
        </div>
        <SettingSelect id="fontSize" label={t('settings.appearance.fontSize.label')} value={formData.fontSize} onValueChange={(value) => onFieldChange('fontSize', value)} options={fontSizeOptions} />
      </motion.div>
    </div>
  );
}
