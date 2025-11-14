"use client";

import { TrendingUp, TrendingDown, Users, Book, BookOpen, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  iconName: 'users' | 'book' | 'book-open' | 'alert-circle';
  color: string;
  bgColor: string;
  sparklineData?: Array<{ value: number }>;
  subtitle?: string;
  locale?: string;
}

export default function StatCard({
  title,
  value,
  change,
  trend,
  iconName,
  color,
  bgColor,
  sparklineData,
  subtitle,
  locale,
}: StatCardProps) {
  const isRTL = locale === 'ar';
  // Get the icon component based on the icon name
  const getIcon = () => {
    switch (iconName) {
      case 'users':
        return Users;
      case 'book':
        return Book;
      case 'book-open':
        return BookOpen;
      case 'alert-circle':
        return AlertCircle;
      default:
        return Users;
    }
  };

  const Icon = getIcon();
  // Convert Tailwind color class to hex color
  const getHexColor = (tailwindColor: string) => {
    const colorMap: { [key: string]: string } = {
      'text-blue-600': '#3B82F6',
      'text-green-600': '#10B981',
      'text-purple-600': '#8B5CF6',
      'text-red-600': '#EF4444',
    };
    return colorMap[tailwindColor] || '#3B82F6';
  };

  // Get gradient background based on color
  const getBgGradient = (colorClass: string) => {
    const gradientMap: { [key: string]: string } = {
      'text-blue-600': 'from-blue-50 to-cyan-50',
      'text-green-600': 'from-green-50 to-emerald-50',
      'text-purple-600': 'from-purple-50 to-fuchsia-50',
      'text-red-600': 'from-red-50 to-orange-50',
    };
    return gradientMap[colorClass] || 'from-blue-50 to-cyan-50';
  };

  return (
    <div
      className={`bg-gradient-to-br ${getBgGradient(color)} ${isRTL ? 'border-r-4' : 'border-l-4'} rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 h-full`}
      style={isRTL ? { borderRightColor: getHexColor(color) } : { borderLeftColor: getHexColor(color) }}
    >
      <div className={`flex items-start justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2.5 rounded-xl ${bgColor} transition-transform hover:scale-110 duration-300`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>

      <div className="text-3xl font-bold text-gray-900 mb-2 animate-fadeIn">{value}</div>

      {change && (
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          } ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {trend === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
