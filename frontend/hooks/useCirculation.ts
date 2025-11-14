/**
 * React Query hooks for Circulation Management
 *
 * Custom hooks for managing circulation records, returns, renewals, and statistics
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import type {
  CirculationRecord,
  CirculationCreate,
  CirculationReturn,
  CirculationUpdate,
  CirculationRenew,
  CirculationFilters,
  CirculationListResponse,
  CirculationStatistics,
  CirculationDetailResponse,
  BulkReturnRequest,
  BulkRenewRequest,
  BulkOperationResponse,
  QuickIssueRequest,
  QuickIssueResponse,
  CirculationExportParams,
} from '@/lib/types/circulation'
import {
  getCirculationRecords,
  getCirculationById,
  issueBook,
  returnBook,
  renewBook,
  updateCirculation,
  deleteCirculation,
  getCirculationStats,
  getOverdueRecords,
  getUserCirculation,
  getBookCirculation,
  bulkReturnBooks,
  bulkRenewBooks,
  quickIssue,
  exportCirculation,
} from '@/lib/api/circulation'

// ============================================================================
// Query Keys Factory
// ============================================================================

export const circulationKeys = {
  all: ['circulation'] as const,
  lists: () => [...circulationKeys.all, 'list'] as const,
  list: (filters: CirculationFilters) => [...circulationKeys.lists(), filters] as const,
  details: () => [...circulationKeys.all, 'detail'] as const,
  detail: (id: string) => [...circulationKeys.details(), id] as const,
  stats: () => [...circulationKeys.all, 'stats'] as const,
  overdue: () => [...circulationKeys.all, 'overdue'] as const,
  user: (userId: string) => [...circulationKeys.all, 'user', userId] as const,
  book: (bookId: string) => [...circulationKeys.all, 'book', bookId] as const,
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch paginated circulation records with filters
 */
export function useCirculationRecords(
  filters: CirculationFilters = {},
  options?: Omit<UseQueryOptions<CirculationListResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.list(filters),
    queryFn: () => getCirculationRecords(filters),
    staleTime: 10000, // 10 seconds - circulation changes frequently
    ...options,
  })
}

/**
 * Fetch single circulation record by ID
 */
export function useCirculationRecord(
  id: string,
  options?: Omit<UseQueryOptions<CirculationDetailResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.detail(id),
    queryFn: () => getCirculationById(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Fetch circulation statistics
 */
export function useCirculationStats(
  options?: Omit<UseQueryOptions<CirculationStatistics>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.stats(),
    queryFn: getCirculationStats,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
    ...options,
  })
}

/**
 * Fetch overdue circulation records
 */
export function useOverdueRecords(
  options?: Omit<UseQueryOptions<CirculationRecord[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.overdue(),
    queryFn: getOverdueRecords,
    staleTime: 30000, // 30 seconds
    ...options,
  })
}

/**
 * Fetch circulation records for a specific user
 */
export function useUserCirculation(
  userId: string,
  options?: Omit<UseQueryOptions<CirculationRecord[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.user(userId),
    queryFn: () => getUserCirculation(userId),
    enabled: !!userId,
    staleTime: 10000, // 10 seconds
    ...options,
  })
}

/**
 * Fetch circulation history for a specific book
 */
export function useBookCirculation(
  bookId: string,
  options?: Omit<UseQueryOptions<CirculationRecord[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: circulationKeys.book(bookId),
    queryFn: () => getBookCirculation(bookId),
    enabled: !!bookId,
    staleTime: 30000, // 30 seconds
    ...options,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Issue a book to a user (create new circulation record)
 */
export function useIssueBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CirculationCreate) => issueBook(data),
    onSuccess: (data) => {
      // Invalidate all circulation queries
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      // Invalidate books queries (availability changed)
      queryClient.invalidateQueries({ queryKey: ['books'] })
      // Invalidate dashboard stats
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      toast.success('Book issued successfully', {
        description: `Due date: ${new Date(data.due_date).toLocaleDateString()}`,
      })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to issue book'
      toast.error('Issue Failed', {
        description: message,
      })
    },
  })
}

/**
 * Quick issue using identifiers (barcode, email, etc.)
 */
export function useQuickIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: QuickIssueRequest) => quickIssue(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      queryClient.invalidateQueries({ queryKey: ['books'] })

      if (data.success) {
        toast.success('Quick Issue Success', {
          description: data.message,
        })
      } else {
        toast.error('Quick Issue Failed', {
          description: data.message,
        })
      }
    },
    onError: (error: any) => {
      toast.error('Quick Issue Failed', {
        description: error?.response?.data?.detail || 'Failed to issue book',
      })
    },
  })
}

/**
 * Return a book (complete circulation record)
 */
export function useReturnBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CirculationReturn }) =>
      returnBook(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      queryClient.invalidateQueries({ queryKey: ['books'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })

      // Show fine information if applicable
      if (data.fine_amount && data.fine_amount > 0) {
        toast.success('Book Returned', {
          description: `Fine: ${data.fine_amount.toFixed(2)} OMR ${
            data.fine_paid ? '(Paid)' : '(Unpaid)'
          }`,
          duration: 5000,
        })
      } else {
        toast.success('Book returned successfully')
      }
    },
    onError: (error: any) => {
      toast.error('Return Failed', {
        description: error?.response?.data?.detail || 'Failed to return book',
      })
    },
  })
}

