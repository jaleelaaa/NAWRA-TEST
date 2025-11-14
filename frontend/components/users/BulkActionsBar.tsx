'use client';

import { Trash2, X, Check, UserX, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';
import { slideUpVariants, buttonVariants } from '@/lib/animations';

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkActivate?: () => void;
  onBulkDeactivate?: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onClearSelection,
  isDeleting = false,
}: BulkActionsBarProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          variants={slideUpVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white shadow-2xl rounded-2xl border-2 border-[#8B1538] p-4">
            <div
              className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              {/* Selection Counter */}
              <motion.div
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="bg-[#8B1538] text-white rounded-full px-4 py-2 font-bold"
                  key={selectedCount}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                >
                  {selectedCount}
                </motion.div>
                <span className="text-[#8B1538] font-medium">
                  {t('actions.selected', { count: selectedCount })}
                </span>
              </motion.div>

              {/* Divider */}
              <div className="h-8 w-px bg-[#8B1538]/20" />

              {/* Action Buttons */}
              <motion.div
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Activate Button */}
                {onBulkActivate && (
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#00693E] text-[#00693E] hover:bg-[#00693E] hover:text-white transition-colors"
                      onClick={onBulkActivate}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('actions.activate')}
                    </Button>
                  </motion.div>
                )}

                {/* Deactivate Button */}
                {onBulkDeactivate && (
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#6B7280] text-[#6B7280] hover:bg-[#6B7280] hover:text-white transition-colors"
                      onClick={onBulkDeactivate}
                    >
                      <UserX className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('actions.deactivate')}
                    </Button>
                  </motion.div>
                )}

                {/* Delete Button */}
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-colors"
                    onClick={onBulkDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className={isRTL ? 'ml-2' : 'mr-2'}
                        >
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                        </motion.div>
                        {t('actions.deleting')}
                      </>
                    ) : (
                      <>
                        <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('actions.bulkDelete')}
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Divider */}
                <div className="h-8 w-px bg-[#8B1538]/20" />

                {/* Clear Selection Button */}
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[#6B7280] hover:text-[#8B1538] hover:bg-[#8B1538]/5"
                    onClick={onClearSelection}
                  >
                    <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('filters.clearFilter')}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Decorative glow effect */}
          <motion.div
            className="absolute inset-0 bg-[#8B1538]/10 rounded-2xl blur-xl -z-10"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
