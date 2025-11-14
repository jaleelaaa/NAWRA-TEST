/**
 * TypeScript Types for Reports & Analytics Feature
 * NAWRA Library Management System
 */

export type ReportType = 'circulation' | 'user_activity' | 'collection' | 'financial' | 'overview';

export type ReportStatus = 'completed' | 'pending' | 'failed';

export interface ReportStats {
  totalReports: {
    count: number;
    change: number; // percentage
  };
  activePeriod: {
    startDate: Date;
    endDate: Date;
    daysActive: number;
  };
  exportOperations: {
    count: number;
    change: number;
    period: string;
  };
  categories: {
    count: number;
    activeTypes: string[];
  };
}

export interface ReportTypeOption {
  id: ReportType;
  title: string;
  description: string;
  gradient: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

export interface ReportFilters {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  status: 'all' | ReportStatus;
  category: 'all' | ReportType;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface DistributionDataPoint {
  category: string;
  count: number;
}

export interface ReportSummaryItem {
  id: number;
  reportName: string;
  category: ReportType;
  dateGenerated: Date;
  status: ReportStatus;
}

export interface ReportsData {
  stats: ReportStats;
  trendData: TrendDataPoint[];
  distributionData: DistributionDataPoint[];
  summaryItems: ReportSummaryItem[];
  totalItems: number;
}

export interface ExportRequest {
  reportType: ReportType;
  format: 'pdf' | 'excel' | 'csv';
  filters: ReportFilters;
  includeCharts: boolean;
  includeSummary: boolean;
}
