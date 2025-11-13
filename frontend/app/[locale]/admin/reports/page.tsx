'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/AdminLayout';
import Breadcrumb from '@/components/Breadcrumb';
import ReportStatsCards from '@/components/reports/ReportStatsCards';
import ReportTypeSelector from '@/components/reports/ReportTypeSelector';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportCharts from '@/components/reports/ReportCharts';
import ReportSummaryTable from '@/components/reports/ReportSummaryTable';
import type { ReportType } from '@/lib/types/reports';
import {
  getReportsDashboardStats,
  getReportTrends,
  getReportDistribution,
  getReportSummary,
} from '@/lib/api/reports';

export default function ReportsPage() {
  const t = useTranslations('reports');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [selectedReportType, setSelectedReportType] = useState<ReportType>('collection');
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    status: 'all',
    category: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: getReportsDashboardStats,
    staleTime: 60000, // 1 minute
  });

  // Fetch trend data
  const { data: trendsData, isLoading: trendsLoading } = useQuery({
    queryKey: ['reports', 'trends', period],
    queryFn: () => getReportTrends(period),
    staleTime: 60000,
  });

  // Fetch distribution data
  const { data: distributionData, isLoading: distributionLoading } = useQuery({
    queryKey: ['reports', 'distribution'],
    queryFn: getReportDistribution,
    staleTime: 300000, // 5 minutes
  });

  // Fetch summary data
  const {
    data: summaryData,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['reports', 'summary', currentPage, filters.category, filters.status],
    queryFn: () =>
      getReportSummary(currentPage, 8, filters.category, filters.status),
    staleTime: 30000, // 30 seconds
  });

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleGenerateReport = () => {
    console.log('Generating report for:', selectedReportType, 'with filters:', filters);
    refetchSummary();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportChart = () => {
    console.log('Exporting chart data...');
    // TODO: Implement chart export functionality
  };

  const handleExportTable = () => {
    console.log('Exporting table data...');
    // TODO: Implement table export functionality
  };

  const handleDownloadReport = () => {
    console.log('Downloading all reports...');
    // TODO: Implement download all functionality
  };

  const handleViewReport = (id: number) => {
    console.log('Viewing report:', id);
    // TODO: Implement view report functionality
  };

  const handleDownloadSingleReport = (id: number) => {
    console.log('Downloading report:', id);
    // TODO: Implement download single report functionality
  };

  const handleDeleteReport = (id: number) => {
    console.log('Deleting report:', id);
    // TODO: Implement delete report functionality
  };

  return (
    <AdminLayout>
      <div className="space-y-6 bg-[#F5F1E8] min-h-screen p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tn('dashboard'), href: '/dashboard' },
            { label: t('breadcrumb') }
          ]}
        />

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#8B1538]">
            {t('title')}
          </h1>
          <p className="text-[#6B7280]">
            {t('subtitle')}
          </p>
        </div>

        {/* Statistics Cards */}
        <section aria-label={locale === 'ar' ? 'إحصائيات التقارير' : 'Reports statistics'}>
          <ReportStatsCards stats={dashboardStats} isLoading={statsLoading} />
        </section>

        {/* Report Type Selector */}
        <section aria-label={locale === 'ar' ? 'اختيار نوع التقرير' : 'Report type selection'}>
          <ReportTypeSelector
            selectedType={selectedReportType}
            onSelectType={setSelectedReportType}
          />
        </section>

        {/* Filters Section */}
        <section aria-label={locale === 'ar' ? 'فلاتر التقارير' : 'Report filters'}>
          <ReportFilters
            onFiltersChange={handleFiltersChange}
            onGenerate={handleGenerateReport}
            isLoading={summaryLoading}
          />
        </section>

        {/* Charts Section */}
        <section aria-label={locale === 'ar' ? 'رسوم بيانية' : 'Charts'}>
          <ReportCharts
            trendData={trendsData?.data}
            distributionData={distributionData?.data}
            onExportChart={handleExportChart}
          />
        </section>

        {/* Summary Table */}
        <section aria-label={locale === 'ar' ? 'ملخص التقارير' : 'Report summary'}>
          <ReportSummaryTable
            items={summaryData?.items}
            totalItems={summaryData?.total}
            currentPage={currentPage}
            itemsPerPage={8}
            onPageChange={handlePageChange}
            onView={handleViewReport}
            onDownload={handleDownloadSingleReport}
            onDelete={handleDeleteReport}
            onExportTable={handleExportTable}
            onDownloadAll={handleDownloadReport}
            isLoading={summaryLoading}
          />
        </section>
      </div>
    </AdminLayout>
  );
}
