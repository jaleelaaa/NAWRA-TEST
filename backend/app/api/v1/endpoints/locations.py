"""
Location Management API Endpoints.
Phase 3 - Enhanced Features (Day 12)
"""
from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from uuid import UUID
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.locations import (
    LocationCreate,
    LocationUpdate,
    LocationResponse,
    LocationWithHierarchy,
    LocationListResponse,
    LocationTreeNode,
    LocationStatistics,
    LocationHistoryCreate,
    LocationHistoryResponse,
    LocationHistoryListResponse,
    LocationFilters,
    LocationHistoryFilters,
    BulkLocationMove,
    BulkLocationMoveResponse,
    LocationType,
    MovementReason,
)
from ....services.location_service import LocationService

router = APIRouter()


# =====================================================
# Location Management Endpoints
# =====================================================

@router.post("", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
async def create_location(
    location: LocationCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new location in the hierarchical system.

    Requires: Administrator or Librarian role
    """
    service = LocationService(supabase)
    return await service.create_location(location)


@router.get("/statistics", response_model=LocationStatistics)
async def get_location_statistics(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get location statistics and utilization metrics.

    Returns:
    - Total locations by type
    - Capacity and utilization percentages
    - Most and least utilized locations
    """
    service = LocationService(supabase)
    return await service.get_statistics()


@router.get("/tree", response_model=List[LocationTreeNode])
async def get_location_tree(
    parent_id: Optional[UUID] = Query(None, description="Parent location ID (null for root)"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get location tree structure for hierarchical display.

    Query Parameters:
    - parent_id: Start from specific parent (null for root nodes)

    Returns tree with all descendants recursively loaded.
    """
    service = LocationService(supabase)
    return await service.get_location_tree(parent_id)


@router.get("/{location_id}", response_model=LocationResponse)
async def get_location(
    location_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get location details by ID.

    Includes:
    - Basic location information
    - Parent location name
    - Current item count
    - Capacity utilization percentage
    """
    service = LocationService(supabase)
    return await service.get_location(location_id)


@router.get("/{location_id}/hierarchy", response_model=LocationWithHierarchy)
async def get_location_hierarchy(
    location_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get location with full hierarchy information.

    Includes:
    - Ancestors (path from root to this location)
    - Direct children
    - Book count in this location
    """
    service = LocationService(supabase)
    return await service.get_location_with_hierarchy(location_id)


@router.get("", response_model=LocationListResponse)
async def list_locations(
    search: Optional[str] = Query(None, description="Search by name, code, or description"),
    location_type: Optional[LocationType] = Query(None, description="Filter by location type"),
    parent_id: Optional[UUID] = Query(None, description="Filter by parent location"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    is_restricted: Optional[bool] = Query(None, description="Filter by restriction status"),
    has_climate_control: Optional[bool] = Query(None, description="Filter by climate control"),
    has_capacity: Optional[bool] = Query(None, description="Filter locations with capacity defined"),
    over_capacity: Optional[bool] = Query(None, description="Filter over-capacity locations"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("code", description="Sort by field"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    List all locations with filtering, search, and pagination.

    Supports multiple filters:
    - Full-text search across name, code, description
    - Type filtering (building, floor, section, shelf, position)
    - Parent location filtering
    - Active/inactive status
    - Restricted access locations
    - Climate-controlled locations
    - Capacity utilization filters

    Returns paginated results with metadata.
    """
    service = LocationService(supabase)
    filters = LocationFilters(
        search=search,
        location_type=location_type,
        parent_id=parent_id,
        is_active=is_active,
        is_restricted=is_restricted,
        has_climate_control=has_climate_control,
        has_capacity=has_capacity,
        over_capacity=over_capacity,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return await service.list_locations(filters)


@router.patch("/{location_id}", response_model=LocationResponse)
async def update_location(
    location_id: UUID,
    update: LocationUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update location details.

    Validates:
    - Unique code constraint
    - Parent location exists
    - No circular hierarchy (location as its own parent)

    Requires: Administrator or Librarian role
    """
    service = LocationService(supabase)
    return await service.update_location(location_id, update)


@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Delete a location.

    Constraints:
    - Location must be empty (no books)
    - Location must have no child locations
    - Cannot delete if items are currently assigned

    Requires: Administrator role
    """
    service = LocationService(supabase)
    await service.delete_location(location_id)


# =====================================================
# Location History Endpoints
# =====================================================

@router.post("/history", response_model=LocationHistoryResponse, status_code=status.HTTP_201_CREATED)
async def create_history_entry(
    history: LocationHistoryCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create a location history entry manually.

    Note: History is usually created automatically via triggers,
    but this endpoint allows manual entries for special cases.

    Requires: Librarian or Administrator role
    """
    service = LocationService(supabase)
    return await service.create_history_entry(history, current_user['id'])


@router.get("/history/{history_id}", response_model=LocationHistoryResponse)
async def get_history_entry(
    history_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get location history entry by ID.

    Includes:
    - Book information
    - From/to locations
    - User who moved the item
    - Reason for movement
    """
    service = LocationService(supabase)
    return await service.get_history_entry(history_id)


@router.get("/history", response_model=LocationHistoryListResponse)
async def list_location_history(
    book_id: Optional[UUID] = Query(None, description="Filter by book ID"),
    location_id: Optional[UUID] = Query(None, description="Filter by location (from or to)"),
    from_location_id: Optional[UUID] = Query(None, description="Filter by source location"),
    to_location_id: Optional[UUID] = Query(None, description="Filter by destination location"),
    moved_by: Optional[UUID] = Query(None, description="Filter by user who moved"),
    reason: Optional[MovementReason] = Query(None, description="Filter by movement reason"),
    date_from: Optional[str] = Query(None, description="Filter from date (ISO format)"),
    date_to: Optional[str] = Query(None, description="Filter to date (ISO format)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    List location history with filters.

    Use this endpoint to:
    - Track item movements over time
    - Audit location changes
    - Analyze circulation patterns
    - Find items that moved to/from specific locations

    Returns chronological list of all location changes.
    """
    from datetime import datetime

    service = LocationService(supabase)
    filters = LocationHistoryFilters(
        book_id=book_id,
        location_id=location_id,
        from_location_id=from_location_id,
        to_location_id=to_location_id,
        moved_by=moved_by,
        reason=reason,
        date_from=datetime.fromisoformat(date_from) if date_from else None,
        date_to=datetime.fromisoformat(date_to) if date_to else None,
        page=page,
        page_size=page_size,
        sort_order=sort_order
    )
    return await service.list_location_history(filters)


# =====================================================
# Bulk Operations
# =====================================================

@router.post("/bulk-move", response_model=BulkLocationMoveResponse)
async def bulk_move_books(
    bulk_move: BulkLocationMove,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Move multiple books to a new location in bulk.

    Use cases:
    - Reorganizing shelves
    - Moving collections to new sections
    - Consolidating inventory
    - Archive management

    Returns:
    - Success count
    - Failed count
    - Details of any failures

    Requires: Librarian or Administrator role
    """
    service = LocationService(supabase)
    return await service.bulk_move_books(bulk_move, current_user['id'])
