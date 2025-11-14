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
      admin: 'bg-[#C4A647] text-white',
      librarian: 'bg-[#00693E] text-white',
      student: 'bg-[#0284C7] text-white',
      teacher: 'bg-[#8B1538] text-white',
      patron: 'bg-[#6B7280] text-white',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { color: 'bg-[#00693E]/10 text-[#00693E] border-[#00693E]/20', label: t('status.active') },
      pending: { color: 'bg-[#0284C7]/10 text-[#0284C7] border-[#0284C7]/20', label: t('status.pending') },
      inactive: { color: 'bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20', label: t('status.inactive') },
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
              className={`p-6 hover:shadow-xl bg-white relative overflow-hidden group h-full transition-all ${
                isSelected(user.id)
                  ? 'border-2 border-[#8B1538] shadow-lg bg-[#8B1538]/5'
                  : 'hover:border-[#C4A647]'
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
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B1538] focus:ring-offset-2 rounded-md"
                  >
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected(user.id)
                          ? 'bg-[#8B1538] border-[#8B1538]'
                          : 'bg-white border-[#6B7280] hover:border-[#8B1538]'
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
                            <Check className="h-4 w-4 text-white" />
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
                  <Avatar className="h-16 w-16 border-2 border-[#C4A647]">
                    <AvatarImage src={user.avatar || '/placeholder.svg'} alt={getDisplayName(user)} />
                    <AvatarFallback className="bg-gradient-to-br from-[#8B1538] to-[#6B0F2A] text-white font-bold">
                      {getInitials(getDisplayName(user))}
                    </AvatarFallback>
                  </Avatar>
                  <motion.div
                    className={`absolute ${isRTL ? '-left-1' : '-right-1'} -bottom-1 w-5 h-5 rounded-full border-2 border-white ${
                      user.is_online ? 'bg-[#00693E]' : 'bg-[#6B7280]'
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
                <h3 className="font-semibold text-[#8B1538] text-lg">
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
            <div className="mt-4 pt-4 border-t border-[#8B1538]/10">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-[#8B1538]">{user.books_borrowed}</div>
                  <div className="text-xs text-[#6B7280]">{t('card.books')}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-[#DC2626]">
                    {new Intl.NumberFormat(locale === 'ar' ? 'ar-OM' : 'en-US', {
                      style: 'currency',
                      currency: 'OMR'
                    }).format(user.fines)}
                  </div>
                  <div className="text-xs text-[#6B7280]">{t('card.fines')}</div>
                </div>
                <div>
                  <div className="text-xs text-[#6B7280] mt-1">{t('card.lastLogin')}</div>
                  <div className="text-xs font-medium text-[#8B1538]">{user.last_login}</div>
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
