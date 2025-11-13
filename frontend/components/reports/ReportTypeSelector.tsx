'use client';

import React, { ReactNode } from 'react';
import { Check, Target, BookMarked, Users, Library, DollarSign, BarChart3 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReportType } from '@/lib/types/reports';

interface ReportTypeCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  gradient: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const gradientMap = {
  blue: 'from-blue-50 to-cyan-50',
  green: 'from-green-50 to-emerald-50',
  purple: 'from-purple-50 to-fuchsia-50',
  amber: 'from-amber-50 to-orange-50',
  red: 'from-red-50 to-pink-50',
};

const borderMap = {
  blue: 'border-blue-300',
  green: 'border-green-300',
  purple: 'border-purple-300',
  amber: 'border-amber-300',
  red: 'border-red-300',
};

function ReportTypeCard({
  icon,
  title,
  description,
  selected,
  onClick,
  gradient,
}: ReportTypeCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden
        rounded-2xl p-6 cursor-pointer
        transition-all duration-500 transform
        ${
          selected
            ? 'bg-gradient-to-br from-[#8B1538] to-[#A61D45] text-white shadow-2xl scale-105 ring-4 ring-[#8B1538]/30'
            : `bg-gradient-to-br ${gradientMap[gradient]} hover:shadow-xl hover:scale-102 border-2 ${borderMap[gradient]}`
        }
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id={`pattern-${title}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2" height="2" fill="currentColor" />
          </pattern>
          <rect width="100" height="100" fill={`url(#pattern-${title})`} />
        </svg>
      </div>

      {/* Icon */}
      <div
        className={`
          relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-4
          transition-all duration-300 group-hover:scale-110
          ${selected ? 'bg-white/20' : 'bg-gray-400/20'}
        `}
      >
        <div className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-700'}`}>
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="relative z-10 text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform">
        {title}
      </h3>

      {/* Description */}
      <p className={`relative z-10 text-sm leading-relaxed ${selected ? 'text-white/90' : 'text-gray-600'}`}>
        {description}
      </p>

      {/* Selected Indicator */}
      {selected && (
        <div className="absolute top-4 right-4 z-20">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-5 h-5 text-[#8B1538]" />
          </div>
        </div>
      )}

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
    </div>
  );
}

interface ReportTypeSelectorProps {
  selectedType: ReportType;
  onSelectType: (type: ReportType) => void;
}

export default function ReportTypeSelector({
  selectedType,
  onSelectType,
}: ReportTypeSelectorProps) {
  const t = useTranslations('reports.types');

  const reportTypes = [
    {
      id: 'circulation' as ReportType,
      icon: <BookMarked className="w-full h-full" />,
      title: t('circulation.title'),
      description: t('circulation.description'),
      gradient: 'blue' as const,
    },
    {
      id: 'user_activity' as ReportType,
      icon: <Users className="w-full h-full" />,
      title: t('userActivity.title'),
      description: t('userActivity.description'),
      gradient: 'green' as const,
    },
    {
      id: 'collection' as ReportType,
      icon: <Library className="w-full h-full" />,
      title: t('collection.title'),
      description: t('collection.description'),
      gradient: 'purple' as const,
    },
    {
      id: 'financial' as ReportType,
      icon: <DollarSign className="w-full h-full" />,
      title: t('financial.title'),
      description: t('financial.description'),
      gradient: 'amber' as const,
    },
    {
      id: 'overview' as ReportType,
      icon: <BarChart3 className="w-full h-full" />,
      title: t('overview.title'),
      description: t('overview.description'),
      gradient: 'red' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Target className="w-6 h-6 text-[#8B1538]" />
        {t('selectTitle')}
      </h2>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((type) => (
          <ReportTypeCard
            key={type.id}
            icon={type.icon}
            title={type.title}
            description={type.description}
            selected={selectedType === type.id}
            onClick={() => onSelectType(type.id)}
            gradient={type.gradient}
          />
        ))}
      </div>
    </div>
  );
}
