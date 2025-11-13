'use client';

import React, { useState } from 'react';
import { Eye, Download, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface ReportSummaryItem {
  id: number;
  report_name: string;
  category: string;
  date_generated: string;
  status: string;
}

interface ReportSummaryTableProps {
  items?: ReportSummaryItem[];
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onView?: (id: number) => void;
  onDownload?: (id: number) => void;
  onDelete?: (id: number) => void;
  onExportTable?: () => void;
  onDownloadAll?: () => void;
  isLoading?: boolean;
}

const defaultReportData = [
  {
    id: 1,
    report_name: 'Monthly Circulation',
    category: 'circulation',
    date_generated: '2025-03-15T10:30:00Z',
    status: 'completed',
  },
  {
    id: 2,
    report_name: 'User Engagement Q1',
    category: 'user_activity',
    date_generated: '2025-03-10T14:20:00Z',
    status: 'completed',
  },
  {
    id: 3,
    report_name: 'Collection Audit',
    category: 'collection',
    date_generated: '2025-03-20T09:15:00Z',
    status: 'pending',
  },
  {
    id: 4,
    report_name: 'Financial Summary',
    category: 'financial',
    date_generated: '2025-03-05T16:45:00Z',
    status: 'completed',
  },
  {
    id: 5,
    report_name: 'System Overview',
    category: 'overview',
    date_generated: '2025-03-18T11:00:00Z',
    status: 'completed',
  },
  {
    id: 6,
    report_name: 'Branch Performance',
    category: 'circulation',
    date_generated: '2025-03-12T13:30:00Z',
    status: 'pending',
  },
  {
    id: 7,
    report_name: 'User Demographics',
    category: 'user_activity',
    date_generated: '2025-03-08T10:00:00Z',
    status: 'completed',
  },
  {
    id: 8,
    report_name: 'Collection Gap Analysis',
    category: 'collection',
    date_generated: '2025-03-01T15:20:00Z',
    status: 'completed',
  },
];

export default function ReportSummaryTable({
  items = defaultReportData,
  totalItems,
  currentPage: propCurrentPage = 1,
  itemsPerPage = 8,
  onPageChange,
  onView,
  onDownload,
  onDelete,
  onExportTable,
  onDownloadAll,
  isLoading = false,
}: ReportSummaryTableProps) {
  const t = useTranslations('reports.table');
  const tr = useTranslations('reports.reportNames');
  const tc = useTranslations('reports.categories');
  const ts = useTranslations('reports.statuses');
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(propCurrentPage);

  const total = totalItems || items.length;
  const totalPages = Math.ceil(total / itemsPerPage);

  const getTranslatedReportName = (reportName: string) => {
    const nameMap: Record<string, string> = {
      'Monthly Circulation': 'monthlyCirculation',
      'User Engagement Q1': 'userEngagementQ1',
      'Collection Audit': 'collectionAudit',
      'Financial Summary': 'financialSummary',
      'System Overview': 'systemOverview',
      'Branch Performance': 'branchPerformance',
      'User Demographics': 'userDemographics',
      'Collection Gap Analysis': 'collectionGapAnalysis',
    };

    const translationKey = nameMap[reportName];
    return translationKey ? tr(translationKey) : reportName;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryDisplay = (category: string) => {
    const categoryMap: Record<string, string> = {
      circulation: 'circulation',
      user_activity: 'userActivity',
      collection: 'collection',
      financial: 'financial',
      overview: 'overview',
    };
    const translationKey = categoryMap[category];
    return translationKey ? tc(translationKey) : category;
  };

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      completed: 'completed',
      pending: 'pending',
      active: 'active',
    };
    const translationKey = statusMap[status];
    return translationKey ? ts(translationKey) : status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Table Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#8B1538] flex items-center gap-2 rtl:flex-row-reverse">
          <FileText className="w-5 h-5" />
          {t('title')}
        </h3>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onExportTable}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#8B1538] border border-gray-300 rounded-lg hover:border-[#8B1538] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('exportTable')}
          </button>
          <button
            onClick={onDownloadAll}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#8B1538] to-[#A61D45] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {t('downloadReport')}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('id')}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('name')}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('category')}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('date')}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('status')}
              </th>
              <th className="px-4 py-3 text-left rtl:text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                </tr>
              ))
            ) : (
              items.map((report) => (
                <tr key={report.id} className="hover:bg-blue-50 transition-colors group">
                  <td className="px-4 py-4 text-sm text-gray-900 font-medium">#{report.id}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">{getTranslatedReportName(report.report_name)}</td>
                  <td className="px-4 py-4 text-sm">
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {getCategoryDisplay(report.category)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{formatDate(report.date_generated)}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {getStatusDisplay(report.status)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity rtl:flex-row-reverse">
                      <button
                        onClick={() => onView?.(report.id)}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => onDownload?.(report.id)}
                        className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={() => onDelete?.(report.id)}
                        className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {t('showingResults', {
            start: (currentPage - 1) * itemsPerPage + 1,
            end: Math.min(currentPage * itemsPerPage, total),
            total: total
          })}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === i + 1
                  ? 'bg-[#8B1538] text-white'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
