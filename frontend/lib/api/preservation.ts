/**
 * Preservation API Client
 * API calls for preservation records management
 */

import { apiClient } from './client';
import type {
  PreservationRecord,
  PreservationCreate,
  PreservationUpdate,
  PreservationFilters,
  PreservationResponse,
  PreservationStatistics,
} from '../types/preservation';

/**
 * Fetch paginated list of preservation records with optional filters
 */
export async function fetchPreservationRecords(params: PreservationFilters) {
  const { data } = await apiClient.get<PreservationResponse>('/preservation', { params });
  return data;
}

/**
 * Fetch a single preservation record by ID
 */
export async function fetchPreservationById(id: string) {
  const { data } = await apiClient.get<PreservationRecord>(`/preservation/${id}`);
  return data;
}

/**
 * Fetch all preservation records for a specific book/artifact
 */
export async function fetchPreservationByBook(bookId: string) {
  const { data } = await apiClient.get<PreservationRecord[]>(`/preservation/book/${bookId}`);
  return data;
}

/**
 * Create a new preservation record
 */
export async function createPreservationRecord(record: PreservationCreate) {
  const { data } = await apiClient.post<PreservationRecord>('/preservation', record);
  return data;
}

/**
 * Update an existing preservation record
 */
export async function updatePreservationRecord(id: string, record: PreservationUpdate) {
  const { data } = await apiClient.patch<PreservationRecord>(`/preservation/${id}`, record);
  return data;
}

/**
 * Delete a preservation record
 */
export async function deletePreservationRecord(id: string) {
  await apiClient.delete(`/preservation/${id}`);
}

/**
 * Fetch preservation statistics for dashboard
 */
export async function fetchPreservationStatistics() {
  const { data } = await apiClient.get<PreservationStatistics>('/preservation/statistics/summary');
  return data;
}
