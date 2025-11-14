'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, RotateCcw, Save, Loader2 } from 'lucide-react';

interface SettingsFooterProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isRTL: boolean;
  onSave: () => void;
  onCancel: () => void;
  onResetToDefaults: () => void;
  t: (key: string) => string;
}

export function SettingsFooter({
  hasUnsavedChanges,
  isSaving,
  isRTL,
  onSave,
  onCancel,
  onResetToDefaults,
  t,
}: SettingsFooterProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#8B1538]/20 shadow-xl p-4"
      style={{
        [isRTL ? 'marginRight' : 'marginLeft']: '288px', // Desktop sidebar offset
      }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-sm">
          {hasUnsavedChanges ? (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-[#6B7280]">
                {t('settings.footer.unsavedChanges')}
              </span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-[#6B7280]">
                {t('settings.footer.allSaved')}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onResetToDefaults}
            className="text-[#6B7280] hover:text-[#8B1538]"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('settings.footer.resetDefaults')}
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="border-[#8B1538]/20 hover:border-[#8B1538]"
            disabled={!hasUnsavedChanges}
          >
            {t('common.cancel')}
          </Button>

          <Button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-gradient-to-r from-[#8B2635] to-[#6B1F2E] hover:from-[#A61D45] hover:to-[#8B2635] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.saving')}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {t('common.save')}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
