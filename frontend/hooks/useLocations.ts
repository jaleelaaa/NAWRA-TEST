/**
 * Location Management React Query Hooks
 * Phase 3 - Enhanced Features (Day 12-13)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createLocation,
  fetchLocationById,
  fetchLocationHierarchy,
  fetchLocations,
  fetchLocationTree,
  fetchLocationStatistics,
  updateLocation,
  deleteLocation,
  createLocationHistory,
  fetchLocationHistoryById,
  fetchLocationHistory,
  bulkMoveBooks,
  fetchLocationOptions,
  fetchChildLocations,
  searchLocations,
} from '@/lib/api/locations';
import type {
  LocationCreate,
  LocationUpdate,
  LocationFilters,
  LocationHistoryCreate,
  LocationHistoryFilters,
  BulkLocationMove,
} from '@/lib/types/locations';

// =====================================================
// Location Queries
// =====================================================

/**
 * Hook to fetch a single location by ID
 */
export function useLocation(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', id],
    queryFn: () => fetchLocationById(id),
    enabled: enabled && !!id,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to fetch location with full hierarchy
 */
export function useLocationHierarchy(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', id, 'hierarchy'],
    queryFn: () => fetchLocationHierarchy(id),
    enabled: enabled && !!id,
    staleTime: 60000,
  });
}

/**
 * Hook to fetch list of locations with filters
 */
export function useLocations(filters: LocationFilters = {}) {
  return useQuery({
    queryKey: ['locations', 'list', filters],
    queryFn: () => fetchLocations(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to fetch location tree structure
 */
export function useLocationTree(parentId?: string) {
  return useQuery({
    queryKey: ['locations', 'tree', parentId],
    queryFn: () => fetchLocationTree(parentId),
    staleTime: 60000,
  });
}

/**
 * Hook to fetch location statistics
 */
export function useLocationStatistics() {
  return useQuery({
    queryKey: ['locations', 'statistics'],
    queryFn: fetchLocationStatistics,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch location options for dropdowns
 */
export function useLocationOptions() {
  return useQuery({
    queryKey: ['locations', 'options'],
    queryFn: fetchLocationOptions,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch child locations
 */
export function useChildLocations(parentId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', 'children', parentId],
    queryFn: () => fetchChildLocations(parentId),
    enabled: enabled && !!parentId,
    staleTime: 60000,
  });
}

/**
 * Hook to search locations
 */
export function useLocationSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['locations', 'search', query],
    queryFn: () => searchLocations(query),
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 30000,
  });
}

// =====================================================
// Location Mutations
// =====================================================

/**
 * Hook to create a new location
 */
export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (location: LocationCreate) => createLocation(location),
    onSuccess: () => {
      // Invalidate all location-related queries
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to create location';
      toast.error(message);
    },
  });
}

/**
 * Hook to update a location
 */
export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, location }: { id: string; location: LocationUpdate }) =>
      updateLocation(id, location),
    onSuccess: (_, { id }) => {
      // Invalidate specific location and list queries
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to update location';
      toast.error(message);
    },
  });
}

/**
 * Hook to delete a location
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to delete location';
      toast.error(message);
    },
  });
}

// =====================================================
// Location History Queries
// =====================================================

/**
 * Hook to fetch location history entry
 */
export function useLocationHistoryEntry(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['location-history', id],
    queryFn: () => fetchLocationHistoryById(id),
    enabled: enabled && !!id,
  });
}

/**
 * Hook to fetch location history list
 */
export function useLocationHistory(filters: LocationHistoryFilters = {}) {
  return useQuery({
    queryKey: ['location-history', 'list', filters],
    queryFn: () => fetchLocationHistory(filters),
    staleTime: 10000, // 10 seconds - history changes frequently
  });
}

// =====================================================
// Location History Mutations
// =====================================================

/**
 * Hook to create manual location history entry
 */
export function useCreateLocationHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (history: LocationHistoryCreate) => createLocationHistory(history),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['location-history'] });
      toast.success('Location history entry created');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to create history entry';
      toast.error(message);
    },
  });
}

// =====================================================
// Bulk Operations
// =====================================================

/**
 * Hook to bulk move books to a new location
 */
export function useBulkMoveBooks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (move: BulkLocationMove) => bulkMoveBooks(move),
    onSuccess: (result) => {
      // Invalidate locations, books, and history
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['location-history'] });

      if (result.failed_count > 0) {
        toast.warning(result.message);
      } else {
        toast.success(result.message);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || 'Failed to move books';
      toast.error(message);
    },
  });
}
