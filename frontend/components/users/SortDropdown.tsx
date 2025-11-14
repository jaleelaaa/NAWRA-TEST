'use client';

import { ArrowUpDown, ArrowUp, ArrowDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTranslations, useLocale } from 'next-intl';
import { listItemVariants, scaleVariants } from '@/lib/animations';

export type SortField = 'full_name' | 'email' | 'created_at' | 'last_login' | 'role';
export type SortOrder = 'asc' | 'desc';

interface SortDropdownProps {
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export function SortDropdown({ sortBy, sortOrder, onSortChange }: SortDropdownProps) {
  const t = useTranslations('users');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const sortOptions: { field: SortField; label: string }[] = [
    { field: 'full_name', label: t('sort.name') },
    { field: 'email', label: t('sort.email') },
    { field: 'created_at', label: t('sort.dateCreated') },
    { field: 'last_login', label: t('sort.lastLogin') },
    { field: 'role', label: t('sort.role') },
  ];

  const getSortLabel = () => {
    const option = sortOptions.find((opt) => opt.field === sortBy);
    return option ? option.label : t('sort.sortBy');
  };

  const handleSort = (field: SortField) => {
    // Toggle order if same field, otherwise default to descending
    if (field === sortBy) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'desc');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover="hover" whileTap="tap" variants={scaleVariants}>
          <Button
            variant="outline"
            className="border-[#8B1538]/20 hover:bg-[#8B1538]/5 hover:border-[#8B1538] transition-all"
          >
            <ArrowUpDown className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            <span className="hidden sm:inline">{getSortLabel()}</span>
            <span className="sm:hidden">{t('sort.sort')}</span>
            <motion.div
              className={isRTL ? 'mr-2' : 'ml-2'}
              animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-3 w-3 text-[#8B1538]" />
              ) : (
                <ArrowDown className="h-3 w-3 text-[#8B1538]" />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-56">
        <div className="px-2 py-1.5 text-sm font-semibold text-[#8B1538]">
          {t('sort.sortBy')}
        </div>
        <DropdownMenuSeparator />
        <AnimatePresence>
          {sortOptions.map((option, index) => (
            <motion.div
              key={option.field}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ delay: index * 0.05 }}
            >
              <DropdownMenuItem
                onClick={() => handleSort(option.field)}
                className={`cursor-pointer ${
                  sortBy === option.field
                    ? 'bg-[#8B1538]/10 text-[#8B1538] font-medium'
                    : ''
                }`}
              >
                <div className={`flex items-center justify-between w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{option.label}</span>
                  {sortBy === option.field && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-4 w-4 text-[#8B1538]" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            </motion.div>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
