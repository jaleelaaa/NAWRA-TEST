"""
Books and Categories models for library catalog management.
"""
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from enum import Enum


# =====================================================
# Enums
# =====================================================

class BookStatus(str, Enum):
    """Book status enum."""
    AVAILABLE = "available"
    CHECKED_OUT = "checked_out"
    RESERVED = "reserved"
    PROCESSING = "processing"
    DAMAGED = "damaged"
    LOST = "lost"
    WITHDRAWN = "withdrawn"
    ON_ORDER = "on_order"
    IN_REPAIR = "in_repair"


class BookLanguage(str, Enum):
    """Book language enum."""
    ENGLISH = "en"
    ARABIC = "ar"
    BILINGUAL = "bilingual"
    OTHER = "other"


class AcquisitionMethod(str, Enum):
    """Book acquisition method enum."""
    PURCHASE = "purchase"
    DONATION = "donation"
    EXCHANGE = "exchange"
    GIFT = "gift"


# =====================================================
# Category Models
# =====================================================

class CategoryBase(BaseModel):
    """Base category model."""
    name: str = Field(..., min_length=1, max_length=255)
    name_ar: Optional[str] = Field(None, max_length=255)
    dewey_decimal: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    parent_id: Optional[UUID] = None


class CategoryCreate(CategoryBase):
    """Category creation model."""
    pass


class CategoryUpdate(BaseModel):
    """Category update model - all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    name_ar: Optional[str] = Field(None, max_length=255)
    dewey_decimal: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    parent_id: Optional[UUID] = None


class CategoryResponse(CategoryBase):
    """Category response model."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWithCount(CategoryResponse):
    """Category with book count."""
    book_count: int = 0


# =====================================================
# Book Models
# =====================================================

class BookBase(BaseModel):
    """Base book model."""
    # Identifiers
    isbn: Optional[str] = Field(None, max_length=20)
    barcode: Optional[str] = Field(None, max_length=50)

    # Basic Information
    title: str = Field(..., min_length=1, max_length=500)
    title_ar: Optional[str] = Field(None, max_length=500)
    subtitle: Optional[str] = Field(None, max_length=500)
    subtitle_ar: Optional[str] = Field(None, max_length=500)

    # Author Information
    author: str = Field(..., min_length=1, max_length=255)
    author_ar: Optional[str] = Field(None, max_length=255)
    co_authors: Optional[str] = None
    co_authors_ar: Optional[str] = None

    # Publication Details
    publisher: Optional[str] = Field(None, max_length=255)
    publisher_ar: Optional[str] = Field(None, max_length=255)
    publication_year: Optional[int] = Field(None, ge=1000, le=9999)
    publication_place: Optional[str] = Field(None, max_length=255)
    edition: Optional[str] = Field(None, max_length=100)

    # Classification
    category_id: Optional[UUID] = None
    dewey_decimal: Optional[str] = Field(None, max_length=20)

    # Physical Description
    language: str = Field(default="en", max_length=10)
    pages: Optional[int] = Field(None, ge=1)
    dimensions: Optional[str] = Field(None, max_length=50)
    binding_type: Optional[str] = Field(None, max_length=50)

    # Content Description
    description: Optional[str] = None
    description_ar: Optional[str] = None
    table_of_contents: Optional[str] = None
    table_of_contents_ar: Optional[str] = None
    subjects: Optional[str] = None
    subjects_ar: Optional[str] = None
    keywords: Optional[str] = None

    # Media
    cover_image_url: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = Field(None, max_length=500)

    # Inventory Management
    quantity: int = Field(default=1, ge=0)
    available_quantity: int = Field(default=1, ge=0)
    shelf_location: Optional[str] = Field(None, max_length=100)

    # Acquisition Information
    acquisition_date: Optional[date] = None
    acquisition_method: Optional[str] = Field(None, max_length=50)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    vendor: Optional[str] = Field(None, max_length=255)

    # Status Management
    status: BookStatus = Field(default=BookStatus.AVAILABLE)

    # Additional Metadata
    notes: Optional[str] = None
    notes_ar: Optional[str] = None

    @field_validator('available_quantity')
    def validate_available_quantity(cls, v, info):
        """Ensure available quantity doesn't exceed total quantity."""
        if 'quantity' in info.data and v > info.data['quantity']:
            raise ValueError('available_quantity cannot exceed quantity')
        return v


class BookCreate(BookBase):
    """Book creation model."""
    pass


