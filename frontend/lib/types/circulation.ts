/**
 * Circulation Type Definitions
 *
 * TypeScript interfaces matching backend Pydantic models for circulation management
 */

// ============================================================================
// Enums
// ============================================================================

export enum CirculationStatus {
  ACTIVE = 'active',
  OVERDUE = 'overdue',
  RETURNED = 'returned',
  RESERVED = 'reserved',
}

export enum BookCondition {
  GOOD = 'good',
  FAIR = 'fair',
  DAMAGED = 'damaged',
}

export enum DueDateFilter {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  WEEK = 'week',
  OVERDUE = 'overdue',
}

export enum CirculationSortField {
  ISSUE_DATE = 'issue_date',
  DUE_DATE = 'due_date',
  RETURN_DATE = 'return_date',
  USER_NAME = 'user_name',
  BOOK_TITLE = 'book_title',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// ============================================================================
// Base Interfaces
// ============================================================================

export interface CirculationBase {
  user_id: string
  book_id: string
  issue_date: string // ISO date string
  due_date: string // ISO date string
  notes?: string | null
}

// ============================================================================
// Request Schemas (for creating/updating circulation records)
// ============================================================================

export interface CirculationCreate extends CirculationBase {
  send_email?: boolean
  print_receipt?: boolean
}

export interface CirculationReturn {
  return_date: string // ISO date string
  book_condition: BookCondition
  notes?: string | null
}

export interface CirculationUpdate {
  due_date?: string // ISO date string
  status?: CirculationStatus
  return_date?: string | null
  book_condition?: BookCondition
  fine_amount?: number
  fine_paid?: boolean
  notes?: string | null
}

export interface CirculationRenew {
  extend_days?: number
  notes?: string | null
}

// ============================================================================
// Response Schemas (what we get from API)
// ============================================================================

export interface CirculationRecord {
  id: string
  user_id: string
  user_name: string
  user_role: string
  book_id: string
  book_title: string
  book_title_ar?: string | null
  book_isbn?: string | null
  book_author?: string | null
  category?: string | null
  shelf_location?: string | null
  issue_date: string // ISO date string
  due_date: string // ISO date string
  return_date?: string | null // ISO date string
  status: CirculationStatus
  book_condition?: BookCondition | null
  fine_amount?: number | null
  fine_paid?: boolean
  renewal_count: number
  days_left: number // Calculated field from backend
  notes?: string | null
  issued_by?: string | null
  returned_by?: string | null
  created_at: string // ISO datetime string
  updated_at: string // ISO datetime string
}

export interface CirculationDetailResponse extends CirculationRecord {
  user_email?: string | null
  user_phone?: string | null
  user_arabic_name?: string | null
  book_publisher?: string | null
  book_year?: number | null
  can_renew: boolean
}

// ============================================================================
// Pagination & List Responses
// ============================================================================

export interface CirculationFilters {
  search?: string
  status?: CirculationStatus
  user_type?: string
  user_id?: string
  book_id?: string
  due_date_filter?: DueDateFilter
  date_from?: string // ISO date string
  date_to?: string // ISO date string
  page?: number
  page_size?: number
  sort_by?: CirculationSortField
  sort_order?: SortOrder
}

export interface PaginationMeta {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface CirculationListResponse {
  items: CirculationRecord[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// ============================================================================
// Statistics & Analytics
// ============================================================================

export interface MostBorrowedBook {
  book_id: string
  book_title: string
  book_title_ar?: string | null
  borrow_count: number
  author?: string | null
  category?: string | null
}

export interface MostActiveUser {
  user_id: string
  user_name: string
  user_arabic_name?: string | null
  borrow_count: number
  role?: string | null
}

export interface CirculationStatistics {
  active_issues: number
  overdue_books: number
  returned_today: number
  reserved_books: number
  total_fines: number
  total_fines_paid: number
  total_fines_unpaid?: number
  average_borrow_duration: number // in days
  most_borrowed_books: MostBorrowedBook[]
  most_active_users: MostActiveUser[]
}

// ============================================================================
// Legacy Types (for backward compatibility with existing code)
// ============================================================================

/** @deprecated Use CirculationRecord instead */
export interface Loan {
  id: string
  book_id: string
  book_title: string
  user_id: string
  user_name: string
  borrowed_date: string
  due_date: string
  return_date?: string
  status: 'active' | 'returned' | 'overdue'
  fine_amount?: number
}

/** @deprecated Use CirculationRecord with status='reserved' instead */
export interface Reservation {
  id: string
  book_id: string
  book_title: string
  user_id: string
  user_name: string
  reserved_date: string
  status: 'pending' | 'fulfilled' | 'cancelled'
  expiry_date: string
}

export interface Fine {
  id: string
  circulation_id: string
  user_id: string
  user_name: string
  user_arabic_name?: string | null
  amount: number
  status: 'pending' | 'paid' | 'waived'
  created_at: string
  paid_at?: string | null
  book_title?: string
}

// ============================================================================
// Bulk Operations
// ============================================================================

export interface BulkReturnRequest {
  circulation_ids: string[]
  return_date: string
  book_condition: BookCondition
  notes?: string
}

export interface BulkRenewRequest {
  circulation_ids: string[]
  extend_days: number
  notes?: string
}

export interface BulkOperationResponse {
  success_count: number
  failure_count: number
  errors?: Array<{
    circulation_id: string
    error: string
  }>
}

// ============================================================================
// Export Types
// ============================================================================

export interface CirculationExportParams extends CirculationFilters {
  format?: 'csv' | 'excel' | 'pdf'
  include_fields?: string[]
  locale?: 'en' | 'ar'
}

// ============================================================================
// Quick Issue Types (for rapid checkout)
// ============================================================================

export interface QuickIssueRequest {
  user_identifier: string // email, user_id, or barcode
  book_identifier: string // ISBN, book_id, or barcode
  due_days?: number // defaults to 14
  notes?: string
}

export interface QuickIssueResponse {
  success: boolean
  circulation: CirculationRecord
  message: string
}

// ============================================================================
// Email Notification Types
// ============================================================================

export interface EmailNotificationSettings {
  send_on_issue: boolean
  send_on_return: boolean
  send_overdue_reminder: boolean
  send_due_soon_reminder: boolean
  days_before_due_reminder: number // e.g., 3 days before
}

// ============================================================================
// Helper Types
// ============================================================================

export interface CirculationSummary {
  total_borrowed: number
  total_returned: number
  currently_active: number
  currently_overdue: number
  total_fines_collected: number
}

export interface UserCirculationHistory {
  user_id: string
  user_name: string
  user_arabic_name?: string | null
  total_borrowed: number
  total_overdue: number
  total_fines: number
  active_loans: number
  recent_circulation: CirculationRecord[]
}

export interface BookCirculationHistory {
  book_id: string
  book_title: string
  book_title_ar?: string | null
  total_times_borrowed: number
  currently_on_loan: boolean
  average_loan_duration: number
  recent_circulation: CirculationRecord[]
}

// ============================================================================
// Form Types (for UI components)
// ============================================================================

export interface IssueBookFormData {
  user_id: string
  book_id: string
  due_date: Date
  notes?: string
}

export interface ReturnBookFormData {
  return_date: Date
  book_condition: BookCondition
  notes?: string
}

export interface RenewBookFormData {
  extend_days: number
  notes?: string
}

// ============================================================================
// Validation Types
// ============================================================================

export interface CirculationValidation {
  can_issue: boolean
  reason?: string
  max_books_reached?: boolean
  user_has_overdue?: boolean
  user_has_unpaid_fines?: boolean
  book_not_available?: boolean
}

// ============================================================================
// Type Guards
// ============================================================================

export function isCirculationRecord(obj: any): obj is CirculationRecord {
  return (
    obj &&
    typeof obj === 'object' &&
    'id' in obj &&
    'user_id' in obj &&
    'book_id' in obj &&
    'status' in obj
  )
}

export function isOverdue(record: CirculationRecord): boolean {
  return record.status === CirculationStatus.OVERDUE || record.days_left < 0
}

export function hasUnpaidFine(record: CirculationRecord): boolean {
  return (
    record.fine_amount != null &&
    record.fine_amount > 0 &&
    record.fine_paid === false
  )
}

// ============================================================================
// Utility Functions
// ============================================================================

export function calculateDaysLeft(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function calculateFine(daysOverdue: number, finePerDay: number = 0.5, maxFine: number = 50): number {
  if (daysOverdue <= 0) return 0
  return Math.min(daysOverdue * finePerDay, maxFine)
}

export function getStatusColor(status: CirculationStatus): string {
  switch (status) {
    case CirculationStatus.ACTIVE:
      return 'green'
    case CirculationStatus.OVERDUE:
      return 'red'
    case CirculationStatus.RETURNED:
      return 'gray'
    case CirculationStatus.RESERVED:
      return 'blue'
    default:
      return 'gray'
  }
}

export function getStatusLabel(status: CirculationStatus, locale: 'en' | 'ar' = 'en'): string {
  const labels = {
    en: {
      [CirculationStatus.ACTIVE]: 'Active',
      [CirculationStatus.OVERDUE]: 'Overdue',
      [CirculationStatus.RETURNED]: 'Returned',
      [CirculationStatus.RESERVED]: 'Reserved',
    },
    ar: {
      [CirculationStatus.ACTIVE]: 'نشط',
      [CirculationStatus.OVERDUE]: 'متأخر',
      [CirculationStatus.RETURNED]: 'مُرجع',
      [CirculationStatus.RESERVED]: 'محجوز',
    },
  }
  return labels[locale][status] || status
}
