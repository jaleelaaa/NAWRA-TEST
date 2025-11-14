/**
 * Barcode React Query Hooks
 * Custom hooks for barcode operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBarcodeSettings,
  updateBarcodeSettings,
  generateBarcode,
  lookupBarcode,
  batchGenerateBarcodes,
  fetchBarcodeHistory,
  fetchBarcodeStatistics,
} from '@/lib/api/barcode';
import type {
  BarcodeSettingsUpdate,
  BarcodeGenerate,
  BarcodeLookup,
  BarcodeBatchGenerate,
} from '@/lib/types/barcode';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Hook to fetch barcode settings
 */
export function useBarcodeSettings() {
  return useQuery({
    queryKey: ['barcode', 'settings'],
    queryFn: fetchBarcodeSettings,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to update barcode settings
 */
export function useUpdateBarcodeSettings() {
  const queryClient = useQueryClient();
  const t = useTranslations('barcode.messages');

  return useMutation({
    mutationFn: (settings: BarcodeSettingsUpdate) => updateBarcodeSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode', 'settings'] });
      toast.success(t('settingsUpdated') || 'Barcode settings updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('settingsError') || 'Failed to update barcode settings';
      toast.error(message);
    },
  });
}

/**
 * Hook to generate barcode for a book
 */
export function useGenerateBarcode() {
  const queryClient = useQueryClient();
  const t = useTranslations('barcode.messages');

  return useMutation({
    mutationFn: (request: BarcodeGenerate) => generateBarcode(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barcode'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(t('generateSuccess') || 'Barcode generated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('generateError') || 'Failed to generate barcode';
      toast.error(message);
    },
  });
}

/**
 * Hook to lookup book by barcode (for scanning)
 */
export function useLookupBarcode() {
  const t = useTranslations('barcode.messages');

  return useMutation({
    mutationFn: (lookup: BarcodeLookup) => lookupBarcode(lookup),
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('lookupError') || 'Failed to lookup barcode';
      toast.error(message);
    },
  });
}

/**
 * Hook to batch generate barcodes
 */
export function useBatchGenerateBarcodes() {
  const queryClient = useQueryClient();
  const t = useTranslations('barcode.messages');

  return useMutation({
    mutationFn: (request: BarcodeBatchGenerate) => batchGenerateBarcodes(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['barcode'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success(
        t('batchSuccess', { count: data.successful }) ||
        `Generated ${data.successful} barcodes successfully`
      );
      if (data.failed > 0) {
        toast.warning(
          t('batchPartial', { failed: data.failed }) ||
          `${data.failed} barcodes failed to generate`
        );
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('batchError') || 'Failed to generate barcodes';
      toast.error(message);
    },
  });
}

/**
 * Hook to fetch barcode history for a book
 */
export function useBarcodeHistory(bookId: string) {
  return useQuery({
    queryKey: ['barcode', 'history', bookId],
    queryFn: () => fetchBarcodeHistory(bookId),
    enabled: !!bookId,
  });
}

/**
 * Hook to fetch barcode statistics
 */
export function useBarcodeStatistics() {
  return useQuery({
    queryKey: ['barcode', 'statistics'],
    queryFn: fetchBarcodeStatistics,
    staleTime: 60000, // 1 minute
  });
}
