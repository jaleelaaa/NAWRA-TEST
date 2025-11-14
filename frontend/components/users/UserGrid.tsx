'use client';

import { Mail, Edit, Trash2, MoreVertical, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';
import { containerVariants, cardVariants, scaleVariants, pulseVariants } from '@/lib/animations';
import type { DashboardUser } from '@/lib/types/users';

interface UserGridProps {
  users: DashboardUser[];
  onEditUser: (user: DashboardUser) => void;
  onDeleteUser?: (user: DashboardUser) => void;
  onMessageUser?: (user: DashboardUser) => void;
  selectionMode?: boolean;
  selectedUsers?: Set<string>;
  onToggleUser?: (userId: string) => void;
}

export function UserGrid({
  users,
  onEditUser,
  onDeleteUser,
  onMessageUser,
  selectionMode = false,
  selectedUsers = new Set(),
  onToggleUser
}: UserGridProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const isSelected = (userId: string) => selectedUsers.has(userId);

  // Get display name based on locale
  const getDisplayName = (user: DashboardUser) => {
    return (locale === 'ar' && user.arabic_name) ? user.arabic_name : user.full_name;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-emerald-900 font-bold border border-yellow-600',
      librarian: 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold',
      student: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold',
      teacher: 'bg-gradient-to-r from-emerald-800 to-emerald-900 text-yellow-300 font-bold',
      patron: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold',
    };
    return colors[role as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold', label: t('status.active') },
      pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-300 font-semibold', label: t('status.pending') },
      inactive: { color: 'bg-gray-50 text-gray-700 border-gray-300 font-semibold', label: t('status.inactive') },
    };
    return badges[status as keyof typeof badges] || badges.inactive;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <AnimatePresence mode="popLayout">
        {users.map((user) => (
          <motion.div
            key={user.id}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            layout
          >
            <Card
              className={`p-6 hover:shadow-2xl hover:shadow-emerald-900/20 bg-gradient-to-br from-white via-emerald-50/10 to-yellow-50/10 relative overflow-hidden group h-full transition-all duration-300 border-2 card-interactive ${
                isSelected(user.id)
                  ? 'border-emerald-600 shadow-lg shadow-emerald-900/30 bg-emerald-50/30'
                  : 'border-emerald-100/50 hover:border-emerald-300'
              }`}
            >
              {/* Selection Checkbox */}
              {selectionMode && onToggleUser && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-20`}
                >
                  <div
                    role="checkbox"
                    aria-checked={isSelected(user.id)}
                    aria-label={`${t('actions.select')} ${getDisplayName(user)}`}
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleUser(user.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleUser(user.id);
                      }
                    }}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 rounded-md"
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected(user.id)
                          ? 'bg-emerald-700 border-emerald-700 shadow-md'
                          : 'bg-white border-gray-400 hover:border-emerald-600'
                      }`}
                    >
                      <AnimatePresence>
                        {isSelected(user.id) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="h-4 w-4 text-yellow-300" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}

          {/* Islamic Pattern Background */}
          <div className="absolute inset-0 islamic-pattern opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="relative z-10">
            {/* Header with Avatar and Actions */}
            <div className={`flex items-start justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <Avatar className="h-16 w-16 border-3 border-yellow-500 shadow-lg ring-2 ring-emerald-200 ring-offset-2">
                    <AvatarImage src={user.avatar || '/placeholder.svg'} alt={getDisplayName(user)} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-yellow-300 font-bold text-lg">
                      {getInitials(getDisplayName(user))}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div
                    className={`absolute ${isRTL ? '-left-1' : '-right-1'} -bottom-1 w-5 h-5 rounded-full border-2 border-white shadow-md ${
                      user.is_online ? 'bg-emerald-600' : 'bg-gray-500'
                    }`}
                    title={user.is_online ? t('card.online') : t('card.offline')}
                    animate={user.is_online ? "pulse" : {}}
                    variants={pulseVariants}
                  />
                </motion.div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                  <DropdownMenuItem onClick={() => onEditUser(user)}>
                    <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('actions.edit')}
                  </DropdownMenuItem>
                  {onMessageUser && (
                    <DropdownMenuItem onClick={() => onMessageUser(user)}>
                      <Mail className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('actions.message')}
                    </DropdownMenuItem>
                  )}
                  {onDeleteUser && (
                    <DropdownMenuItem
                      onClick={() => onDeleteUser(user)}
                      className="text-[#DC2626]"
                    >
                      <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('actions.delete')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Info */}
            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-emerald-900 text-lg">
                  {getDisplayName(user)}
                </h3>
              </div>

              <motion.div
                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  variants={scaleVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.35 }}
                >
                  <Badge className={`${getRoleBadgeColor(user.role)} text-xs uppercase`}>
                    {t(`roles.${user.role}`)}
                  </Badge>
                </motion.div>
                <motion.div
                  variants={scaleVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: 0.4 }}
                >
                  <Badge variant="outline" className={`${getStatusBadge(user.status).color} text-xs`}>
                    {getStatusBadge(user.status).label}
                  </Badge>
                </motion.div>
              </motion.div>

              <div className="text-sm text-[#6B7280] space-y-1">
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="text-xs">
                  {t('card.userId')}: {user.user_id}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t-2 border-emerald-200/50">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-emerald-800">{user.books_borrowed}</div>
                  <div className="text-xs text-emerald-700 font-medium">{t('card.books')}</div>
                </div>
                <div className="bg-red-50/50 rounded-lg p-2">
                  <div className="text-lg font-bold text-red-700">
                    {new Intl.NumberFormat(locale === 'ar' ? 'ar-OM' : 'en-US', {
                      style: 'currency',
                      currency: 'OMR'
                    }).format(user.fines)}
                  </div>
                  <div className="text-xs text-red-600 font-medium">{t('card.fines')}</div>
                </div>
                <div className="bg-yellow-50/50 rounded-lg p-2">
                  <div className="text-xs text-gray-700 font-medium">{t('card.lastLogin')}</div>
                  <div className="text-xs font-bold text-emerald-800">{user.last_login}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
