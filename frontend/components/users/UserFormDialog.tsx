'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { usersApi, invalidateQueries } from '@/lib/api';
import type { UserDetail, CreateUserRequest, UpdateUserRequest } from '@/lib/api/types';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  user?: UserDetail;
}

export default function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
}: UserFormDialogProps) {
  const t = useTranslations('users');
  const tc = useTranslations('common');
  const { toast } = useToast();

  // Create validation schema
  const createSchema = z.object({
    full_name: z.string().min(2, t('validation.nameMin')),
    arabic_name: z.string().optional(),
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMin')),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['admin', 'librarian', 'patron'], {
      required_error: t('validation.roleRequired'),
    }),
    user_type: z.enum(['Staff', 'Patron'], {
      required_error: t('validation.userTypeRequired'),
    }),
    is_active: z.boolean().default(true),
  });

  const editSchema = z.object({
    full_name: z.string().min(2, t('validation.nameMin')),
    arabic_name: z.string().optional(),
    email: z.string().email(t('validation.emailInvalid')),
    password: z.string().min(8, t('validation.passwordMin')).optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: z.enum(['admin', 'librarian', 'patron'], {
      required_error: t('validation.roleRequired'),
    }),
    user_type: z.enum(['Staff', 'Patron'], {
      required_error: t('validation.userTypeRequired'),
    }),
    is_active: z.boolean().default(true),
  });

  const schema = mode === 'create' ? createSchema : editSchema;
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: '',
      arabic_name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      role: 'patron',
      user_type: 'Patron',
      is_active: true,
    },
  });

  // Watch for role and user_type changes
  const role = watch('role');
  const userType = watch('user_type');
  const isActive = watch('is_active');

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open && mode === 'edit' && user) {
      reset({
        full_name: user.full_name,
        arabic_name: user.arabic_name || '',
        email: user.email,
        password: '',
        phone: user.phone || '',
        address: user.address || '',
        role: user.role as 'admin' | 'librarian' | 'patron',
        user_type: user.user_type as 'Staff' | 'Patron',
        is_active: user.is_active,
      });
    } else if (open && mode === 'create') {
      reset({
        full_name: '',
        arabic_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'patron',
        user_type: 'Patron',
        is_active: true,
      });
    }
  }, [open, mode, user, reset]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.createUser(data),
    onSuccess: () => {
      toast({
        title: t('messages.createSuccess'),
        variant: 'default',
      });
      invalidateQueries.users();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: t('messages.error'),
        description: error.response?.data?.detail || error.message,
        variant: 'destructive',
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      toast({
        title: t('messages.updateSuccess'),
        variant: 'default',
      });
      invalidateQueries.users();
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: t('messages.error'),
        description: error.response?.data?.detail || error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync(data as CreateUserRequest);
    } else if (mode === 'edit' && user) {
      // Remove password if empty for edit
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateMutation.mutateAsync({
        id: user.id,
        data: updateData as UpdateUserRequest,
      });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? t('addUser') : t('editUser')}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              {t('form.fullName')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder={t('form.fullNamePlaceholder')}
              className={errors.full_name ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Arabic Name */}
          <div className="space-y-2">
            <Label htmlFor="arabic_name" className="text-sm font-medium text-gray-700">
              {t('form.arabicName')}
            </Label>
            <Input
              id="arabic_name"
              {...register('arabic_name')}
              placeholder={t('form.arabicNamePlaceholder')}
              className={errors.arabic_name ? 'border-red-500' : ''}
              disabled={isLoading}
              dir="rtl"
            />
            {errors.arabic_name && (
              <p className="text-sm text-red-500">{errors.arabic_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('form.email')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('form.emailPlaceholder')}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('form.password')}{' '}
              {mode === 'create' ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="text-sm text-gray-500">{tc('optional')}</span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder={t('form.passwordPlaceholder')}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-gray-500">
                {t('form.keepCurrentPassword')}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              {t('form.phone')}
            </Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder={t('form.phonePlaceholder')}
              className={errors.phone ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              {t('form.address')}
            </Label>
            <Input
              id="address"
              {...register('address')}
              placeholder={t('form.addressPlaceholder')}
              className={errors.address ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-gray-700">
              {t('form.role')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(value) => setValue('role', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('form.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                <SelectItem value="librarian">{t('roles.librarian')}</SelectItem>
                <SelectItem value="patron">{t('roles.patron')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* User Type */}
          <div className="space-y-2">
            <Label htmlFor="user_type" className="text-sm font-medium text-gray-700">
              {t('form.userType')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={userType}
              onValueChange={(value) => setValue('user_type', value as any)}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.user_type ? 'border-red-500' : ''}>
                <SelectValue placeholder={t('form.selectUserType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Staff">{t('form.staff')}</SelectItem>
                <SelectItem value="Patron">{t('form.patron')}</SelectItem>
              </SelectContent>
            </Select>
            {errors.user_type && (
              <p className="text-sm text-red-500">{errors.user_type.message}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                {t('form.isActive')}
              </Label>
              <p className="text-xs text-gray-500">
                {isActive ? t('status.active') : t('status.inactive')}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-[#8B2635] hover:bg-[#6B1F2E]"
              disabled={isLoading}
            >
              {isLoading
                ? tc('loading')
                : mode === 'create'
                ? t('form.create')
                : t('form.update')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
