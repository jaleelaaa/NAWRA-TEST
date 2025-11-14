'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { usersApi, invalidateQueries } from '@/lib/api';
import type { UserDetail } from '@/lib/api/types';
import { DeleteUserDialog } from './DeleteUserDialog';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserDetail | null;
  onEdit?: (user: UserDetail) => void;
}

export default function UserDetailDialog({
  open,
  onOpenChange,
  user,
  onEdit,
}: UserDetailDialogProps) {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      toast({
        title: t('messages.deleteSuccess'),
        variant: 'default',
      });
      invalidateQueries.users();
      setDeleteDialogOpen(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('messages.error'),
        description: error.response?.data?.detail || error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle delete button click - open confirmation dialog
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!user) return;
    await deleteMutation.mutateAsync(user.id);
  };

  // Handle edit
  const handleEdit = () => {
    if (user && onEdit) {
      onEdit(user);
      onOpenChange(false);
    }
  };

  if (!user) return null;

  // Get display name based on locale
  const getDisplayName = () => {
    return (locale === 'ar' && user.arabic_name) ? user.arabic_name : user.full_name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {t('viewDetails')}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* User Header Section */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#8B2635]/10 to-[#D4AF37]/10 rounded-lg">
            <div className="h-20 w-20 rounded-full bg-[#8B2635] flex items-center justify-center text-white text-3xl font-bold">
              {getDisplayName().charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{getDisplayName()}</h3>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
            {user.is_active ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                {t('status.active')}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                <XCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                {t('status.inactive')}
              </Badge>
            )}
          </div>

          {/* Personal Information Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8B2635]" />
              {t('sections.personalInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.fullName')}
                </label>
                <p className="text-base text-gray-900">{getDisplayName()}</p>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.email')}
                </label>
                <p className="text-base text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {user.email}
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.phone')}
                </label>
                <p className="text-base text-gray-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {user.phone || tc('notAvailable')}
                </p>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.address')}
                </label>
                <p className="text-base text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {user.address || tc('notAvailable')}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Information Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#8B2635]" />
              {t('sections.accountInfo')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Role */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.role')}
                </label>
                <div>
                  <Badge variant="outline" className="text-base">
                    {t(`roles.${user.role}`)}
                  </Badge>
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.userType')}
                </label>
                <div>
                  <Badge
                    variant="secondary"
                    className={
                      user.user_type === 'Staff'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {user.user_type === 'Staff' ? tc('staff') : user.user_type === 'Patron' ? t('form.patron') : user.user_type}
                  </Badge>
                </div>
              </div>

              {/* Active Status */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">
                  {t('form.isActive')}
                </label>
                <div>
                  {user.is_active ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                      {t('status.active')}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      <XCircle className="w-3 h-3 mr-1 rtl:ml-1 rtl:mr-0" />
                      {t('status.inactive')}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('table.createdAt')}
                </label>
                <p className="text-base text-gray-900">
                  {new Date(user.created_at).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>

              {/* Last Updated */}
              {user.updated_at && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {t('form.lastUpdated')}
                  </label>
                  <p className="text-base text-gray-900">
                    {new Date(user.updated_at).toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }
                    )}
                  </p>
                </div>
              )}

              {/* User ID */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{t('form.userId')}</label>
                <p className="text-base text-gray-900 font-mono text-xs">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tc('close')}
            </Button>
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEdit}
                className="border-[#8B2635] text-[#8B2635] hover:bg-[#8B2635] hover:text-white"
              >
                <Edit className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('actions.edit')}
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('actions.delete')}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        user={user}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </Dialog>
  );
}
