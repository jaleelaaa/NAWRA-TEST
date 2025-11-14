/**
 * Audit Log React Query Hooks
 * Custom hooks for audit log operations
 */

import { useQuery } from '@tanstack/react-query';
import {
  fetchAuditLogs,
  fetchAuditLogById,
  fetchAuditStatistics,
  fetchUserActivityReport,
} from '@/lib/api/audit';
import type { AuditLogFilters } from '@/lib/types/audit';

/**
 * Hook to fetch paginated audit logs with filters
 */
export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit', 'logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch a single audit log by ID
 */
export function useAuditLog(id: string) {
  return useQuery({
    queryKey: ['audit', 'log', id],
    queryFn: () => fetchAuditLogById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch audit log statistics
 */
export function useAuditStatistics(days: number = 7) {
  return useQuery({
    queryKey: ['audit', 'statistics', days],
    queryFn: () => fetchAuditStatistics(days),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch user activity report
 */
export function useUserActivityReport(userId: string, days: number = 30) {
  return useQuery({
    queryKey: ['audit', 'user', userId, days],
    queryFn: () => fetchUserActivityReport(userId, days),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
}
