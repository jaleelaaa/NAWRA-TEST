"""
Circulation management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query, Response
from typing import Optional
from ....models.circulation import (
    CirculationCreate,
    CirculationReturn,
    CirculationUpdate,
    CirculationResponse,
    CirculationDetailResponse,
    CirculationListResponse,
    CirculationStatsResponse
)
from ....services.circulation_service import CirculationService
import csv
import io

router = APIRouter()


def get_circulation_service() -> CirculationService:
    """Dependency to get circulation service instance"""
    return CirculationService()


@router.get("", response_model=CirculationListResponse, summary="Get all circulation records")
async def get_circulation_records(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by user name, book title"),
    status: Optional[str] = Query(None, description="Filter by status (active, overdue, returned, reserved)"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    due_date_filter: Optional[str] = Query(None, description="Filter by due date (today, tomorrow, week, overdue)"),
    sort_by: str = Query("issue_date", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Get paginated list of circulation records with optional filtering and sorting

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    - **search**: Search in user name, book title
    - **status**: Filter by status (active, overdue, returned, reserved)
    - **user_type**: Filter by user type
    - **due_date_filter**: Filter by due date (today, tomorrow, week, overdue)
    - **sort_by**: Sort field (issue_date, due_date, etc.)
    - **sort_order**: Sort order (asc or desc)
    """
    try:
        result = await circulation_service.get_circulation_records(
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            user_type=user_type,
            due_date_filter=due_date_filter,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch circulation records: {str(e)}"
        )


@router.get("/stats", response_model=CirculationStatsResponse, summary="Get circulation statistics")
async def get_circulation_stats(circulation_service: CirculationService = Depends(get_circulation_service)):
    """
    Get circulation statistics including:
    - Active issues
    - Overdue books
    - Returned today
    - Reserved books
    - Total fines
    - Total fines paid
    - Average borrow duration
    - Most borrowed books
    - Most active users
    """
    try:
        stats = await circulation_service.get_circulation_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch circulation stats: {str(e)}"
        )


@router.get("/export", summary="Export circulation records to CSV")
async def export_circulation_records(
    search: Optional[str] = Query(None, description="Search by user name, book title"),
    status: Optional[str] = Query(None, description="Filter by status"),
    user_type: Optional[str] = Query(None, description="Filter by user type"),
    due_date_filter: Optional[str] = Query(None, description="Filter by due date"),
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Export circulation records to CSV file with optional filtering
    """
    try:
        # Get all records with filters (no pagination)
        result = await circulation_service.get_circulation_records(
            page=1,
            page_size=10000,  # Large number to get all records
            search=search,
            status=status,
            user_type=user_type,
            due_date_filter=due_date_filter,
            sort_by="issue_date",
            sort_order="desc"
        )

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            'ID', 'User Name', 'User Role', 'Book Title', 'Category',
            'Shelf Location', 'Issue Date', 'Due Date', 'Return Date',
            'Status', 'Days Left/Overdue', 'Book Condition', 'Fine Amount (OMR)',
            'Fine Paid', 'Notes'
        ])

        # Write data
        for record in result['items']:
            writer.writerow([
                record['id'],
                record['user_name'],
                record['user_role'],
                record['book_title'],
                record.get('category', ''),
                record.get('shelf_location', ''),
                record['issue_date'],
                record['due_date'],
                record.get('return_date', ''),
                record['status'],
                f"{record['days_left']} days" if record['days_left'] >= 0 else f"{abs(record['days_left'])} days overdue",
                record.get('book_condition', ''),
                record.get('fine_amount', 0),
                'Yes' if record.get('fine_paid') else 'No',
                record.get('notes', '')
            ])

        # Return CSV response
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=circulation_records_export.csv"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export circulation records: {str(e)}"
        )


@router.get("/{record_id}", response_model=CirculationDetailResponse, summary="Get circulation record by ID")
async def get_circulation_record(
    record_id: str,
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Get single circulation record by ID with detailed information
    """
    try:
        record = await circulation_service.get_circulation_record(record_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circulation record not found"
            )
        return record
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch circulation record: {str(e)}"
        )


@router.post("", response_model=CirculationResponse, status_code=status.HTTP_201_CREATED, summary="Issue a book")
async def issue_book(
    circulation_data: CirculationCreate,
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Issue a book to a user (create new circulation record)

    - **user_id**: User UUID
    - **book_id**: Book UUID
    - **issue_date**: Issue date (defaults to today)
    - **due_date**: Due date (typically 15 days from issue)
    - **send_email**: Send email notification (default: false)
    - **print_receipt**: Print receipt (default: false)
    - **notes**: Optional notes
    """
    try:
        record = await circulation_service.issue_book(circulation_data.dict())
        return record
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User or book not found"
            )
        if "already borrowed" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Book is already borrowed"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to issue book: {error_msg}"
        )


@router.post("/{record_id}/return", response_model=CirculationResponse, summary="Return a book")
async def return_book(
    record_id: str,
    return_data: CirculationReturn,
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Process book return

    - **return_date**: Return date (defaults to today)
    - **book_condition**: Book condition (good, fair, damaged)
    - **notes**: Optional notes about condition or issues
    """
    try:
        record = await circulation_service.return_book(record_id, return_data.dict())
        return record
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circulation record not found"
            )
        if "already returned" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Book has already been returned"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process return: {error_msg}"
        )


@router.patch("/{record_id}", response_model=CirculationResponse, summary="Update circulation record")
async def update_circulation_record(
    record_id: str,
    update_data: CirculationUpdate,
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Update existing circulation record

    All fields are optional - only provided fields will be updated
    """
    try:
        # Filter out None values
        data = {k: v for k, v in update_data.dict().items() if v is not None}

        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        record = await circulation_service.update_circulation_record(record_id, data)
        return record
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circulation record not found"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update circulation record: {error_msg}"
        )


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete circulation record")
async def delete_circulation_record(
    record_id: str,
    circulation_service: CirculationService = Depends(get_circulation_service)
):
    """
    Delete circulation record by ID
    """
    try:
        await circulation_service.delete_circulation_record(record_id)
        return None
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Circulation record not found"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete circulation record: {error_msg}"
        )
