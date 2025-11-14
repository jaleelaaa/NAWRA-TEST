"""
Preservation Records Management Endpoints

API endpoints for tracking item condition, conservation, and restoration
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from uuid import UUID
from datetime import date

from app.models.preservation import (
    PreservationCondition,
    ConservationPriority,
    DamageType,
    PreservationRecordCreate,
    PreservationRecordUpdate,
    PreservationRecordResponse,
    PreservationRecordFilters,
    PreservationRecordListResponse,
    PreservationStatistics,
)
from app.services.preservation_service import preservation_service


router = APIRouter()


# =====================================================
# Preservation Records CRUD
# =====================================================

@router.post(
    "/records",
    response_model=PreservationRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create preservation record",
    tags=["Preservation"]
)
async def create_preservation_record(record: PreservationRecordCreate):
    """
    Create a new preservation/conservation record for an artifact.

    This endpoint allows documenting:
    - Overall condition assessment
    - Specific damage types and descriptions
    - Conservation needs and priorities
    - Estimated restoration costs
    - Recommended preservation actions
    - Storage and handling requirements

    Args:
        record: Preservation record data

    Returns:
        Created preservation record

    Raises:
        400: Invalid data
        500: Failed to create record
    """
    try:
        new_record = await preservation_service.create_record(record)

        if not new_record:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create preservation record"
            )

        return new_record

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create preservation record: {str(e)}"
        )


@router.get(
    "/records",
    response_model=PreservationRecordListResponse,
    summary="Get preservation records",
    tags=["Preservation"]
)
async def get_preservation_records(
    book_id: Optional[UUID] = Query(None),
    inspector_id: Optional[UUID] = Query(None),
    condition: Optional[PreservationCondition] = Query(None),
    priority: Optional[ConservationPriority] = Query(None),
    requires_conservation: Optional[bool] = Query(None),
    damage_type: Optional[DamageType] = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("inspection_date"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    """
    Get preservation records with filtering and pagination.

    Query Parameters:
        - book_id: Filter by book/artifact
        - inspector_id: Filter by inspector
        - condition: Filter by overall condition
        - priority: Filter by conservation priority
        - requires_conservation: Filter items needing conservation
        - damage_type: Filter by specific damage type
        - from_date: Start date (ISO format)
        - to_date: End date (ISO format)
        - search: Search in descriptions and notes
        - page: Page number (default: 1)
        - page_size: Items per page (default: 20, max: 100)
        - sort_by: Sort field (default: inspection_date)
        - sort_order: Sort order (asc/desc, default: desc)

    Returns:
        Paginated list of preservation records

    Raises:
        500: Failed to fetch records
    """
    try:
        filters = PreservationRecordFilters(
            book_id=book_id,
            inspector_id=inspector_id,
            condition=condition,
            priority=priority,
            requires_conservation=requires_conservation,
            damage_type=damage_type,
            from_date=from_date,
            to_date=to_date,
            search=search,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return await preservation_service.get_records(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch preservation records: {str(e)}"
        )


@router.get(
    "/records/{record_id}",
    response_model=PreservationRecordResponse,
    summary="Get preservation record by ID",
    tags=["Preservation"]
)
async def get_preservation_record(record_id: UUID):
    """
    Get a single preservation record by ID.

    Args:
        record_id: Preservation record UUID

    Returns:
        Preservation record details

    Raises:
        404: Record not found
        500: Failed to fetch record
    """
    try:
        record = await preservation_service.get_record(record_id)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preservation record not found"
            )

        return record

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch preservation record: {str(e)}"
        )


@router.put(
    "/records/{record_id}",
    response_model=PreservationRecordResponse,
    summary="Update preservation record",
    tags=["Preservation"]
)
async def update_preservation_record(
    record_id: UUID,
    update: PreservationRecordUpdate
):
    """
    Update an existing preservation record.

    Args:
        record_id: Preservation record UUID
        update: Updated preservation record data

    Returns:
        Updated preservation record

    Raises:
        404: Record not found
        500: Failed to update record
    """
    try:
        # Check if record exists
        existing = await preservation_service.get_record(record_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preservation record not found"
            )

        updated = await preservation_service.update_record(record_id, update)

        if not updated:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update preservation record"
            )

        return updated

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update preservation record: {str(e)}"
        )


@router.delete(
    "/records/{record_id}",
    summary="Delete preservation record",
    tags=["Preservation"]
)
async def delete_preservation_record(record_id: UUID):
    """
    Delete a preservation record.

    Args:
        record_id: Preservation record UUID

    Returns:
        Success message

    Raises:
        404: Record not found
        500: Failed to delete record
    """
    try:
        # Check if record exists
        existing = await preservation_service.get_record(record_id)
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Preservation record not found"
            )

        success = await preservation_service.delete_record(record_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete preservation record"
            )

        return {
            "message": "Preservation record deleted successfully",
            "record_id": str(record_id)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete preservation record: {str(e)}"
        )


# =====================================================
# Book-Specific Preservation Endpoints
# =====================================================

@router.get(
    "/books/{book_id}/records",
    response_model=PreservationRecordListResponse,
    summary="Get preservation history for a book",
    tags=["Preservation", "Books"]
)
async def get_book_preservation_history(
    book_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    """
    Get complete preservation history for a specific book.

    Args:
        book_id: Book UUID
        page: Page number
        page_size: Items per page

    Returns:
        Paginated list of preservation records for the book

    Raises:
        500: Failed to fetch records
    """
    try:
        filters = PreservationRecordFilters(
            book_id=book_id,
            page=page,
            page_size=page_size,
            sort_by="inspection_date",
            sort_order="desc",
        )

        return await preservation_service.get_records(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch book preservation history: {str(e)}"
        )


@router.get(
    "/books/{book_id}/latest",
    response_model=PreservationRecordResponse,
    summary="Get latest preservation record for a book",
    tags=["Preservation", "Books"]
)
async def get_latest_preservation_record(book_id: UUID):
    """
    Get the most recent preservation inspection for a book.

    Args:
        book_id: Book UUID

    Returns:
        Latest preservation record

    Raises:
        404: No preservation records found for book
        500: Failed to fetch record
    """
    try:
        filters = PreservationRecordFilters(
            book_id=book_id,
            page=1,
            page_size=1,
            sort_by="inspection_date",
            sort_order="desc",
        )

        result = await preservation_service.get_records(filters)

        if not result.items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No preservation records found for this book"
            )

        return result.items[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch latest preservation record: {str(e)}"
        )


# =====================================================
# Statistics and Reports
# =====================================================

@router.get(
    "/statistics",
    response_model=PreservationStatistics,
    summary="Get preservation statistics",
    tags=["Preservation", "Statistics"]
)
async def get_preservation_statistics(
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
):
    """
    Get comprehensive preservation statistics.

    Query Parameters:
        - from_date: Start date for statistics (ISO format)
        - to_date: End date for statistics (ISO format)

    Returns:
        Preservation statistics including:
        - Total records and inspections
        - Items requiring conservation
        - Breakdown by condition and priority
        - Damage type statistics
        - Critical and urgent items
        - Budget estimates

    Raises:
        500: Failed to fetch statistics
    """
    try:
        return await preservation_service.get_statistics(from_date, to_date)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch preservation statistics: {str(e)}"
        )


@router.get(
    "/critical-items",
    response_model=PreservationRecordListResponse,
    summary="Get items in critical condition",
    tags=["Preservation"]
)
async def get_critical_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    """
    Get all items in critical or poor condition requiring immediate attention.

    Returns:
        List of preservation records for critical items

    Raises:
        500: Failed to fetch critical items
    """
    try:
        filters = PreservationRecordFilters(
            condition=PreservationCondition.CRITICAL,
            page=page,
            page_size=page_size,
            sort_by="inspection_date",
            sort_order="desc",
        )

        return await preservation_service.get_records(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch critical items: {str(e)}"
        )


@router.get(
    "/conservation-needed",
    response_model=PreservationRecordListResponse,
    summary="Get items requiring conservation",
    tags=["Preservation"]
)
async def get_items_requiring_conservation(
    priority: Optional[ConservationPriority] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    """
    Get all items that require conservation work.

    Query Parameters:
        - priority: Filter by conservation priority
        - page: Page number
        - page_size: Items per page

    Returns:
        List of preservation records for items needing conservation

    Raises:
        500: Failed to fetch items
    """
    try:
        filters = PreservationRecordFilters(
            requires_conservation=True,
            priority=priority,
            page=page,
            page_size=page_size,
            sort_by="priority",
            sort_order="desc",
        )

        return await preservation_service.get_records(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch items requiring conservation: {str(e)}"
        )
