/**
 * Books and Categories Type Definitions
 *
 * TypeScript interfaces matching backend Pydantic models
 */

// ============================================================================
// Enums
// ============================================================================

export enum BookStatus {
  AVAILABLE = 'available',
  CHECKED_OUT = 'checked_out',
  RESERVED = 'reserved',
  PROCESSING = 'processing',
  DAMAGED = 'damaged',
  LOST = 'lost',
  WITHDRAWN = 'withdrawn',
  ON_ORDER = 'on_order',
  IN_REPAIR = 'in_repair',
}

export enum BookLanguage {
  ENGLISH = 'en',
  ARABIC = 'ar',
  BILINGUAL = 'bilingual',
  OTHER = 'other',
}

export enum AcquisitionMethod {
  PURCHASE = 'purchase',
  DONATION = 'donation',
  EXCHANGE = 'exchange',
  GIFT = 'gift',
}

export enum BookSortField {
  TITLE = 'title',
  AUTHOR = 'author',
  PUBLICATION_YEAR = 'publication_year',
  ACQUISITION_DATE = 'acquisition_date',
  CREATED_AT = 'created_at',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

// ============================================================================
// Category Types
// ============================================================================

export interface CategoryBase {
  name: string;
  name_ar?: string;
  dewey_decimal?: string;
  description?: string;
  description_ar?: string;
  parent_id?: string;
}

export interface CategoryCreate extends CategoryBase {}

export interface CategoryUpdate extends Partial<CategoryBase> {}

export interface CategoryResponse extends CategoryBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithCount extends CategoryResponse {
  book_count: number;
}

export interface CategoryListResponse {
  items: CategoryWithCount[];
  total: number;
}

// ============================================================================
// Book Types
// ============================================================================

export interface BookBase {
  // Identifiers
  isbn?: string;
  barcode?: string;

  // Basic Information
  title: string;
  title_ar?: string;
  subtitle?: string;
  subtitle_ar?: string;

  // Author Information
  author: string;
  author_ar?: string;
  co_authors?: string;
  co_authors_ar?: string;

  // Publication Details
  publisher?: string;
  publisher_ar?: string;
  publication_year?: number;
  publication_place?: string;
  edition?: string;

  // Classification
  category_id?: string;
  dewey_decimal?: string;

  // Physical Description
  language: string;
  pages?: number;
  dimensions?: string;
  binding_type?: string;

  // Content Description
  description?: string;
  description_ar?: string;
  table_of_contents?: string;
  table_of_contents_ar?: string;
  subjects?: string;
  subjects_ar?: string;
  keywords?: string;

  // Media
  cover_image_url?: string;
  thumbnail_url?: string;

  // Inventory Management
  quantity: number;
  available_quantity: number;
  shelf_location?: string;

  // Acquisition Information
  acquisition_date?: string;
  acquisition_method?: string;
  price?: number;
  vendor?: string;

  // Status Management
  status: BookStatus;

  // Additional Metadata
  notes?: string;
  notes_ar?: string;
}

export interface BookCreate extends BookBase {}

export interface BookUpdate extends Partial<BookBase> {}

export interface BookResponse extends BookBase {
  id: string;
  created_at: string;
  updated_at: string;
  category?: CategoryResponse;
}

export interface BookListItem {
  id: string;
  isbn?: string;
  barcode?: string;
  title: string;
  title_ar?: string;
  author: string;
  author_ar?: string;
  publisher?: string;
  publication_year?: number;
  category_id?: string;
  language: string;
  cover_image_url?: string;
  thumbnail_url?: string;
  quantity: number;
  available_quantity: number;
  status: BookStatus;
  created_at: string;
}

// ============================================================================
// Query and Filter Types
// ============================================================================

export interface BookFilters {
  // Text search
  search?: string;

  // Category filter
  category_id?: string;

  // Status filters
  status?: BookStatus;
  available_only?: boolean;

  // Language filter
  language?: string;

  // Year range
  year_from?: number;
  year_to?: number;

  // Acquisition date range
  acquired_from?: string;
  acquired_to?: string;

  // Sorting
  sort_by?: BookSortField;
  sort_order?: SortOrder;

  // Pagination
  page?: number;
  page_size?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface BookListResponse {
  items: BookListItem[];
  meta: PaginationMeta;
}

// ============================================================================
// Bulk Operations Types
// ============================================================================

export interface BulkBookUpdate {
  book_ids: string[];
  updates: BookUpdate;
}

export interface BulkBookDelete {
  book_ids: string[];
}

export interface BulkOperationResponse {
  success: boolean;
  affected_count: number;
  message: string;
  errors?: string[];
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface BookStatistics {
  total_books: number;
  total_copies: number;
  available_copies: number;
  checked_out: number;
  reserved: number;
  damaged: number;
  lost: number;
  by_category: Array<{ category: string; count: number }>;
  by_language: Array<{ language: string; count: number }>;
  by_status: Array<{ status: string; count: number }>;
  recent_additions: number;
}

// ============================================================================
// Availability Check Types
// ============================================================================

export interface BookAvailabilityResponse {
  book_id: string;
  is_available: boolean;
  available_quantity: number;
  total_quantity: number;
  status: string;
}

// ============================================================================
// Form Types (for React Hook Form)
// ============================================================================

export interface BookFormData extends Omit<BookCreate, 'acquisition_date'> {
  acquisition_date?: Date;
}

export interface CategoryFormData extends CategoryCreate {}
