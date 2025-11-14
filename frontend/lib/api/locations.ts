/**
 * Location Management API Client
 * Phase 3 - Enhanced Features (Day 12-13)
 */

import { apiClient } from './client';
import type {
  Location,
  LocationWithHierarchy,
  LocationCreate,
  LocationUpdate,
  LocationFilters,
  LocationListResponse,
  LocationTreeNode,
  LocationStatistics,
  LocationHistory,
  LocationHistoryCreate,
  LocationHistoryFilters,
  LocationHistoryListResponse,
  BulkLocationMove,
  BulkLocationMoveResponse,
} from '../types/locations';

// =====================================================
// Location Management
// =====================================================

/**
 * Create a new location
 */
export async function createLocation(location: LocationCreate) {
  const { data } = await apiClient.post<Location>('/locations', location);
  return data;
}

/**
 * Get location by ID
 */
export async function fetchLocationById(id: string) {
  const { data } = await apiClient.get<Location>(`/locations/${id}`);
  return data;
}

/**
 * Get location with full hierarchy (ancestors and children)
 */
export async function fetchLocationHierarchy(id: string) {
  const { data } = await apiClient.get<LocationWithHierarchy>(`/locations/${id}/hierarchy`);
  return data;
}

/**
 * List locations with filters and pagination
 */
export async function fetchLocations(filters: LocationFilters = {}) {
  const { data } = await apiClient.get<LocationListResponse>('/locations', {
    params: filters,
  });
  return data;
}

/**
 * Get location tree structure
 */
export async function fetchLocationTree(parentId?: string) {
  const { data } = await apiClient.get<LocationTreeNode[]>('/locations/tree', {
    params: parentId ? { parent_id: parentId } : {},
  });
  return data;
}

/**
 * Get location statistics
 */
export async function fetchLocationStatistics() {
  const { data } = await apiClient.get<LocationStatistics>('/locations/statistics');
  return data;
}

/**
 * Update location
 */
export async function updateLocation(id: string, location: LocationUpdate) {
  const { data } = await apiClient.patch<Location>(`/locations/${id}`, location);
  return data;
}

/**
 * Delete location (only if empty)
 */
export async function deleteLocation(id: string) {
  await apiClient.delete(`/locations/${id}`);
}

// =====================================================
// Location History
// =====================================================

/**
 * Create location history entry (manual)
 */
export async function createLocationHistory(history: LocationHistoryCreate) {
  const { data } = await apiClient.post<LocationHistory>('/locations/history', history);
  return data;
}

/**
 * Get location history entry by ID
 */
export async function fetchLocationHistoryById(id: string) {
  const { data } = await apiClient.get<LocationHistory>(`/locations/history/${id}`);
  return data;
}

/**
 * List location history with filters
 */
export async function fetchLocationHistory(filters: LocationHistoryFilters = {}) {
  const { data } = await apiClient.get<LocationHistoryListResponse>('/locations/history', {
    params: filters,
  });
  return data;
}

// =====================================================
// Bulk Operations
// =====================================================

/**
 * Move multiple books to a new location
 */
export async function bulkMoveBooks(move: BulkLocationMove) {
  const { data } = await apiClient.post<BulkLocationMoveResponse>('/locations/bulk-move', move);
  return data;
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get all locations as options for dropdowns (flat list)
 */
export async function fetchLocationOptions() {
  const { data } = await fetchLocations({
    is_active: true,
    page_size: 1000, // Get all for dropdown
    sort_by: 'full_path',
    sort_order: 'asc',
  });

  return data.data.map((location) => ({
    value: location.id,
    label: location.full_path || location.name,
    type: location.location_type,
    full_path: location.full_path,
  }));
}

/**
 * Get child locations for a parent
 */
export async function fetchChildLocations(parentId: string) {
  const { data } = await fetchLocations({
    parent_id: parentId,
    is_active: true,
    sort_by: 'code',
    sort_order: 'asc',
  });

  return data.data;
}

/**
 * Search locations by name or code
 */
export async function searchLocations(query: string) {
  const { data } = await fetchLocations({
    search: query,
    is_active: true,
    page_size: 50,
    sort_by: 'full_path',
    sort_order: 'asc',
  });

  return data.data;
}