/**
 * Renew a book loan
 */
export function useRenewBook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CirculationRenew }) =>
      renewBook(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })

      toast.success('Book Renewed', {
        description: `New due date: ${new Date(data.due_date).toLocaleDateString()}`,
      })
    },
    onError: (error: any) => {
      toast.error('Renewal Failed', {
        description: error?.response?.data?.detail || 'Failed to renew book',
      })
    },
  })
}

/**
 * Update circulation record
 */
export function useUpdateCirculation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CirculationUpdate }) =>
      updateCirculation(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      queryClient.invalidateQueries({ queryKey: circulationKeys.detail(variables.id) })

      toast.success('Record updated successfully')
    },
    onError: (error: any) => {
      toast.error('Update Failed', {
        description: error?.response?.data?.detail || 'Failed to update record',
      })
    },
  })
}

/**
 * Delete circulation record
 */
export function useDeleteCirculation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCirculation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      queryClient.invalidateQueries({ queryKey: ['books'] })

      toast.success('Record deleted successfully')
    },
    onError: (error: any) => {
      toast.error('Delete Failed', {
        description: error?.response?.data?.detail || 'Failed to delete record',
      })
    },
  })
}

/**
 * Bulk return books
 */
export function useBulkReturnBooks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkReturnRequest) => bulkReturnBooks(data),
    onSuccess: (data: BulkOperationResponse) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })
      queryClient.invalidateQueries({ queryKey: ['books'] })

      if (data.failure_count === 0) {
        toast.success('Bulk Return Success', {
          description: `${data.success_count} books returned successfully`,
        })
      } else {
        toast.warning('Bulk Return Partial', {
          description: `${data.success_count} succeeded, ${data.failure_count} failed`,
          duration: 5000,
        })
      }
    },
    onError: (error: any) => {
      toast.error('Bulk Return Failed', {
        description: error?.response?.data?.detail || 'Failed to return books',
      })
    },
  })
}

/**
 * Bulk renew books
 */
export function useBulkRenewBooks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkRenewRequest) => bulkRenewBooks(data),
    onSuccess: (data: BulkOperationResponse) => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.all })

      if (data.failure_count === 0) {
        toast.success('Bulk Renew Success', {
          description: `${data.success_count} books renewed successfully`,
        })
      } else {
        toast.warning('Bulk Renew Partial', {
          description: `${data.success_count} succeeded, ${data.failure_count} failed`,
          duration: 5000,
        })
      }
    },
    onError: (error: any) => {
      toast.error('Bulk Renew Failed', {
        description: error?.response?.data?.detail || 'Failed to renew books',
      })
    },
  })
}

/**
 * Export circulation data
 */
export function useExportCirculation() {
  return useMutation({
    mutationFn: (params: CirculationExportParams) => exportCirculation(params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      const format = variables.format || 'csv'
      const filename = `circulation_export_${new Date().toISOString().split('T')[0]}.${format}`
      a.download = filename

      document.body.appendChild(a)
      a.click()

      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Export Completed', {
        description: `Downloaded ${filename}`,
      })
    },
    onError: (error: any) => {
      toast.error('Export Failed', {
        description: error?.response?.data?.detail || 'Failed to export data',
      })
    },
  })
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Prefetch circulation records
 */
export function usePrefetchCirculation() {
  const queryClient = useQueryClient()

  return (filters: CirculationFilters = {}) => {
    queryClient.prefetchQuery({
      queryKey: circulationKeys.list(filters),
      queryFn: () => getCirculationRecords(filters),
      staleTime: 10000,
    })
  }
}

/**
 * Prefetch circulation statistics
 */
export function usePrefetchCirculationStats() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.prefetchQuery({
      queryKey: circulationKeys.stats(),
      queryFn: getCirculationStats,
      staleTime: 30000,
    })
  }
}

// ============================================================================
// Optimistic Updates Utilities
// ============================================================================

/**
 * Helper to update circulation record optimistically
 */
export function useOptimisticUpdateCirculation() {
  const queryClient = useQueryClient()

  return (id: string, updater: (old: CirculationRecord) => CirculationRecord) => {
    queryClient.setQueryData<CirculationDetailResponse>(
      circulationKeys.detail(id),
      (old) => (old ? updater(old) : old)
    )
  }
}

// ============================================================================
// Export all hooks
// ============================================================================

export default {
  // Queries
  useCirculationRecords,
  useCirculationRecord,
  useCirculationStats,
  useOverdueRecords,
  useUserCirculation,
  useBookCirculation,

  // Mutations
  useIssueBook,
  useQuickIssue,
  useReturnBook,
  useRenewBook,
  useUpdateCirculation,
  useDeleteCirculation,
  useBulkReturnBooks,
  useBulkRenewBooks,
  useExportCirculation,

  // Utilities
  usePrefetchCirculation,
  usePrefetchCirculationStats,
  useOptimisticUpdateCirculation,

  // Query keys
  circulationKeys,
}
