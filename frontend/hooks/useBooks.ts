/**
 * React Query hooks for Books and Categories
 *
 * Custom hooks for managing books and categories state with React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  // Category operations
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  // Book operations
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
} from '@/lib/api/books';
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
  BookListResponse,
  BookFilters,
  BookStatistics,
  // Bulk operations
  BulkBookUpdate,
  BulkBookDelete,
  BulkOperationResponse,
  // Availability
  BookAvailabilityResponse,
} from '@/lib/types/books';

// ============================================================================
// Query Keys
// ============================================================================

export const booksKeys = {
  all: ['books'] as const,
  lists: () => [...booksKeys.all, 'list'] as const,
  list: (filters: BookFilters) => [...booksKeys.lists(), filters] as const,
  details: () => [...booksKeys.all, 'detail'] as const,
  detail: (id: string) => [...booksKeys.details(), id] as const,
  statistics: () => [...booksKeys.all, 'statistics'] as const,
  availability: (id: string) => [...booksKeys.all, 'availability', id] as const,
};

export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: (includeCounts?: boolean) => [...categoriesKeys.lists(), { includeCounts }] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
};

// ============================================================================
// Category Hooks
// ============================================================================

/**
 * Get all categories
 */
export function useCategories(includeCounts: boolean = false) {
  return useQuery({
    queryKey: categoriesKeys.list(includeCounts),
    queryFn: () => getCategories(includeCounts),
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

/**
 * Get category by ID
 */
export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: categoriesKeys.detail(categoryId),
    queryFn: () => getCategoryById(categoryId),
    enabled: !!categoryId,
  });
}

/**
 * Create category mutation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: CategoryCreate) => createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      toast.success('Category created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create category');
    },
  });
}

/**
 * Update category mutation
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: CategoryUpdate }) =>
      updateCategory(id, category),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      queryClient.invalidateQueries({ queryKey: categoriesKeys.detail(id) });
      toast.success('Category updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update category');
    },
  });
}

/**
 * Delete category mutation
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.all });
      queryClient.invalidateQueries({ queryKey: booksKeys.all }); // Books may reference categories
      toast.success('Category deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete category');
    },
  });
}

// ============================================================================
// Book Query Hooks
// ============================================================================

/**
 * Get books with filters and pagination
 */
export function useBooks(filters?: BookFilters) {
  return useQuery({
    queryKey: booksKeys.list(filters || {}),
    queryFn: () => getBooks(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Get book by ID
 */
export function useBook(bookId: string) {
  return useQuery({
    queryKey: booksKeys.detail(bookId),
    queryFn: () => getBookById(bookId),
    enabled: !!bookId,
  });
}

/**
 * Search books
 */
export function useSearchBooks(query: string, page: number = 1, pageSize: number = 12) {
  return useQuery({
    queryKey: booksKeys.list({ search: query, page, page_size: pageSize }),
    queryFn: () => searchBooks(query, page, pageSize),
    enabled: !!query,
    staleTime: 30 * 1000,
  });
}

/**
 * Get available books only
 */
export function useAvailableBooks(filters?: Omit<BookFilters, 'available_only'>) {
  return useQuery({
    queryKey: booksKeys.list({ ...filters, available_only: true }),
    queryFn: () => getAvailableBooks(filters),
    staleTime: 30 * 1000,
  });
}

/**
 * Get books by category
 */
export function useBooksByCategory(categoryId: string, filters?: Omit<BookFilters, 'category_id'>) {
  return useQuery({
    queryKey: booksKeys.list({ ...filters, category_id: categoryId }),
    queryFn: () => getBooksByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 30 * 1000,
  });
}

/**
 * Get book statistics
 */
export function useBookStatistics() {
  return useQuery({
    queryKey: booksKeys.statistics(),
    queryFn: getBookStatistics,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Check book availability
 */
export function useBookAvailability(bookId: string, requiredQuantity: number = 1) {
  return useQuery({
    queryKey: booksKeys.availability(bookId),
    queryFn: () => checkBookAvailability(bookId, requiredQuantity),
    enabled: !!bookId,
    staleTime: 10 * 1000, // 10 seconds - availability changes frequently
  });
}

// ============================================================================
// Book Mutation Hooks
// ============================================================================

/**
 * Create book mutation
 */
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (book: BookCreate) => createBook(book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      toast.success('Book created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to create book');
    },
  });
}

/**
 * Update book mutation
 */
export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, book }: { id: string; book: BookUpdate }) =>
      updateBook(id, book),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      queryClient.invalidateQueries({ queryKey: booksKeys.detail(id) });
      toast.success('Book updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update book');
    },
  });
}

/**
 * Delete book mutation
 */
export function useDeleteBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      toast.success('Book deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete book');
    },
  });
}

/**
 * Update book quantity mutation
 */
export function useUpdateBookQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      quantityChange,
      updateAvailable,
    }: {
      bookId: string;
      quantityChange: number;
      updateAvailable?: boolean;
    }) => updateBookQuantity(bookId, quantityChange, updateAvailable),
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      queryClient.invalidateQueries({ queryKey: booksKeys.detail(bookId) });
      queryClient.invalidateQueries({ queryKey: booksKeys.availability(bookId) });
      toast.success('Book quantity updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update book quantity');
    },
  });
}

// ============================================================================
// Bulk Operation Hooks
// ============================================================================

/**
 * Bulk update books mutation
 */
export function useBulkUpdateBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkUpdate: BulkBookUpdate) => bulkUpdateBooks(bulkUpdate),
    onSuccess: (result: BulkOperationResponse) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      toast.success(`${result.affected_count} books updated successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update books');
    },
  });
}

/**
 * Bulk delete books mutation
 */
export function useBulkDeleteBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkDelete: BulkBookDelete) => bulkDeleteBooks(bulkDelete),
    onSuccess: (result: BulkOperationResponse) => {
      queryClient.invalidateQueries({ queryKey: booksKeys.all });
      toast.success(`${result.affected_count} books deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete books');
    },
  });
}

// ============================================================================
// Prefetch Utilities
// ============================================================================

/**
 * Prefetch book details (for hover/link previews)
 */
export function usePrefetchBook() {
  const queryClient = useQueryClient();

  return (bookId: string) => {
    queryClient.prefetchQuery({
      queryKey: booksKeys.detail(bookId),
      queryFn: () => getBookById(bookId),
    });
  };
}

/**
 * Prefetch categories (for dropdown/forms)
 */
export function usePrefetchCategories() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: categoriesKeys.list(false),
      queryFn: () => getCategories(false),
    });
  };
}
