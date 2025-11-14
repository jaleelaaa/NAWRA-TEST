/**
 * Barcode API Client
 * API calls for barcode generation, scanning, and management
 */

import { apiClient } from './client';
import type {
  BarcodeSettings,
  BarcodeSettingsUpdate,
  BarcodeHistory,
  BarcodeGenerate,
  BarcodeGenerateResponse,
  BarcodeLookup,
  BarcodeLookupResponse,
  BarcodeBatchGenerate,
  BarcodeBatchResponse,
  BarcodeStatistics,
} from '../types/barcode';

/**
 * Get current barcode settings
 */
export async function fetchBarcodeSettings() {
  const { data } = await apiClient.get<BarcodeSettings>('/barcode/settings');
  return data;
}

/**
 * Update barcode settings
 */
export async function updateBarcodeSettings(settings: BarcodeSettingsUpdate) {
  const { data } = await apiClient.patch<BarcodeSettings>('/barcode/settings', settings);
  return data;
}

/**
 * Generate barcode for a book
 */
export async function generateBarcode(request: BarcodeGenerate) {
  const { data } = await apiClient.post<BarcodeGenerateResponse>('/barcode/generate', request);
  return data;
}

/**
 * Lookup book by barcode (for scanning)
 */
export async function lookupBarcode(lookup: BarcodeLookup) {
  const { data } = await apiClient.post<BarcodeLookupResponse>('/barcode/lookup', lookup);
  return data;
}

/**
 * Generate barcodes for multiple books
 */
export async function batchGenerateBarcodes(request: BarcodeBatchGenerate) {
  const { data } = await apiClient.post<BarcodeBatchResponse>('/barcode/batch/generate', request);
  return data;
}

/**
 * Get barcode change history for a book
 */
export async function fetchBarcodeHistory(bookId: string) {
  const { data } = await apiClient.get<BarcodeHistory[]>(`/barcode/history/${bookId}`);
  return data;
}

/**
 * Get barcode statistics
 */
export async function fetchBarcodeStatistics() {
  const { data } = await apiClient.get<BarcodeStatistics>('/barcode/statistics');
  return data;
}
