'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, Download } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ReportChartsProps {
  trendData?: Array<{ date: string; value: number }>;
  distributionData?: Array<{ category: string; count: number }>;
  onExportChart?: () => void;
}

const defaultTrendData = [
  { date: 'Jan 1', value: 45 },
  { date: 'Jan 8', value: 52 },
  { date: 'Jan 15', value: 48 },
  { date: 'Jan 22', value: 61 },
  { date: 'Jan 29', value: 73 },
  { date: 'Feb 5', value: 68 },
  { date: 'Feb 12', value: 82 },
  { date: 'Feb 19', value: 91 },
  { date: 'Feb 26', value: 87 },
  { date: 'Mar 5', value: 105 },
  { date: 'Mar 12', value: 98 },
  { date: 'Mar 19', value: 128 },
];

const defaultDistributionData = [
  { category: 'Fiction', count: 285 },
  { category: 'Non-Fiction', count: 412 },
  { category: 'Reference', count: 198 },
  { category: 'Science', count: 334 },
  { category: 'History', count: 267 },
  { category: 'Art', count: 156 },
];

export default function ReportCharts({
  trendData = defaultTrendData,
  distributionData = defaultDistributionData,
  onExportChart,
}: ReportChartsProps) {
  const t = useTranslations('reports.charts');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Function to translate category names
  const translateCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Fiction': 'fiction',
      'Non-Fiction': 'nonFiction',
      'Reference': 'reference',
      'Science': 'science',
      'History': 'history',
      'Art': 'art',
    };
    const key = categoryMap[category];
    return key ? t(`categories.${key}`) : category;
  };

  // Function to format date labels with localized month names
  const formatDateLabel = (dateStr: string): string => {
    const monthMap: Record<string, string> = {
      'Jan': 'jan',
      'Feb': 'feb',
      'Mar': 'mar',
      'Apr': 'apr',
      'May': 'may',
      'Jun': 'jun',
      'Jul': 'jul',
      'Aug': 'aug',
      'Sep': 'sep',
      'Oct': 'oct',
      'Nov': 'nov',
      'Dec': 'dec',
    };

    const parts = dateStr.split(' ');
    if (parts.length === 2) {
      const [monthStr, day] = parts;
      const monthKey = monthMap[monthStr];
      if (monthKey) {
        const translatedMonth = t(`months.${monthKey}`);
        return `${translatedMonth} ${day}`;
      }
    }
    return dateStr;
  };

  // Transform data with translations
  const localizedTrendData = trendData.map(item => ({
    ...item,
    date: formatDateLabel(item.date),
  }));

  const localizedDistributionData = distributionData.map(item => ({
    ...item,
    category: translateCategory(item.category),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Trends Over Time */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#8B1538] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t('trendsOverTime')}
          </h3>

          {/* Period Toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  selectedPeriod === period
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t(`period.${period}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={localizedTrendData}
            margin={{
              top: 20,
              right: isRTL ? 10 : 30,
              bottom: 40,
              left: isRTL ? 30 : 10
            }}
          >
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B1538" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B1538" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'inherit'
              }}
              tick={{ dy: 10 }}
              height={60}
              interval="preserveStartEnd"
              angle={isRTL ? 0 : -20}
              textAnchor={isRTL ? "middle" : "end"}
            />
            <YAxis
              stroke="#6B7280"
              style={{
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'inherit'
              }}
              width={60}
              tickFormatter={(value) => value.toLocaleString(locale)}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #8B1538',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                fontWeight: 'bold',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#000' }}
            />
            <Legend wrapperStyle={{ fontWeight: 'bold', paddingTop: '20px' }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8B1538"
              strokeWidth={3}
              fill="url(#colorValue)"
              dot={{ r: 5, fill: '#8B1538', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8 }}
              name={t('reportsGenerated')}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Distribution by Category */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-shadow">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#8B1538] flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('distribution')}
          </h3>

          {/* Export Chart Button */}
          <button
            onClick={onExportChart}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-[#8B1538] border border-gray-300 rounded-lg hover:border-[#8B1538] transition-colors flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            {t('export')}
          </button>
        </div>

        {/* Bar Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={localizedDistributionData}
            margin={{
              top: 20,
              right: isRTL ? 10 : 30,
              bottom: 60,
              left: isRTL ? 30 : 10
            }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B1538" />
                <stop offset="100%" stopColor="#A61D45" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="category"
              stroke="#6B7280"
              style={{
                fontSize: isRTL ? '12px' : '11px',
                fontWeight: '600',
                fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'inherit'
              }}
              angle={isRTL ? -30 : -45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: isRTL ? 12 : 11 }}
            />
            <YAxis
              stroke="#6B7280"
              style={{
                fontSize: '11px',
                fontWeight: '600',
                fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'inherit'
              }}
              width={60}
              tickFormatter={(value) => value.toLocaleString(locale)}
              orientation={isRTL ? 'right' : 'left'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '2px solid #8B1538',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                fontWeight: 'bold',
              }}
              labelStyle={{ fontWeight: 'bold', color: '#000' }}
            />
            <Legend wrapperStyle={{ fontWeight: 'bold', paddingTop: '20px' }} />
            <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
