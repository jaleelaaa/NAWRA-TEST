/**
 * Users API Service
 *
 * User management API endpoints
 */

import apiClient from './client';
import {
  UserDetail,
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from './types';

/**
 * Get all users with filters and pagination
 */
export const getUsers = async (filters?: UserFilters): Promise<PaginatedResponse<UserDetail>> => {
  const response = await apiClient.get<PaginatedResponse<UserDetail>>('/users', {
    params: filters,
  });
  return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<UserDetail> => {
  const response = await apiClient.get<UserDetail>(`/users/${userId}`);
  return response.data;
};

/**
 * Create new user
 */
export const createUser = async (userData: CreateUserRequest): Promise<UserDetail> => {
  const response = await apiClient.post<UserDetail>('/users', userData);
  return response.data;
};

/**
 * Update user
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserRequest
): Promise<UserDetail> => {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await apiClient.delete(`/users/${userId}`);
  return response.data;
};

/**
 * Toggle user active status
 */
export const toggleUserStatus = async (
  userId: string,
  isActive: boolean
): Promise<UserDetail> => {
  const response = await apiClient.patch<UserDetail>(`/users/${userId}/status`, {
    is_active: isActive,
  });
  return response.data;
};

/**
 * Search users
 */
export const searchUsers = async (query: string): Promise<UserDetail[]> => {
  const response = await apiClient.get<UserDetail[]>('/users/search', {
    params: { q: query },
  });
  return response.data;
};

/**
 * Get user roles
 */
export const getUserRoles = async (): Promise<Array<{ id: string; name: string }>> => {
  const response = await apiClient.get('/users/roles');
  return response.data;
};

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<{
  total_users: number;
  active_users: number;
  inactive_users: number;
  staff_count: number;
  patron_count: number;
}> => {
  const response = await apiClient.get('/users/stats');
  return response.data;
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (userIds: string[]): Promise<{ message: string }> => {
  const response = await apiClient.post('/users/bulk-delete', { user_ids: userIds });
  return response.data;
};

/**
 * Export users to CSV/Excel
 */
export const exportUsers = async (
  filters?: UserFilters,
  format: 'csv' | 'excel' = 'csv'
): Promise<Blob> => {
  const response = await apiClient.get('/users/export', {
    params: { ...filters, format },
    responseType: 'blob',
  });
  return response.data;
};
