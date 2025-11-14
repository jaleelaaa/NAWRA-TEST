'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslations, useLocale } from 'next-intl';
import type { DashboardUser } from '@/lib/types/users';

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: DashboardUser | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteUserDialog({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeleting = false,
}: DeleteUserDialogProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Get display name based on locale
  const getDisplayName = () => {
    if (!user) return '';
    return (locale === 'ar' && user.arabic_name) ? user.arabic_name : user.full_name;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent
        className="bg-white border-[#DC2626]/20"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Danger Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#DC2626] to-[#991B1B]" />

        <AlertDialogHeader className="pt-4">
          <AlertDialogTitle className="text-2xl font-bold text-[#DC2626] flex items-center gap-2">
            <span className="text-3xl">⚠️</span>
            {t('confirmations.deleteTitle') || 'Delete User'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#6B7280] text-base">
            {t('confirmations.deleteUser')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {user && (
          <div className="my-4 p-4 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg">
            <div className="space-y-2">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-semibold text-[#6B7280]">
                  {t('form.fullName')}:
                </span>
                <span className="text-sm text-[#1F2937]">{getDisplayName()}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-semibold text-[#6B7280]">
                  {t('form.email')}:
                </span>
                <span className="text-sm text-[#1F2937]">{user.email}</span>
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-semibold text-[#6B7280]">
                  {t('form.role')}:
                </span>
                <span className="text-sm text-[#1F2937]">{t(`roles.${user.role}`)}</span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="border-[#6B7280]/20 bg-transparent hover:bg-[#F3F4F6]"
          >
            {t('form.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-[#DC2626] hover:bg-[#991B1B] text-white"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                {t('actions.deleting') || 'Deleting...'}
              </span>
            ) : (
              t('actions.delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
