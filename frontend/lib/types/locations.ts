/**
 * Location Management Types
 * Phase 3 - Enhanced Features (Day 12-13)
 */

// =====================================================
// Enums
// =====================================================

export enum LocationType {
  BUILDING = 'building',
  FLOOR = 'floor',
  SECTION = 'section',
  SHELF = 'shelf',
  POSITION = 'position',
}

export enum MovementReason {
  CIRCULATION = 'circulation',
  MAINTENANCE = 'maintenance',
  REORGANIZATION = 'reorganization',
  TRANSFER = 'transfer',
  PRESERVATION = 'preservation',
  INSPECTION = 'inspection',
  OTHER = 'other',
}

export enum AccessLevel {
  PUBLIC = 'public',
  STAFF_ONLY = 'staff_only',
  ADMIN_ONLY = 'admin_only',
  SPECIAL_PERMISSION = 'special_permission',
}

// =====================================================
// Location Interfaces
// =====================================================

export interface Location {
  id: string;
  name: string;
  name_ar: string | null;
  code: string;
  location_type: LocationType;
  parent_id: string | null;
  full_path: string | null;
  capacity: number | null;
  current_count: number;
  dimensions: string | null;
  temperature: number | null;
  humidity: number | null;
  has_climate_control: boolean;
  is_restricted: boolean;
  access_level: AccessLevel | null;
  description: string | null;
  description_ar: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Computed fields
  parent_name?: string | null;
  children_count?: number;
  utilization_percentage?: number;
}

export interface LocationWithHierarchy extends Location {
  ancestors: Location[];
  children: Location[];
  book_count: number;
}

export interface LocationTreeNode {
  id: string;
  name: string;
  name_ar: string | null;
  code: string;
  location_type: LocationType;
  current_count: number;
  capacity: number | null;
  children: LocationTreeNode[];
}

export interface LocationCreate {
  name: string;
  name_ar?: string;
  code: string;
  location_type: LocationType;
  parent_id?: string;
  capacity?: number;
  dimensions?: string;
  temperature?: number;
  humidity?: number;
  has_climate_control?: boolean;
  is_restricted?: boolean;
  access_level?: AccessLevel;
  description?: string;
  description_ar?: string;
  notes?: string;
  is_active?: boolean;
}

export interface LocationUpdate {
  name?: string;
  name_ar?: string;
  code?: string;
  location_type?: LocationType;
  parent_id?: string;
  capacity?: number;
  dimensions?: string;
  temperature?: number;
  humidity?: number;
  has_climate_control?: boolean;
  is_restricted?: boolean;
  access_level?: AccessLevel;
  description?: string;
  description_ar?: string;
  notes?: string;
  is_active?: boolean;
}

export interface LocationFilters {
  search?: string;
  location_type?: LocationType;
  parent_id?: string;
  is_active?: boolean;
  is_restricted?: boolean;
  has_climate_control?: boolean;
  has_capacity?: boolean;
  over_capacity?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface LocationListResponse {
  data: Location[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LocationStatistics {
  total_locations: number;
  by_type: Record<string, number>;
  total_capacity: number;
  total_occupied: number;
  utilization_percentage: number;
  over_capacity_count: number;
  restricted_locations: number;
  climate_controlled: number;
  most_utilized: Array<{
    id: string;
    name: string;
    code: string;
    utilization: number;
  }>;
  least_utilized: Array<{
    id: string;
    name: string;
    code: string;
    utilization: number;
  }>;
}

// =====================================================
// Location History Interfaces
// =====================================================

export interface LocationHistory {
  id: string;
  book_id: string;
  from_location_id: string | null;
  to_location_id: string | null;
  from_location_text: string | null;
  to_location_text: string | null;
  reason: MovementReason;
  notes: string | null;
  moved_by: string | null;
  moved_by_name: string | null;
  moved_at: string;
  created_at: string;

  // Book information
  book_title?: string;
  book_title_ar?: string;
  book_isbn?: string;
}

export interface LocationHistoryCreate {
  book_id: string;
  from_location_id?: string;
  to_location_id?: string;
  reason: MovementReason;
  notes?: string;
}

export interface LocationHistoryFilters {
  book_id?: string;
  location_id?: string;
  from_location_id?: string;
  to_location_id?: string;
  moved_by?: string;
  reason?: MovementReason;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  sort_order?: 'asc' | 'desc';
}

export interface LocationHistoryListResponse {
  data: LocationHistory[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// =====================================================
// Bulk Operations
// =====================================================

export interface BulkLocationMove {
  book_ids: string[];
  to_location_id: string;
  reason: MovementReason;
  notes?: string;
}

export interface BulkLocationMoveResponse {
  success_count: number;
  failed_count: number;
  failed_books: Array<{
    book_id: string;
    error: string;
  }>;
  message: string;
}

// =====================================================
// UI Helper Types
// =====================================================

export interface LocationOption {
  value: string;
  label: string;
  type: LocationType;
  full_path?: string;
}

export interface LocationBreadcrumb {
  id: string;
  name: string;
  type: LocationType;
}
