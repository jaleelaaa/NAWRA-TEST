/**
 * Reports & Analytics API Service
 *
 * Reports and analytics API endpoints
 */

import apiClient from './client';
import {
  DashboardStats,
  RecentActivity,
  AnalyticsData,
  ReportFilters,
  ExportRequest,
} from './types';

/**
 * Get reports dashboard statistics (new)
 */
export const getReportsDashboardStats = async (): Promise<{
  total_reports: { count: number; change: number };
  active_period: { start_date: string; end_date: string; days_active: number };
  export_operations: { count: number; change: number; period: string };
  categories: { count: number; active_types: string[] };
}> => {
  const response = await apiClient.get('/reports/dashboard');
  return response.data;
};

/**
 * Get dashboard statistics (legacy)
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

/**
 * Get recent activity feed
 */
export const getRecentActivity = async (limit: number = 10): Promise<RecentActivity[]> => {
  const response = await apiClient.get<RecentActivity[]>('/reports/activity', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get analytics data for date range
 */
export const getAnalyticsData = async (
  fromDate: string,
  toDate: string
): Promise<AnalyticsData[]> => {
  const response = await apiClient.get<AnalyticsData[]>('/reports/analytics', {
    params: { from_date: fromDate, to_date: toDate },
  });
  return response.data;
};

/**
 * Get circulation report
 */
export const getCirculationReport = async (filters?: ReportFilters): Promise<{
  total_checkouts: number;
  total_returns: number;
  total_renewals: number;
  overdue_count: number;
  popular_books: Array<{ book_id: string; title: string; borrow_count: number }>;
}> => {
  const response = await apiClient.get('/reports/circulation', {
    params: filters,
  });
  return response.data;
};

/**
 * Get user activity report
 */
export const getUserActivityReport = async (filters?: ReportFilters): Promise<{
  total_registrations: number;
  active_users: number;
  top_borrowers: Array<{ user_id: string; name: string; borrow_count: number }>;
}> => {
  const response = await apiClient.get('/reports/users', {
    params: filters,
  });
  return response.data;
};

/**
 * Get collection report
 */
export const getCollectionReport = async (filters?: ReportFilters): Promise<{
  total_books: number;
  total_copies: number;
  books_by_category: Array<{ category: string; count: number }>;
  books_by_language: Array<{ language: string; count: number }>;
}> => {
  const response = await apiClient.get('/reports/collection', {
    params: filters,
  });
  return response.data;
};

/**
 * Get financial report (fines)
 */
export const getFinancialReport = async (filters?: ReportFilters): Promise<{
  total_fines_collected: number;
  pending_fines: number;
  waived_fines: number;
  fines_by_month: Array<{ month: string; amount: number }>;
}> => {
  const response = await apiClient.get('/reports/financial', {
    params: filters,
  });
  return response.data;
};

/**
 * Export report
 */
export const exportReport = async (exportRequest: ExportRequest): Promise<Blob> => {
  const response = await apiClient.post('/reports/export', exportRequest, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Get popular books
 */
export const getPopularBooks = async (
  limit: number = 10
): Promise<Array<{ book_id: string; title: string; borrow_count: number }>> => {
  const response = await apiClient.get('/reports/popular-books', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get top borrowers
 */
export const getTopBorrowers = async (
  limit: number = 10
): Promise<Array<{ user_id: string; name: string; borrow_count: number }>> => {
  const response = await apiClient.get('/reports/top-borrowers', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get overdue books report
 */
export const getOverdueReport = async (): Promise<{
  total_overdue: number;
  total_overdue_fines: number;
  overdue_by_duration: Array<{ duration_days: string; count: number }>;
  books: Array<{
    loan_id: string;
    book_title: string;
    user_name: string;
    due_date: string;
    days_overdue: number;
    fine_amount: number;
  }>;
}> => {
  const response = await apiClient.get('/reports/overdue');
  return response.data;
};

/**
 * Get report trends over time
 */
export const getReportTrends = async (period: 'week' | 'month' | 'year' = 'week'): Promise<{
  data: Array<{ date: string; date_full: string; value: number }>;
  period: string;
}> => {
  const response = await apiClient.get('/reports/trends', {
    params: { period },
  });
  return response.data;
};

/**
 * Get report distribution by category
 */
export const getReportDistribution = async (): Promise<{
  data: Array<{ category: string; count: number }>;
  total: number;
}> => {
  const response = await apiClient.get('/reports/distribution');
  return response.data;
};

/**
 * Get report summary with history
 */
export const getReportSummary = async (
  page: number = 1,
  pageSize: number = 8,
  category?: string,
  status?: string
): Promise<{
  items: Array<{
    id: number;
    report_name: string;
    category: string;
    date_generated: string;
    status: string;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}> => {
  const response = await apiClient.get('/reports/summary', {
    params: {
      page,
      page_size: pageSize,
      category: category !== 'all' ? category : undefined,
      status: status !== 'all' ? status : undefined,
    },
  });
  return response.data;
};
