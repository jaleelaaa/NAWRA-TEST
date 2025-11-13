'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { TrendingUp, Clock, FileText, Calendar, Download, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    label: string;
    type: 'up' | 'info';
  };
  gradient: 'blue' | 'green' | 'purple' | 'red';
  borderColor: string;
}

const gradientMap = {
  blue: 'from-blue-50 to-cyan-50',
  green: 'from-green-50 to-emerald-50',
  purple: 'from-purple-50 to-fuchsia-50',
  red: 'from-red-50 to-pink-50',
};

const bgColorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-[#8B1538]',
};

function StatCard({
  title,
  value,
  icon,
  trend,
  gradient,
  borderColor,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState<string | number>(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animate number if value is a number
    if (typeof value === 'number') {
      const duration = 1000;
      const steps = 50;
      const increment = value / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep <= steps) {
          setDisplayValue(Math.round(increment * currentStep));
        } else {
          setDisplayValue(value);
          setIsAnimating(false);
          clearInterval(timer);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
      setIsAnimating(false);
    }
  }, [value]);

  return (
    <div
      className={`
        bg-gradient-to-br ${gradientMap[gradient]} rounded-2xl p-5
        transition-all duration-300 hover:shadow-2xl
        hover:-translate-y-2 cursor-pointer group h-full
        animate-fade-in
      `}
      style={{ borderInlineStartWidth: '4px', borderInlineStartColor: borderColor }}
    >
      {/* Icon */}
      <div
        className={`
          ${bgColorMap[gradient]} w-14 h-14 rounded-xl flex items-center
          justify-center mb-4 group-hover:scale-110 transition-transform
          duration-300
        `}
      >
        <div className="text-white w-7 h-7">{icon}</div>
      </div>

      {/* Label */}
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
        {title}
      </p>

      {/* Value */}
      <p className={`text-3xl font-bold text-gray-900 mb-2 ${isAnimating ? 'animate-pulse' : ''}`}>
        {displayValue}
      </p>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          {trend.type === 'up' ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600 animate-bounce" />
              <span className="font-semibold text-green-600">{trend.value}</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">{trend.value}</span>
            </>
          )}
          <span className="text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

interface ReportStatsCardsProps {
  stats?: {
    total_reports: { count: number; change: number };
    active_period: { start_date: string; end_date: string; days_active: number };
    export_operations: { count: number; change: number; period: string };
    categories: { count: number; active_types: string[] };
  };
  isLoading?: boolean;
}

export default function ReportStatsCards({ stats, isLoading }: ReportStatsCardsProps) {
  const t = useTranslations('reports.stats');

  // Format date range display
  const formatDateRange = () => {
    if (!stats?.active_period) return 'Jan 1 - Mar 31';

    const start = new Date(stats.active_period.start_date);
    const end = new Date(stats.active_period.end_date);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 animate-pulse h-[160px]"
          >
            <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: t('totalReports').toUpperCase(),
      value: stats?.total_reports?.count || 128,
      icon: <FileText className="w-full h-full" />,
      trend: {
        value: `+${stats?.total_reports?.change || 15}%`,
        label: t('thisMonth'),
        type: 'up' as const,
      },
      gradient: 'blue' as const,
      borderColor: '#0284C7',
    },
    {
      title: t('activePeriod').toUpperCase(),
      value: formatDateRange(),
      icon: <Calendar className="w-full h-full" />,
      trend: {
        value: `${stats?.active_period?.days_active || 90} days`,
        label: t('active'),
        type: 'info' as const,
      },
      gradient: 'green' as const,
      borderColor: '#00693E',
    },
    {
      title: t('exports').toUpperCase(),
      value: stats?.export_operations?.count || 23,
      icon: <Download className="w-full h-full" />,
      trend: {
        value: `+${stats?.export_operations?.count || 23}`,
        label: t('thisWeek'),
        type: 'up' as const,
      },
      gradient: 'purple' as const,
      borderColor: '#7C3AED',
    },
    {
      title: t('categories').toUpperCase(),
      value: stats?.categories?.count || 5,
      icon: <Layers className="w-full h-full" />,
      trend: {
        value: t('active'),
        label: t('types'),
        type: 'info' as const,
      },
      gradient: 'red' as const,
      borderColor: '#8B1538',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}
