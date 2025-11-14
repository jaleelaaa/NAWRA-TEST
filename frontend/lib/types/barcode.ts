/**
 * Barcode System Types
 * Type definitions for barcode generation, scanning, and management
 */

export enum BarcodeFormat {
  CODE128 = 'CODE128',
  CODE39 = 'CODE39',
  EAN13 = 'EAN13',
  EAN8 = 'EAN8',
  UPCA = 'UPCA',
  UPCE = 'UPCE',
  QR = 'QR',
}

export interface BarcodeSettings {
  id: string;
  prefix: string;
  format: BarcodeFormat;
  include_checksum: boolean;
  auto_generate: boolean;
  next_sequence: number;
  sequence_length: number;
  show_text: boolean;
  barcode_height: number;
  barcode_width: number;
  created_at: string;
  updated_at: string;
}

export interface BarcodeSettingsUpdate {
  prefix?: string;
  format?: BarcodeFormat;
  include_checksum?: boolean;
  auto_generate?: boolean;
  sequence_length?: number;
  show_text?: boolean;
  barcode_height?: number;
  barcode_width?: number;
}

export interface BarcodeHistory {
  id: string;
  book_id: string;
  old_barcode: string | null;
  new_barcode: string;
  change_reason: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface BarcodeGenerate {
  book_id: string;
  custom_barcode?: string;
  reason?: string;
}

export interface BarcodeGenerateResponse {
  book_id: string;
  barcode: string;
  barcode_image: string;
  format: BarcodeFormat;
  message: string;
}

export interface BarcodeLookup {
  barcode: string;
}

export interface BarcodeLookupResponse {
  found: boolean;
  barcode: string;
  book: any | null;
  message: string;
}

export interface BarcodeBatchGenerate {
  book_ids: string[];
  reason?: string;
}

export interface BarcodeBatchResponse {
  total_requested: number;
  successful: number;
  failed: number;
  barcodes: Array<{
    book_id: string;
    barcode?: string;
    status: string;
    error?: string;
  }>;
  message: string;
}

export interface BarcodeStatistics {
  total_books: number;
  books_with_barcode: number;
  books_without_barcode: number;
  barcode_coverage_percentage: number;
  next_available_barcode: string;
  barcode_format: BarcodeFormat;
}

// Helper functions
export const getBarcodeFormatLabel = (format: BarcodeFormat): string => {
  const labels: Record<BarcodeFormat, string> = {
    [BarcodeFormat.CODE128]: 'Code 128',
    [BarcodeFormat.CODE39]: 'Code 39',
    [BarcodeFormat.EAN13]: 'EAN-13',
    [BarcodeFormat.EAN8]: 'EAN-8',
    [BarcodeFormat.UPCA]: 'UPC-A',
    [BarcodeFormat.UPCE]: 'UPC-E',
    [BarcodeFormat.QR]: 'QR Code',
  };
  return labels[format] || format;
};

export const getBarcodeCoverageColor = (percentage: number): string => {
  if (percentage >= 90) return 'text-green-600 bg-green-50';
  if (percentage >= 70) return 'text-blue-600 bg-blue-50';
  if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};
