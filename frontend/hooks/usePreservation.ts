/**
 * Preservation React Query Hooks
 * Custom hooks for preservation records management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPreservationRecords,
  fetchPreservationById,
  fetchPreservationByBook,
  createPreservationRecord,
  updatePreservationRecord,
  deletePreservationRecord,
  fetchPreservationStatistics,
} from '@/lib/api/preservation';
import type {
  PreservationFilters,
  PreservationCreate,
  PreservationUpdate,
} from '@/lib/types/preservation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Hook to fetch paginated preservation records with filters
 */
export function usePreservationRecords(filters: PreservationFilters) {
  return useQuery({
    queryKey: ['preservation', filters],
    queryFn: () => fetchPreservationRecords(filters),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch a single preservation record by ID
 */
export function usePreservationRecord(id: string) {
  return useQuery({
    queryKey: ['preservation', id],
    queryFn: () => fetchPreservationById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all preservation records for a specific book
 */
export function usePreservationByBook(bookId: string) {
  return useQuery({
    queryKey: ['preservation', 'book', bookId],
    queryFn: () => fetchPreservationByBook(bookId),
    enabled: !!bookId,
  });
}

/**
 * Hook to fetch preservation statistics
 */
export function usePreservationStatistics() {
  return useQuery({
    queryKey: ['preservation', 'statistics'],
    queryFn: fetchPreservationStatistics,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to create a new preservation record
 */
export function useCreatePreservation() {
  const queryClient = useQueryClient();
  const t = useTranslations('preservation.messages');

  return useMutation({
    mutationFn: (record: PreservationCreate) => createPreservationRecord(record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preservation'] });
      toast.success(t('createSuccess') || 'Preservation record created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('createError') || 'Failed to create preservation record';
      toast.error(message);
    },
  });
}

/**
 * Hook to update an existing preservation record
 */
export function useUpdatePreservation() {
  const queryClient = useQueryClient();
  const t = useTranslations('preservation.messages');

  return useMutation({
    mutationFn: ({ id, record }: { id: string; record: PreservationUpdate }) =>
      updatePreservationRecord(id, record),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['preservation'] });
      queryClient.invalidateQueries({ queryKey: ['preservation', id] });
      toast.success(t('updateSuccess') || 'Preservation record updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('updateError') || 'Failed to update preservation record';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a preservation record
 */
export function useDeletePreservation() {
  const queryClient = useQueryClient();
  const t = useTranslations('preservation.messages');

  return useMutation({
    mutationFn: (id: string) => deletePreservationRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preservation'] });
      toast.success(t('deleteSuccess') || 'Preservation record deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('deleteError') || 'Failed to delete preservation record';
      toast.error(message);
    },
  });
}
