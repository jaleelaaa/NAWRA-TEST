'use client';

import { Search, Filter, UserPlus, Download, Grid3X3, List, X, CheckSquare, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslations, useLocale } from 'next-intl';
import { SortDropdown, type SortField, type SortOrder } from './SortDropdown';
import { buttonVariants } from '@/lib/animations';
import type { ViewMode } from '@/lib/types/users';

interface ActionBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterRole: string;
  onFilterRoleChange: (role: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  selectionMode: boolean;
  onSelectionModeChange: (enabled: boolean) => void;
  onAddUser: () => void;
  onExport?: () => void;
}

export function ActionBar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  selectionMode,
  onSelectionModeChange,
  onAddUser,
  onExport,
}: ActionBarProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const activeFilters = [
    filterRole !== 'all' && { label: `${t('filters.role')}: ${filterRole}`, key: 'role' },
    filterStatus !== 'all' && { label: `${t('filters.status')}: ${filterStatus}`, key: 'status' },
  ].filter(Boolean) as { label: string; key: string }[];

  const clearFilter = (key: string) => {
    if (key === 'role') onFilterRoleChange('all');
    if (key === 'status') onFilterStatusChange('all');
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-[#8B1538]/10">
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]`} aria-hidden="true" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${isRTL ? 'pr-10' : 'pl-10'} border-[#8B1538]/20 focus:border-[#C4A647] focus:ring-[#C4A647]`}
            aria-label={t('searchPlaceholder')}
            role="searchbox"
          />
        </div>

        {/* Filters and Actions */}
        <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Select value={filterRole} onValueChange={onFilterRoleChange}>
            <SelectTrigger className="w-[140px] border-[#8B1538]/20" aria-label={t('filters.role')}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
                <SelectValue placeholder={t('filters.role')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allRoles')}</SelectItem>
              <SelectItem value="admin">{t('roles.admin')}</SelectItem>
              <SelectItem value="librarian">{t('roles.librarian')}</SelectItem>
              <SelectItem value="student">{t('roles.student')}</SelectItem>
              <SelectItem value="teacher">{t('roles.teacher')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-[140px] border-[#8B1538]/20" aria-label={t('filters.status')}>
              <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
                <SelectValue placeholder={t('filters.status')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatus')}</SelectItem>
              <SelectItem value="active">{t('filters.active')}</SelectItem>
              <SelectItem value="pending">{t('filters.pending')}</SelectItem>
              <SelectItem value="inactive">{t('filters.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <SortDropdown
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />

          <div className="h-6 w-px bg-[#8B1538]/20" />

          {/* Selection Mode Toggle */}
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionModeChange(!selectionMode)}
              className={`border-[#8B1538]/20 transition-all ${
                selectionMode
                  ? 'bg-[#8B1538] text-white hover:bg-[#A61D45] border-[#8B1538]'
                  : 'bg-transparent hover:bg-[#8B1538]/5'
              }`}
              title={selectionMode ? t('actions.exitSelectionMode') : t('actions.enterSelectionMode')}
            >
              {selectionMode ? (
                <>
                  <CheckSquare className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('actions.select')}</span>
                </>
              ) : (
                <>
                  <Square className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  <span className="hidden sm:inline">{t('actions.select')}</span>
                </>
              )}
            </Button>
          </motion.div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-[#F5F1E8] p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
              title={t('view.grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange('table')}
              className={viewMode === 'table' ? 'bg-white shadow-sm' : ''}
              title={t('view.table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="border-[#8B1538]/20 bg-transparent"
              aria-label={t('actions.export')}
            >
              <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
              {t('actions.export')}
            </Button>
          )}

          <Button
            size="sm"
            onClick={onAddUser}
            className="bg-[#8B1538] hover:bg-[#A61D45] text-white shadow-lg"
            aria-label={t('addUser')}
          >
            <UserPlus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} aria-hidden="true" />
            {t('addUser')}
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-sm text-[#6B7280]">{t('filters.activeFilters')}</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="bg-[#C4A647]/10 text-[#8B1538] hover:bg-[#C4A647]/20"
            >
              {filter.label}
              <button
                onClick={() => clearFilter(filter.key)}
                className={`${isRTL ? 'mr-2' : 'ml-2'} hover:text-[#DC2626]`}
                aria-label={t('filters.clearFilter')}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
