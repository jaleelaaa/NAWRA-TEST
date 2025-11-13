'use client';

import React, { useState } from 'react';
import { Filter, X, Sparkles, CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FilterState {
  dateRange: { from: string; to: string };
  status: string;
  category: string;
}

interface ReportFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onGenerate: () => void;
  isLoading?: boolean;
}

export default function ReportFilters({
  onFiltersChange,
  onGenerate,
  isLoading = false,
}: ReportFiltersProps) {
  const t = useTranslations('reports.filters');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: '', to: '' },
    status: 'all',
    category: 'all',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string; value: string }>>([]);

  const handleFilterChange = (key: keyof FilterState, value: string | object) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleGenerateClick = () => {
    const newActive = [];
    if (filters.dateRange.from)
      newActive.push({
        key: 'date',
        label: t('dateRange'),
        value: `${filters.dateRange.from} - ${filters.dateRange.to}`,
      });
    if (filters.status !== 'all')
      newActive.push({
        key: 'status',
        label: t('status'),
        value: filters.status,
      });
    if (filters.category !== 'all')
      newActive.push({
        key: 'category',
        label: t('category'),
        value: filters.category,
      });
    setActiveFilters(newActive);
    onGenerate();
  };

  const clearFilter = (key: string) => {
    const updated = activeFilters.filter((f) => f.key !== key);
    setActiveFilters(updated);
  };

  const clearAll = () => {
    setActiveFilters([]);
    setFilters({
      dateRange: { from: '', to: '' },
      status: 'all',
      category: 'all',
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#8B1538]" />
          {t('title')}
        </h3>

        {activeFilters.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            {t('clearAll')}
          </button>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Range Picker */}
        <div className="lg:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">📅 {t('dateRange')}</label>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl hover:shadow-md transition-all text-left flex items-center justify-between group"
          >
            <span className="text-gray-700 font-medium">
              {filters.dateRange.from ? `${filters.dateRange.from} - ${filters.dateRange.to}` : t('selectDateRange')}
            </span>
            <CalendarDays className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>

          {showDatePicker && (
            <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 w-full">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {['thisWeek', 'thisMonth', 'lastMonth', 'threeMonths', 'sixMonths', 'thisYear'].map((preset) => (
                  <button
                    key={preset}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-[#8B1538] hover:text-white rounded-lg transition-colors"
                  >
                    {t(`presets.${preset}`)}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      from: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      to: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('status')}</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#8B1538] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 transition-all"
          >
            <option value="all">{t('allStatus')}</option>
            <option value="active">{t('active')}</option>
            <option value="completed">{t('completed')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('category')}</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-[#8B1538] focus:border-[#8B1538] focus:ring-2 focus:ring-[#8B1538]/20 transition-all"
          >
            <option value="all">{t('allCategories')}</option>
            <option value="circulation">Circulation</option>
            <option value="user_activity">User Activity</option>
            <option value="collection">Collection</option>
            <option value="financial">Financial</option>
            <option value="overview">Overview</option>
          </select>
        </div>

        {/* Generate Button */}
        <div className="flex items-end">
          <button
            onClick={handleGenerateClick}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#8B1538] to-[#A61D45] text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            {isLoading ? 'Loading...' : t('generate')}
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t('activeFilters')}</p>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <div
                key={filter.key}
                className="px-3 py-1.5 bg-gradient-to-r from-[#8B1538] to-[#A61D45] text-white rounded-full text-sm font-medium flex items-center gap-2 group hover:shadow-lg transition-all"
              >
                <span>{filter.value}</span>
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