class BookUpdate(BaseModel):
    """Book update model - all fields optional."""
    # Identifiers
    isbn: Optional[str] = Field(None, max_length=20)
    barcode: Optional[str] = Field(None, max_length=50)

    # Basic Information
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    title_ar: Optional[str] = Field(None, max_length=500)
    subtitle: Optional[str] = Field(None, max_length=500)
    subtitle_ar: Optional[str] = Field(None, max_length=500)

    # Author Information
    author: Optional[str] = Field(None, min_length=1, max_length=255)
    author_ar: Optional[str] = Field(None, max_length=255)
    co_authors: Optional[str] = None
    co_authors_ar: Optional[str] = None

    # Publication Details
    publisher: Optional[str] = Field(None, max_length=255)
    publisher_ar: Optional[str] = Field(None, max_length=255)
    publication_year: Optional[int] = Field(None, ge=1000, le=9999)
    publication_place: Optional[str] = Field(None, max_length=255)
    edition: Optional[str] = Field(None, max_length=100)

    # Classification
    category_id: Optional[UUID] = None
    dewey_decimal: Optional[str] = Field(None, max_length=20)

    # Physical Description
    language: Optional[str] = Field(None, max_length=10)
    pages: Optional[int] = Field(None, ge=1)
    dimensions: Optional[str] = Field(None, max_length=50)
    binding_type: Optional[str] = Field(None, max_length=50)

    # Content Description
    description: Optional[str] = None
    description_ar: Optional[str] = None
    table_of_contents: Optional[str] = None
    table_of_contents_ar: Optional[str] = None
    subjects: Optional[str] = None
    subjects_ar: Optional[str] = None
    keywords: Optional[str] = None

    # Media
    cover_image_url: Optional[str] = Field(None, max_length=500)
    thumbnail_url: Optional[str] = Field(None, max_length=500)

    # Inventory Management
    quantity: Optional[int] = Field(None, ge=0)
    available_quantity: Optional[int] = Field(None, ge=0)
    shelf_location: Optional[str] = Field(None, max_length=100)

    # Acquisition Information
    acquisition_date: Optional[date] = None
    acquisition_method: Optional[str] = Field(None, max_length=50)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    vendor: Optional[str] = Field(None, max_length=255)

    # Status Management
    status: Optional[BookStatus] = None

    # Additional Metadata
    notes: Optional[str] = None
    notes_ar: Optional[str] = None


class BookResponse(BookBase):
    """Book response model."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


class BookListItem(BaseModel):
    """Simplified book model for list views."""
    id: UUID
    isbn: Optional[str]
    barcode: Optional[str]
    title: str
    title_ar: Optional[str]
    author: str
    author_ar: Optional[str]
    publisher: Optional[str]
    publication_year: Optional[int]
    category_id: Optional[UUID]
    language: str
    cover_image_url: Optional[str]
    thumbnail_url: Optional[str]
    quantity: int
    available_quantity: int
    status: BookStatus
    created_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Query and Filter Models
# =====================================================

class BookSortField(str, Enum):
    """Book sort field enum."""
    TITLE = "title"
    AUTHOR = "author"
    PUBLICATION_YEAR = "publication_year"
    ACQUISITION_DATE = "acquisition_date"
    CREATED_AT = "created_at"


class SortOrder(str, Enum):
    """Sort order enum."""
    ASC = "asc"
    DESC = "desc"


class BookFilters(BaseModel):
    """Book filter parameters."""
    # Text search
    search: Optional[str] = Field(None, description="Search in title, author, ISBN")

    # Category filter
    category_id: Optional[UUID] = None

    # Status filters
    status: Optional[BookStatus] = None
    available_only: Optional[bool] = Field(None, description="Show only available books")

    # Language filter
    language: Optional[str] = None

    # Year range
    year_from: Optional[int] = Field(None, ge=1000, le=9999)
    year_to: Optional[int] = Field(None, ge=1000, le=9999)

    # Acquisition date range
    acquired_from: Optional[date] = None
    acquired_to: Optional[date] = None

    # Sorting
    sort_by: BookSortField = Field(default=BookSortField.CREATED_AT)
    sort_order: SortOrder = Field(default=SortOrder.DESC)

    # Pagination
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=12, ge=1, le=100)


class PaginationMeta(BaseModel):
    """Pagination metadata."""
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool


class BookListResponse(BaseModel):
    """Paginated book list response."""
    items: List[BookListItem]
    meta: PaginationMeta


class CategoryListResponse(BaseModel):
    """Category list response."""
    items: List[CategoryWithCount]
    total: int


# =====================================================
# Bulk Operations
# =====================================================

class BulkBookUpdate(BaseModel):
    """Bulk book update model."""
    book_ids: List[UUID] = Field(..., min_length=1)
    updates: BookUpdate


class BulkBookDelete(BaseModel):
    """Bulk book delete model."""
    book_ids: List[UUID] = Field(..., min_length=1)


class BulkOperationResponse(BaseModel):
    """Bulk operation response."""
    success: bool
    affected_count: int
    message: str
    errors: Optional[List[str]] = None


# =====================================================
# Statistics Models
# =====================================================

class BookStatistics(BaseModel):
    """Book statistics."""
    total_books: int
    total_copies: int
    available_copies: int
    checked_out: int
    reserved: int
    damaged: int
    lost: int
    by_category: List[dict]
    by_language: List[dict]
    by_status: List[dict]
    recent_additions: int  # Added in last 30 days
