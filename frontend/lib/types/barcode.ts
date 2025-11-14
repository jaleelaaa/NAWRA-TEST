import { Book } from './books';

export interface BarcodeScanResult {
  decodedText: string;
  format: string;
}

export interface BarcodeLookupResponse {
  book: Book;
  found: boolean;
}

export interface BarcodeGenerateRequest {
  bookId: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
}

export interface BarcodeGenerateResponse {
  barcode: string;
  imageUrl: string;
  format: string;
}

export interface BarcodeScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
  disableFlip?: boolean;
  formatsToSupport?: string[];
}
