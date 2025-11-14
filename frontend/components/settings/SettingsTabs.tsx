'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Palette, Bell, Shield, Server } from 'lucide-react';
import {
  GeneralSettings,
  AppearanceSettings,
  NotificationSettings,
  SecuritySettings,
  SystemSettings,
} from './sections';
import type { SettingsFormData } from '@/lib/types/settings';

interface SettingsTabsProps {
  formData: SettingsFormData;
  onFieldChange: (field: keyof SettingsFormData, value: any) => void;
  t: (key: string) => string;
  isRTL: boolean;
  onExportData: () => void;
  onClearCache: () => void;
}

export function SettingsTabs({
  formData,
  onFieldChange,
  t,
  isRTL,
  onExportData,
  onClearCache,
}: SettingsTabsProps) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-1 flex flex-wrap gap-1">
        <TabsTrigger
          value="general"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#8B2635] data-[state=active]:to-[#6B1F2E] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#6B7280] hover:text-[#8B1538] transition-all duration-300 font-medium"
        >
          <User className="h-4 w-4" />
          <span>{t('settings.tabs.general')}</span>
        </TabsTrigger>

        <TabsTrigger
          value="appearance"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#8B2635] data-[state=active]:to-[#6B1F2E] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#6B7280] hover:text-[#8B1538] transition-all duration-300 font-medium"
        >
          <Palette className="h-4 w-4" />
          <span>{t('settings.tabs.appearance')}</span>
        </TabsTrigger>

        <TabsTrigger
          value="notifications"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#8B2635] data-[state=active]:to-[#6B1F2E] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#6B7280] hover:text-[#8B1538] transition-all duration-300 font-medium"
        >
          <Bell className="h-4 w-4" />
          <span>{t('settings.tabs.notifications')}</span>
        </TabsTrigger>

        <TabsTrigger
          value="security"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#8B2635] data-[state=active]:to-[#6B1F2E] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#6B7280] hover:text-[#8B1538] transition-all duration-300 font-medium"
        >
          <Shield className="h-4 w-4" />
          <span>{t('settings.tabs.security')}</span>
        </TabsTrigger>

        <TabsTrigger
          value="system"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#8B2635] data-[state=active]:to-[#6B1F2E] data-[state=active]:text-white data-[state=active]:shadow-lg text-[#6B7280] hover:text-[#8B1538] transition-all duration-300 font-medium"
        >
          <Server className="h-4 w-4" />
          <span>{t('settings.tabs.system')}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        <GeneralSettings
          formData={formData}
          onFieldChange={onFieldChange}
          t={t}
          isRTL={isRTL}
        />
      </TabsContent>

      <TabsContent value="appearance" className="mt-6">
        <AppearanceSettings
          formData={formData}
          onFieldChange={onFieldChange}
          t={t}
        />
      </TabsContent>

      <TabsContent value="notifications" className="mt-6">
        <NotificationSettings
          formData={formData}
          onFieldChange={onFieldChange}
          t={t}
        />
      </TabsContent>

      <TabsContent value="security" className="mt-6">
        <SecuritySettings
          formData={formData}
          onFieldChange={onFieldChange}
          t={t}
        />
      </TabsContent>

      <TabsContent value="system" className="mt-6">
        <SystemSettings
          t={t}
          onExportData={onExportData}
          onClearCache={onClearCache}
        />
      </TabsContent>
    </Tabs>
  );
}
