/**
 * Audit Log API Client
 * API calls for audit logging and activity tracking
 */

import { apiClient } from './client';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogListResponse,
  AuditStatistics,
  UserActivityReport,
} from '../types/audit';

/**
 * Fetch paginated list of audit logs with optional filters
 */
export async function fetchAuditLogs(filters: AuditLogFilters) {
  const { data } = await apiClient.get<AuditLogListResponse>('/audit', {
    params: {
      ...filters,
      status: filters.status ? filters.status : undefined,
    },
  });
  return data;
}

/**
 * Fetch a single audit log by ID
 */
export async function fetchAuditLogById(id: string) {
  const { data } = await apiClient.get<AuditLog>(`/audit/${id}`);
  return data;
}

/**
 * Fetch audit log statistics
 */
export async function fetchAuditStatistics(days: number = 7) {
  const { data } = await apiClient.get<AuditStatistics>('/audit/statistics/summary', {
    params: { days },
  });
  return data;
}

/**
 * Fetch user activity report
 */
export async function fetchUserActivityReport(userId: string, days: number = 30) {
  const { data } = await apiClient.get<UserActivityReport>(`/audit/user/${userId}/report`, {
    params: { days },
  });
  return data;
}
