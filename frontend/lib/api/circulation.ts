/**
 * Circulation API Client
 *
 * API client for circulation management endpoints
 */

import { apiClient } from './client'
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
} from '../types/circulation'

// ============================================================================
// Main Circulation Endpoints
// ============================================================================

/**
 * Get paginated circulation records with optional filters
 */
export async function getCirculationRecords(
  filters: CirculationFilters = {}
): Promise<CirculationListResponse> {
  const { data } = await apiClient.get<CirculationListResponse>('/circulation', {
    params: filters,
  })
  return data
}

/**
 * Get single circulation record by ID
 */
export async function getCirculationById(
  id: string
): Promise<CirculationDetailResponse> {
  const { data } = await apiClient.get<CirculationDetailResponse>(`/circulation/${id}`)
  return data
}

/**
 * Issue a book to a user (create circulation record)
 */
export async function issueBook(
  issueData: CirculationCreate
): Promise<CirculationRecord> {
  const { data} = await apiClient.post<CirculationRecord>('/circulation', issueData)
  return data
}

/**
 * Quick issue using user/book identifiers (barcode, email, ISBN)
 */
export async function quickIssue(
  quickData: QuickIssueRequest
): Promise<QuickIssueResponse> {
  const { data } = await apiClient.post<QuickIssueResponse>(
    '/circulation/quick-issue',
    quickData
  )
  return data
}

/**
 * Return a book (complete circulation record)
 */
export async function returnBook(
  id: string,
  returnData: CirculationReturn
): Promise<CirculationRecord> {
  const { data } = await apiClient.post<CirculationRecord>(
    `/circulation/${id}/return`,
    returnData
  )
  return data
}

/**
 * Renew a book loan (extend due date)
 */
export async function renewBook(
  id: string,
  renewData: CirculationRenew
): Promise<CirculationRecord> {
  const { data } = await apiClient.post<CirculationRecord>(
    `/circulation/${id}/renew`,
    renewData
  )
  return data
}

/**
 * Update circulation record
 */
export async function updateCirculation(
  id: string,
  updateData: CirculationUpdate
): Promise<CirculationRecord> {
  const { data } = await apiClient.patch<CirculationRecord>(
    `/circulation/${id}`,
    updateData
  )
  return data
}

/**
 * Delete circulation record
 */
export async function deleteCirculation(id: string): Promise<void> {
  await apiClient.delete(`/circulation/${id}`)
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

/**
 * Get circulation statistics
 */
export async function getCirculationStats(): Promise<CirculationStatistics> {
  const { data } = await apiClient.get<CirculationStatistics>('/circulation/stats')
  return data
}

// ============================================================================
// Filtered Queries
// ============================================================================

/**
 * Get all overdue circulation records
 */
export async function getOverdueRecords(): Promise<CirculationRecord[]> {
  const { data } = await apiClient.get<CirculationListResponse>('/circulation', {
    params: {
      status: 'overdue',
      page_size: 1000,
    },
  })
  return data.items
}

/**
 * Get circulation records for a specific user
 */
export async function getUserCirculation(userId: string): Promise<CirculationRecord[]> {
  const { data } = await apiClient.get<CirculationListResponse>('/circulation', {
    params: {
      user_id: userId,
      page_size: 1000,
    },
  })
  return data.items
}

/**
 * Get circulation history for a specific book
 */
export async function getBookCirculation(bookId: string): Promise<CirculationRecord[]> {
  const { data } = await apiClient.get<CirculationListResponse>('/circulation', {
    params: {
      book_id: bookId,
      page_size: 1000,
    },
  })
  return data.items
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk return books
 */
export async function bulkReturnBooks(
  bulkData: BulkReturnRequest
): Promise<BulkOperationResponse> {
  const { data } = await apiClient.post<BulkOperationResponse>(
    '/circulation/bulk-return',
    bulkData
  )
  return data
}

/**
 * Bulk renew books
 */
export async function bulkRenewBooks(
  bulkData: BulkRenewRequest
): Promise<BulkOperationResponse> {
  const { data } = await apiClient.post<BulkOperationResponse>(
    '/circulation/bulk-renew',
    bulkData
  )
  return data
}

// ============================================================================
// Export
// ============================================================================

/**
 * Export circulation records to CSV/Excel/PDF
 */
export async function exportCirculation(
  params: CirculationExportParams
): Promise<Blob> {
  const { format = 'csv', ...filterParams } = params

  const { data } = await apiClient.get('/circulation/export', {
    params: {
      ...filterParams,
      format,
    },
    responseType: 'blob',
  })

  return data
}

// ============================================================================
// Fines (integrated with circulation records)
// ============================================================================

/**
 * Get fines (integrated with circulation records)
 */
export async function getFines(): Promise<CirculationRecord[]> {
  const { data } = await apiClient.get<CirculationListResponse>('/circulation', {
    params: {
      page_size: 1000,
    },
  })
  // Filter records with unpaid fines
  return data.items.filter(
    (record) => record.fine_amount && record.fine_amount > 0 && !record.fine_paid
  )
}

/**
 * Get user's fines
 */
export async function getUserFines(userId: string): Promise<CirculationRecord[]> {
  const records = await getUserCirculation(userId)
  return records.filter(
    (record) => record.fine_amount && record.fine_amount > 0 && !record.fine_paid
  )
}

/**
 * Pay fine (update circulation record)
 */
export async function payFine(circulationId: string): Promise<CirculationRecord> {
  return updateCirculation(circulationId, {
    fine_paid: true,
  })
}

/**
 * Waive fine (update circulation record)
 */
export async function waiveFine(circulationId: string): Promise<CirculationRecord> {
  return updateCirculation(circulationId, {
    fine_amount: 0,
    fine_paid: true,
  })
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  // Main operations
  getCirculationRecords,
  getCirculationById,
  issueBook,
  quickIssue,
  returnBook,
  renewBook,
  updateCirculation,
  deleteCirculation,

  // Statistics
  getCirculationStats,

  // Filtered queries
  getOverdueRecords,
  getUserCirculation,
  getBookCirculation,

  // Bulk operations
  bulkReturnBooks,
  bulkRenewBooks,

  // Export
  exportCirculation,

  // Fines
  getFines,
  getUserFines,
  payFine,
  waiveFine,
}
