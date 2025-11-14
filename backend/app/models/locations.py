"""
Location management models for hierarchical location tracking.
Phase 3 - Enhanced Features (Day 12)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


# =====================================================
# Enums
# =====================================================

class LocationType(str, Enum):
    """Location type enum for hierarchical structure."""
    BUILDING = "building"
    FLOOR = "floor"
    SECTION = "section"
    SHELF = "shelf"
    POSITION = "position"


class MovementReason(str, Enum):
    """Reason for item movement."""
    CIRCULATION = "circulation"
    MAINTENANCE = "maintenance"
    REORGANIZATION = "reorganization"
    TRANSFER = "transfer"
    PRESERVATION = "preservation"
    INSPECTION = "inspection"
    OTHER = "other"


class AccessLevel(str, Enum):
    """Access level for restricted locations."""
    PUBLIC = "public"
    STAFF_ONLY = "staff_only"
    ADMIN_ONLY = "admin_only"
    SPECIAL_PERMISSION = "special_permission"


# =====================================================
# Location Models
# =====================================================

class LocationBase(BaseModel):
    """Base location model."""
    name: str = Field(..., min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    code: str = Field(..., min_length=1, max_length=50)
    location_type: LocationType
    parent_id: Optional[UUID] = None
    capacity: Optional[int] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, max_length=100)
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    has_climate_control: bool = False
    is_restricted: bool = False
    access_level: Optional[AccessLevel] = None
    description: Optional[str] = None
    description_ar: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class LocationCreate(LocationBase):
    """Location creation model."""
    pass


class LocationUpdate(BaseModel):
    """Location update model - all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, min_length=1, max_length=50)
    location_type: Optional[LocationType] = None
    parent_id: Optional[UUID] = None
    capacity: Optional[int] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, max_length=100)
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    has_climate_control: Optional[bool] = None
    is_restricted: Optional[bool] = None
    access_level: Optional[AccessLevel] = None
    description: Optional[str] = None
    description_ar: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class LocationResponse(LocationBase):
    """Location response model."""
    id: UUID
    full_path: Optional[str] = None
    current_count: int = 0
    created_at: datetime
    updated_at: datetime

    # Computed fields
    parent_name: Optional[str] = None
    children_count: int = 0
    utilization_percentage: float = 0.0

    class Config:
        from_attributes = True


class LocationWithHierarchy(LocationResponse):
    """Location with full hierarchy information."""
    ancestors: List['LocationResponse'] = []
    children: List['LocationResponse'] = []
    book_count: int = 0


class LocationListResponse(BaseModel):
    """Paginated location list response."""
    data: List[LocationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class LocationTreeNode(BaseModel):
    """Tree structure for location hierarchy visualization."""
    id: UUID
    name: str
    name_ar: Optional[str] = None
    code: str
    location_type: LocationType
    current_count: int = 0
    capacity: Optional[int] = None
    children: List['LocationTreeNode'] = []


class LocationStatistics(BaseModel):
    """Location statistics."""
    total_locations: int
    by_type: dict  # {building: 2, floor: 5, section: 20, ...}
    total_capacity: int
    total_occupied: int
    utilization_percentage: float
    over_capacity_count: int
    restricted_locations: int
    climate_controlled: int
    most_utilized: List[dict]  # Top 5 most utilized locations
    least_utilized: List[dict]  # Top 5 least utilized locations


# =====================================================
# Location History Models
# =====================================================

class LocationHistoryBase(BaseModel):
    """Base location history model."""
    book_id: UUID
    from_location_id: Optional[UUID] = None
    to_location_id: Optional[UUID] = None
    reason: MovementReason
    notes: Optional[str] = None


class LocationHistoryCreate(LocationHistoryBase):
    """Location history creation model."""
    moved_by: Optional[UUID] = None


class LocationHistoryResponse(LocationHistoryBase):
    """Location history response model."""
    id: UUID
    from_location_text: Optional[str] = None
    to_location_text: Optional[str] = None
    moved_by: Optional[UUID] = None
    moved_by_name: Optional[str] = None
    moved_at: datetime
    created_at: datetime

    # Book information
    book_title: Optional[str] = None
    book_title_ar: Optional[str] = None
    book_isbn: Optional[str] = None

    class Config:
        from_attributes = True


class LocationHistoryListResponse(BaseModel):
    """Paginated location history list response."""
    data: List[LocationHistoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# =====================================================
# Search and Filter Models
# =====================================================

class LocationFilters(BaseModel):
    """Location search and filter parameters."""
    search: Optional[str] = Field(None, description="Search by name, code, or description")
    location_type: Optional[LocationType] = None
    parent_id: Optional[UUID] = None
    is_active: Optional[bool] = None
    is_restricted: Optional[bool] = None
    has_climate_control: Optional[bool] = None
    has_capacity: Optional[bool] = None  # Filter locations with capacity defined
    over_capacity: Optional[bool] = None  # Filter locations over capacity
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("code", description="Sort by field")
    sort_order: str = Field("asc", pattern="^(asc|desc)$")


class LocationHistoryFilters(BaseModel):
    """Location history filter parameters."""
    book_id: Optional[UUID] = None
    location_id: Optional[UUID] = None  # Either from or to
    from_location_id: Optional[UUID] = None
    to_location_id: Optional[UUID] = None
    moved_by: Optional[UUID] = None
    reason: Optional[MovementReason] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


# =====================================================
# Bulk Operations
# =====================================================

class BulkLocationMove(BaseModel):
    """Bulk move books to a new location."""
    book_ids: List[UUID] = Field(..., min_items=1)
    to_location_id: UUID
    reason: MovementReason
    notes: Optional[str] = None


class BulkLocationMoveResponse(BaseModel):
    """Response for bulk move operation."""
    success_count: int
    failed_count: int
    failed_books: List[dict] = []  # [{book_id, error}]
    message: str
