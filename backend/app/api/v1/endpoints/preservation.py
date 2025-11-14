"""
Preservation API Endpoints
RESTful API for preservation records management
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional, List
from uuid import UUID
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.preservation import (
    PreservationCreate,
    PreservationUpdate,
    PreservationResponse,
    PreservationListResponse,
    PreservationStatistics,
)
from ....services.preservation_service import PreservationService

router = APIRouter()


@router.post(
    "",
    response_model=PreservationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Preservation Record",
    description="Create a new preservation record for an artifact/book"
)
async def create_preservation_record(
    record: PreservationCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new preservation record with the following information:
    - Artifact condition status
    - Conservation history
    - Restoration requirements
    - Inspection schedule
    - Environmental conditions
    - Damage documentation
    """
    service = PreservationService(supabase)
    return await service.create_preservation_record(record, current_user['id'])


@router.get(
    "/statistics/summary",
    response_model=PreservationStatistics,
    summary="Get Preservation Statistics",
    description="Get comprehensive preservation statistics for dashboard"
)
async def get_preservation_statistics(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get preservation statistics including:
    - Total preservation records
    - Records by condition status
    - Items needing restoration
    - Upcoming and overdue inspections
    - Average condition score
    """
    service = PreservationService(supabase)
    return await service.get_preservation_statistics()


@router.get(
    "/{record_id}",
    response_model=PreservationResponse,
    summary="Get Preservation Record",
    description="Get a specific preservation record by ID"
)
async def get_preservation_record(
    record_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Retrieve detailed information about a specific preservation record,
    including associated book/artifact details.
    """
    service = PreservationService(supabase)
    return await service.get_preservation_record(record_id)


@router.get(
    "/book/{book_id}",
    response_model=List[PreservationResponse],
    summary="Get Preservation Records for Book",
    description="Get all preservation records for a specific book/artifact"
)
async def get_preservation_by_book(
    book_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Retrieve all preservation records associated with a specific book,
    ordered by creation date (most recent first).
    Useful for viewing the complete preservation history of an artifact.
    """
    service = PreservationService(supabase)
    return await service.get_preservation_by_book(book_id)


@router.get(
    "",
    response_model=PreservationListResponse,
    summary="List Preservation Records",
    description="List all preservation records with optional filtering and pagination"
)
async def list_preservation_records(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of records per page"),
    condition_status: Optional[str] = Query(
        None,
        description="Filter by condition status (excellent, good, fair, poor, critical)"
    ),
    restoration_needed: Optional[bool] = Query(
        None,
        description="Filter by restoration needed (true/false)"
    ),
    overdue_inspection: bool = Query(
        False,
        description="Filter for overdue inspections only"
    ),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    List preservation records with optional filters:
    - **condition_status**: Filter by condition (excellent, good, fair, poor, critical)
    - **restoration_needed**: Filter items needing restoration
    - **overdue_inspection**: Show only items with overdue inspections
    - **page**: Page number for pagination
    - **page_size**: Number of records per page (1-100)

    Returns paginated results with book details included.
    """
    service = PreservationService(supabase)
    return await service.list_preservation_records(
        page=page,
        page_size=page_size,
        condition_status=condition_status,
        restoration_needed=restoration_needed,
        overdue_inspection=overdue_inspection
    )


@router.patch(
    "/{record_id}",
    response_model=PreservationResponse,
    summary="Update Preservation Record",
    description="Update an existing preservation record"
)
async def update_preservation_record(
    record_id: UUID,
    update: PreservationUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update any field of an existing preservation record.
    Only the fields provided in the request will be updated.
    Useful for:
    - Recording new inspections
    - Adding conservation activities
    - Updating condition status
    - Modifying restoration requirements
    """
    service = PreservationService(supabase)
    return await service.update_preservation_record(record_id, update)


@router.delete(
    "/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Preservation Record",
    description="Delete a preservation record"
)
async def delete_preservation_record(
    record_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Permanently delete a preservation record.
    This action cannot be undone.
    """
    service = PreservationService(supabase)
    await service.delete_preservation_record(record_id)
    return None
