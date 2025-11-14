/**
 * Books and Categories API Service
 *
 * Book catalog management API endpoints
 */

import { apiClient } from './client';
import type {
  // Category types
  CategoryCreate,
  CategoryUpdate,
  CategoryResponse,
  CategoryListResponse,
  // Book types
  BookCreate,
  BookUpdate,
  BookResponse,
  BookListItem,
  BookListResponse,
  BookFilters,
  BookStatistics,
  // Bulk operations
  BulkBookUpdate,
  BulkBookDelete,
  BulkOperationResponse,
  // Availability
  BookAvailabilityResponse,
} from '../types/books';

// ============================================================================
// Category Operations
// ============================================================================

/**
 * Get all categories
 */
export const getCategories = async (includeCounts: boolean = false): Promise<CategoryListResponse> => {
  const response = await apiClient.get<CategoryListResponse>('/categories', {
    params: { include_counts: includeCounts },
  });
  return response.data;
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<CategoryResponse> => {
  const response = await apiClient.get<CategoryResponse>(`/categories/${categoryId}`);
  return response.data;
};

/**
 * Create new category
 */
export const createCategory = async (category: CategoryCreate): Promise<CategoryResponse> => {
  const response = await apiClient.post<CategoryResponse>('/categories', category);
  return response.data;
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  category: CategoryUpdate
): Promise<CategoryResponse> => {
  const response = await apiClient.put<CategoryResponse>(`/categories/${categoryId}`, category);
  return response.data;
};

/**
 * Delete category
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  await apiClient.delete(`/categories/${categoryId}`);
};

// ============================================================================
// Book Operations
// ============================================================================

/**
 * Get books with filters and pagination
 */
export const getBooks = async (filters?: BookFilters): Promise<BookListResponse> => {
  const response = await apiClient.get<BookListResponse>('/books', {
    params: filters,
  });
  return response.data;
};

/**
 * Get book by ID
 */
export const getBookById = async (bookId: string): Promise<BookResponse> => {
  const response = await apiClient.get<BookResponse>(`/books/${bookId}`);
  return response.data;
};

/**
 * Create new book
 */
export const createBook = async (book: BookCreate): Promise<BookResponse> => {
  const response = await apiClient.post<BookResponse>('/books', book);
  return response.data;
};

/**
 * Update book
 */
export const updateBook = async (
  bookId: string,
  book: BookUpdate
): Promise<BookResponse> => {
  const response = await apiClient.put<BookResponse>(`/books/${bookId}`, book);
  return response.data;
};

/**
 * Delete book
 */
export const deleteBook = async (bookId: string): Promise<void> => {
  await apiClient.delete(`/books/${bookId}`);
};

// ============================================================================
// Inventory Management
// ============================================================================

/**
 * Update book quantity
 */
export const updateBookQuantity = async (
  bookId: string,
  quantityChange: number,
  updateAvailable: boolean = true
): Promise<BookResponse> => {
  const response = await apiClient.patch<BookResponse>(`/books/${bookId}/quantity`, null, {
    params: {
      quantity_change: quantityChange,
      update_available: updateAvailable,
    },
  });
  return response.data;
};

/**
 * Check book availability
 */
export const checkBookAvailability = async (
  bookId: string,
  requiredQuantity: number = 1
): Promise<BookAvailabilityResponse> => {
  const response = await apiClient.get<BookAvailabilityResponse>(`/books/${bookId}/availability`, {
    params: { required_quantity: requiredQuantity },
  });
  return response.data;
};

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Bulk update books
 */
export const bulkUpdateBooks = async (bulkUpdate: BulkBookUpdate): Promise<BulkOperationResponse> => {
  const response = await apiClient.post<BulkOperationResponse>('/books/bulk-update', bulkUpdate);
  return response.data;
};

/**
 * Bulk delete books
 */
export const bulkDeleteBooks = async (bulkDelete: BulkBookDelete): Promise<BulkOperationResponse> => {
  const response = await apiClient.post<BulkOperationResponse>('/books/bulk-delete', bulkDelete);
  return response.data;
};

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get book statistics
 */
export const getBookStatistics = async (): Promise<BookStatistics> => {
  const response = await apiClient.get<BookStatistics>('/books/statistics');
  return response.data;
};

// ============================================================================
// Search Helpers
// ============================================================================

/**
 * Search books (convenience function that uses getBooks)
 */
export const searchBooks = async (query: string, page: number = 1, pageSize: number = 12): Promise<BookListResponse> => {
  return getBooks({
    search: query,
    page,
    page_size: pageSize,
  });
};

/**
 * Get available books only
 */
export const getAvailableBooks = async (filters?: Omit<BookFilters, 'available_only'>): Promise<BookListResponse> => {
  return getBooks({
    ...filters,
    available_only: true,
  });
};

/**
 * Get books by category
 */
export const getBooksByCategory = async (
  categoryId: string,
  filters?: Omit<BookFilters, 'category_id'>
): Promise<BookListResponse> => {
  return getBooks({
    ...filters,
    category_id: categoryId,
  });
};

/**
 * Get books by language
 */
export const getBooksByLanguage = async (
  language: string,
  filters?: Omit<BookFilters, 'language'>
): Promise<BookListResponse> => {
  return getBooks({
    ...filters,
    language,
  });
};

/**
 * Get recent books (added in last 30 days)
 */
export const getRecentBooks = async (pageSize: number = 12): Promise<BookListResponse> => {
  return getBooks({
    sort_by: 'created_at' as any,
    sort_order: 'desc' as any,
    page: 1,
    page_size: pageSize,
  });
};

// ============================================================================
// Export all for convenience
// ============================================================================

export default {
  // Categories
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  // Books
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,

  // Inventory
  updateBookQuantity,
  checkBookAvailability,

  // Bulk operations
  bulkUpdateBooks,
  bulkDeleteBooks,

  // Statistics
  getBookStatistics,

  // Search helpers
  searchBooks,
  getAvailableBooks,
  getBooksByCategory,
  getBooksByLanguage,
  getRecentBooks,
};
