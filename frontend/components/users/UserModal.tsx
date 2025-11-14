'use client';

import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslations, useLocale } from 'next-intl';
import type { DashboardUser } from '@/lib/types/users';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: DashboardUser | null;
  onSave?: (data: Partial<DashboardUser>) => void;
}

export function UserModal({ isOpen, onClose, user, onSave }: UserModalProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      full_name: formData.get('full_name') as string,
      arabic_name: formData.get('arabic_name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as string,
      status: formData.get('status') as string,
      user_id: formData.get('user_id') as string,
    };

    onSave?.(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] bg-white border-[#8B1538]/20"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Gradient Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#8B1538] via-[#C4A647] to-[#00693E]" />

        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl font-bold text-[#8B1538]">
            {user ? t('editUser') : t('addUser')}
          </DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            {user ? t('form.updateUserDescription') : t('form.addNewUserDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[#8B1538] font-semibold">
                  {t('form.fullName')}
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={user?.full_name}
                  placeholder={t('form.fullNamePlaceholder')}
                  className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arabic_name" className="text-[#8B1538] font-semibold">
                  {t('form.arabicName')}
                </Label>
                <Input
                  id="arabic_name"
                  name="arabic_name"
                  defaultValue={user?.arabic_name}
                  placeholder={t('form.arabicNamePlaceholder')}
                  className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647] text-right"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#8B1538] font-semibold">
                {t('form.email')}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email}
                placeholder={t('form.emailPlaceholder')}
                className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-[#8B1538] font-semibold">
                  {t('form.role')}
                </Label>
                <Select name="role" defaultValue={user?.role || 'student'}>
                  <SelectTrigger className="border-[#8B1538]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('roles.adminFull')}</SelectItem>
                    <SelectItem value="librarian">{t('roles.librarianFull')}</SelectItem>
                    <SelectItem value="teacher">{t('roles.teacherFull')}</SelectItem>
                    <SelectItem value="student">{t('roles.studentFull')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#8B1538] font-semibold">
                  {t('form.status')}
                </Label>
                <Select name="status" defaultValue={user?.status || 'active'}>
                  <SelectTrigger className="border-[#8B1538]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('status.active')}</SelectItem>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="inactive">{t('status.inactive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_id" className="text-[#8B1538] font-semibold">
                {t('form.userId')}
              </Label>
              <Input
                id="user_id"
                name="user_id"
                defaultValue={user?.user_id}
                placeholder={t('form.userIdPlaceholder')}
                className="border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647]"
              />
            </div>

            {user && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#F5F1E8] rounded-lg border border-[#8B1538]/10">
                <div>
                  <div className="text-sm text-[#6B7280]">{t('form.booksBorrowed')}</div>
                  <div className="text-2xl font-bold text-[#8B1538]">{user.books_borrowed}</div>
                </div>
                <div>
                  <div className="text-sm text-[#6B7280]">{t('form.outstandingFines')}</div>
                  <div className="text-2xl font-bold text-[#DC2626]">
                    {new Intl.NumberFormat(locale === 'ar' ? 'ar-OM' : 'en-US', {
                      style: 'currency',
                      currency: 'OMR'
                    }).format(user.fines)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-[#8B1538]/20 bg-transparent"
            >
              <X className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('form.cancel')}
            </Button>
            <Button type="submit" className="bg-[#8B1538] hover:bg-[#A61D45] text-white">
              <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {user ? t('form.saveChanges') : t('form.createUser')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
