/**
 * User Management UI Type Definitions
 * Types specific to the User Management dashboard components
 */

// View mode for user display
export type ViewMode = 'grid' | 'table';

// Extended user interface for the dashboard
export interface DashboardUser {
  id: string;
  full_name: string;
  arabic_name?: string;
  email: string;
  role: 'admin' | 'administrator' | 'librarian' | 'cataloger' | 'circulation_staff' | 'teacher' | 'student' | 'patron';
  user_type: 'Staff' | 'Patron';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  is_online?: boolean;
  user_id: string; // Display ID like OM-2024-001
  books_borrowed: number;
  fines: number;
  last_login: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at?: string;
}

// Statistics for the stats bar
export interface UserStats {
  total: number;
  active: number;
  pending: number;
  inactive: number;
  totalChange?: string;
  activeChange?: string;
  pendingChange?: string;
  inactiveChange?: string;
}

// Filter state
export interface UserFilters {
  search: string;
  role: string;
  status: string;
}

// Pagination state
export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

// Modal form data
export interface UserFormData {
  full_name: string;
  arabic_name: string;
  email: string;
  password?: string;
  confirm_password?: string;
  role: string;
  status: string;
  user_id: string;
  phone?: string;
  address?: string;
}

// Role badge configuration
export interface RoleBadge {
  label: string;
  color: string;
  bgColor: string;
}

// Status badge configuration
export interface StatusBadge {
  label: string;
  color: string;
  dotColor: string;
}

// User action types
export type UserAction = 'view' | 'edit' | 'delete' | 'message' | 'toggle_status';

// Export request
export interface UserExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  filters?: UserFilters;
  userIds?: string[];
}
