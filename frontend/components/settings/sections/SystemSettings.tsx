'use client';

import { motion } from 'framer-motion';
import { Database, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemSettingsProps {
  t: (key: string) => string;
  onExportData: () => void;
  onClearCache: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export function SystemSettings({ t, onExportData, onClearCache }: SystemSettingsProps) {
  return (
    <div className="space-y-6">
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Download className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.system.data.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.system.data.description')}</p>
          </div>
        </div>
        <Button onClick={onExportData} variant="outline" className="w-full border-[#8B1538]/20">
          <Download className="h-4 w-4 mr-2" />
          {t('settings.system.data.export')}
        </Button>
      </motion.div>

      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white rounded-xl shadow-sm border border-[#8B1538]/10 p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#8B1538]/10">
          <div className="p-2 bg-[#8B2635]/10 rounded-lg">
            <Database className="h-5 w-5 text-[#8B1538]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8B1538]">{t('settings.system.cache.title')}</h3>
            <p className="text-sm text-[#6B7280]">{t('settings.system.cache.description')}</p>
          </div>
        </div>
        <Button onClick={onClearCache} variant="outline" className="w-full border-[#8B1538]/20">
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('settings.system.cache.clear')}
        </Button>
      </motion.div>
    </div>
  );
}
