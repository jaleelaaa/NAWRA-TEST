/**
 * API Type Definitions
 *
 * TypeScript interfaces for API requests and responses
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface SortParams {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  arabic_name?: string;
  role: string;
  user_type: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
  message: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

// ============================================================================
// User Management Types
// ============================================================================

export interface UserFilters extends PaginationParams, SortParams {
  search?: string;
  role?: string;
  user_type?: string;
  is_active?: boolean;
}

export interface CreateUserRequest {
  email: string;
  full_name: string;
  arabic_name?: string;
  password: string;
  role_id?: string;
  user_type: 'Staff' | 'Patron';
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  full_name?: string;
  arabic_name?: string;
  email?: string;
  role_id?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
}

export interface UserDetail extends User {
  phone?: string;
  address?: string;
  date_of_birth?: string;
  role_id?: string;
  updated_at?: string;
  last_login?: string;
}

// ============================================================================
// Book/Catalog Types
// ============================================================================

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  language: string;
  total_copies: number;
  available_copies: number;
  cover_image?: string;
  description?: string;
  created_at: string;
}

export interface BookFilters extends PaginationParams, SortParams {
  search?: string;
  category?: string;
  language?: string;
  author?: string;
  availability?: 'available' | 'unavailable' | 'all';
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  language: string;
  total_copies: number;
  description?: string;
  cover_image?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  category?: string;
  language?: string;
  total_copies?: number;
  description?: string;
  cover_image?: string;
}

export interface BookDetail extends Book {
  updated_at: string;
  borrowed_count: number;
  reserved_count: number;
}

export interface BookCategory {
  id: string;
  name: string;
  name_ar: string;
  count: number;
}

// ============================================================================
// Circulation Types
// ============================================================================

export interface Loan {
  id: string;
  book_id: string;
  book_title: string;
  user_id: string;
  user_name: string;
  borrowed_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'returned' | 'overdue';
  fine_amount?: number;
}

export interface Reservation {
  id: string;
  book_id: string;
  book_title: string;
  user_id: string;
  user_name: string;
  reserved_date: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  expiry_date: string;
}

export interface Fine {
  id: string;
  loan_id: string;
  user_id: string;
  user_name: string;
  amount: number;
  status: 'pending' | 'paid' | 'waived';
  created_at: string;
  paid_at?: string;
}

export interface CirculationFilters extends PaginationParams, SortParams {
  status?: string;
  user_id?: string;
  book_id?: string;
  from_date?: string;
  to_date?: string;
}

export interface CheckoutRequest {
  book_id: string;
  user_id: string;
  due_days?: number;
}

export interface CheckinRequest {
  loan_id: string;
}

export interface RenewRequest {
  loan_id: string;
  extend_days?: number;
}

export interface ReservationRequest {
  book_id: string;
  user_id: string;
}

// ============================================================================
// Reports & Analytics Types
// ============================================================================

export interface DashboardStats {
  total_users: number;
  total_books: number;
  books_borrowed: number;
  overdue_books: number;
  total_fines: number;
  active_reservations: number;
  user_growth?: number;
  book_growth?: number;
  circulation_growth?: number;
}

export interface RecentActivity {
  id: string;
  type: 'borrow' | 'return' | 'reserve' | 'register';
  user_name: string;
  book_title?: string;
  timestamp: string;
  description: string;
}

export interface AnalyticsData {
  date: string;
  loans: number;
  returns: number;
  reservations: number;
  new_users: number;
}

export interface ReportFilters {
  from_date?: string;
  to_date?: string;
  report_type?: string;
  format?: 'pdf' | 'excel' | 'csv';
}

export interface ExportRequest {
  report_type: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, any>;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface GeneralSettings {
  library_name: string;
  library_name_ar: string;
  email: string;
  phone: string;
  address: string;
  working_hours: string;
  max_loans_per_user: number;
  loan_period_days: number;
}

export interface CirculationSettings {
  loan_period_days: number;
  renewal_period_days: number;
  max_renewals: number;
  overdue_fine_per_day: number;
  reservation_hold_days: number;
  max_reservations_per_user: number;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  due_date_reminder_days: number;
  overdue_reminder_interval_days: number;
  reservation_ready_notification: boolean;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  user_id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationFilters extends PaginationParams {
  is_read?: boolean;
  type?: string;
}

export interface MarkReadRequest {
  notification_ids: string[];
}
