/**
 * Circulation API Service
 *
 * Circulation management API endpoints (aligned with backend implementation)
 * Backend endpoints: /api/v1/circulation
 */

import apiClient from './client';

// ============================================================================
// Type Definitions (matching backend models)
// ============================================================================

export interface CirculationRecord {
  id: string;
  user_id: string;
  book_id: string;
  user_name: string;
  user_role: string;
  book_title: string;
  category?: string;
  shelf_location?: string;
  issue_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned' | 'reserved';
  days_left: number;
  book_condition?: string;
  fine_amount?: number;
  fine_paid?: boolean;
  notes?: string;
}

export interface CirculationStats {
  active_issues: number;
  overdue_books: number;
  returned_today: number;
  reserved_books: number;
  total_fines: number;
  total_fines_paid: number;
  average_borrow_duration: number;
  most_borrowed_books: Array<{
    book_id: string;
    title: string;
    count: number;
  }>;
  most_active_users: Array<{
    user_id: string;
    name: string;
    count: number;
  }>;
}

export interface CirculationFilters {
  page?: number;
  page_size?: number;
  search?: string;
  status?: 'active' | 'overdue' | 'returned' | 'reserved';
  user_type?: string;
  due_date_filter?: 'today' | 'tomorrow' | 'week' | 'overdue';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface IssueBookRequest {
  user_id: string;
  book_id: string;
  issue_date?: string;
  due_date: string;
  send_email?: boolean;
  print_receipt?: boolean;
  notes?: string;
}

export interface ReturnBookRequest {
  return_date?: string;
  book_condition?: 'good' | 'fair' | 'damaged';
  notes?: string;
}

export interface UpdateCirculationRequest {
  due_date?: string;
  notes?: string;
  fine_amount?: number;
  fine_paid?: boolean;
}

export interface PaginatedCirculationResponse {
  items: CirculationRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// Circulation Operations (matching backend /circulation endpoints)
// ============================================================================

/**
 * Get all circulation records with filters and pagination
 * Backend: GET /circulation
 */
export const getCirculationRecords = async (
  filters?: CirculationFilters
): Promise<PaginatedCirculationResponse> => {
  const response = await apiClient.get<PaginatedCirculationResponse>('/circulation', {
    params: filters,
  });
  return response.data;
};

/**
 * Get circulation record by ID
 * Backend: GET /circulation/{record_id}
 */
export const getCirculationRecord = async (recordId: string): Promise<CirculationRecord> => {
  const response = await apiClient.get<CirculationRecord>(`/circulation/${recordId}`);
  return response.data;
};

/**
 * Issue a book (create circulation record)
 * Backend: POST /circulation
 */
export const issueBook = async (data: IssueBookRequest): Promise<CirculationRecord> => {
  const response = await apiClient.post<CirculationRecord>('/circulation', data);
  return response.data;
};

/**
 * Return a book
 * Backend: POST /circulation/{record_id}/return
 */
export const returnBook = async (
  recordId: string,
  data: ReturnBookRequest
): Promise<CirculationRecord> => {
  const response = await apiClient.post<CirculationRecord>(
    `/circulation/${recordId}/return`,
    data
  );
  return response.data;
};

/**
 * Update circulation record
 * Backend: PATCH /circulation/{record_id}
 */
export const updateCirculationRecord = async (
  recordId: string,
  data: UpdateCirculationRequest
): Promise<CirculationRecord> => {
  const response = await apiClient.patch<CirculationRecord>(
    `/circulation/${recordId}`,
    data
  );
  return response.data;
};

/**
 * Delete circulation record
 * Backend: DELETE /circulation/{record_id}
 */
export const deleteCirculationRecord = async (recordId: string): Promise<void> => {
  await apiClient.delete(`/circulation/${recordId}`);
};

/**
 * Get circulation statistics
 * Backend: GET /circulation/stats
 */
export const getCirculationStats = async (): Promise<CirculationStats> => {
  const response = await apiClient.get<CirculationStats>('/circulation/stats');
  return response.data;
};

/**
 * Export circulation records to CSV
 * Backend: GET /circulation/export
 */
export const exportCirculationRecords = async (
  filters?: Omit<CirculationFilters, 'page' | 'page_size'>
): Promise<Blob> => {
  const response = await apiClient.get('/circulation/export', {
    params: filters,
    responseType: 'blob',
  });
  return response.data;
};

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get active loans (circulation records with status=active)
 */
export const getActiveLoans = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedCirculationResponse> => {
  return getCirculationRecords({
    page,
    page_size: pageSize,
    status: 'active',
  });
};

/**
 * Get overdue books
 */
export const getOverdueBooks = async (
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedCirculationResponse> => {
  return getCirculationRecords({
    page,
    page_size: pageSize,
    status: 'overdue',
  });
};

/**
 * Get circulation records for a specific user
 */
export const getUserCirculationRecords = async (
  userId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedCirculationResponse> => {
  return getCirculationRecords({
    page,
    page_size: pageSize,
    search: userId, // Backend will search by user_id in the search field
  });
};

/**
 * Quick checkout - issue book with default settings
 */
export const quickCheckout = async (
  userId: string,
  bookId: string,
  daysToLoan: number = 15
): Promise<CirculationRecord> => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + daysToLoan);

  return issueBook({
    user_id: userId,
    book_id: bookId,
    due_date: dueDate.toISOString(),
  });
};

/**
 * Quick return - return book in good condition
 */
export const quickReturn = async (recordId: string): Promise<CirculationRecord> => {
  return returnBook(recordId, {
    book_condition: 'good',
  });
};

// Export all for convenience
export default {
  getCirculationRecords,
  getCirculationRecord,
  issueBook,
  returnBook,
  updateCirculationRecord,
  deleteCirculationRecord,
  getCirculationStats,
  exportCirculationRecords,
  getActiveLoans,
  getOverdueBooks,
  getUserCirculationRecords,
  quickCheckout,
  quickReturn,
};
