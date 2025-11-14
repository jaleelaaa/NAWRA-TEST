'use client';

import { motion } from 'framer-motion';
import { Shield, Clock } from 'lucide-react';
import { SettingToggle, SettingSelect } from '../fields';
import type { SettingsFormData, SelectOption } from '@/lib/types/settings';

interface SecuritySettingsProps {
  formData: SettingsFormData;
  onFieldChange: (field: keyof SettingsFormData, value: any) => void;
  t: (key: string) => string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function SecuritySettings({ formData, onFieldChange, t }: SecuritySettingsProps) {
  const sessionTimeoutOptions: SelectOption[] = [
    { value: '900', label: '15 minutes' },
    { value: '1800', label: '30 minutes' },
    { value: '3600', label: '1 hour' },
    { value: '14400', label: '4 hours' },
    { value: '86400', label: '24 hours' },
  ];

  return (
    <div className="space-y-6">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Shield className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.security.authentication.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.security.authentication.description')}</p>
          </div>
        </div>
        <SettingToggle
          id="twoFactorEnabled"
          label={t('settings.security.twoFactor.label')}
          description={t('settings.security.twoFactor.description')}
          checked={formData.twoFactorEnabled}
          onCheckedChange={(value) => onFieldChange('twoFactorEnabled', value)}
        />
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Clock className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.security.session.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.security.session.description')}</p>
          </div>
        </div>
        <SettingSelect
          id="sessionTimeout"
          label={t('settings.security.session.timeout')}
          description={t('settings.security.session.timeoutDesc')}
          value={formData.sessionTimeout.toString()}
          onValueChange={(value) => onFieldChange('sessionTimeout', parseInt(value))}
          options={sessionTimeoutOptions}
        />
      </motion.div>
    </div>
  );
}
