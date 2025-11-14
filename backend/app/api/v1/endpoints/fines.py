"""
Fines Management API Endpoints.
Phase 3 - Enhanced Features (Day 14)
"""
from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from uuid import UUID
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.fines import (
    FineCreate, FineUpdate, FineWaiver, FineResponse, FineListResponse,
    FineStatistics, FineFilters, FineCalculationRequest, FineCalculationResponse,
    PaymentCreate, PaymentResponse,
    FineType, FineStatus,
)
from ....services.fines_service import FinesService

router = APIRouter()


# =====================================================
# Fine Endpoints
# =====================================================

@router.post("", response_model=FineResponse, status_code=status.HTTP_201_CREATED)
async def create_fine(
    fine: FineCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a new fine."""
    service = FinesService(supabase)
    return await service.create_fine(fine, current_user['id'])


@router.get("/statistics", response_model=FineStatistics)
async def get_fine_statistics(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get fine statistics and metrics."""
    service = FinesService(supabase)
    return await service.get_statistics()


@router.post("/calculate", response_model=FineCalculationResponse)
async def calculate_fine(
    request: FineCalculationRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Calculate fine amount for a circulation."""
    service = FinesService(supabase)
    return await service.calculate_fine(request)


@router.get("/{fine_id}", response_model=FineResponse)
async def get_fine(
    fine_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get fine details by ID."""
    service = FinesService(supabase)
    return await service.get_fine(fine_id)


@router.get("", response_model=FineListResponse)
async def list_fines(
    user_id: Optional[UUID] = None,
    book_id: Optional[UUID] = None,
    circulation_id: Optional[UUID] = None,
    fine_type: Optional[FineType] = None,
    status: Optional[FineStatus] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    assessed_from: Optional[str] = None,
    assessed_to: Optional[str] = None,
    overdue_only: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("assessed_date"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """List fines with filters and pagination."""
    from datetime import date
    service = FinesService(supabase)
    filters = FineFilters(
        user_id=user_id,
        book_id=book_id,
        circulation_id=circulation_id,
        fine_type=fine_type,
        status=status,
        min_amount=min_amount,
        max_amount=max_amount,
        assessed_from=date.fromisoformat(assessed_from) if assessed_from else None,
        assessed_to=date.fromisoformat(assessed_to) if assessed_to else None,
        overdue_only=overdue_only,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    return await service.list_fines(filters)


@router.patch("/{fine_id}", response_model=FineResponse)
async def update_fine(
    fine_id: UUID,
    update: FineUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Update fine details."""
    service = FinesService(supabase)
    return await service.update_fine(fine_id, update)


@router.post("/{fine_id}/waive", response_model=FineResponse)
async def waive_fine(
    fine_id: UUID,
    waiver: FineWaiver,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Waive part or all of a fine."""
    service = FinesService(supabase)
    return await service.waive_fine(fine_id, waiver, current_user['id'])


@router.delete("/{fine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_fine(
    fine_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Delete a fine (only if unpaid)."""
    service = FinesService(supabase)
    await service.delete_fine(fine_id)


# =====================================================
# Payment Endpoints
# =====================================================

@router.post("/{fine_id}/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    fine_id: UUID,
    payment: PaymentCreate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Create a payment for a fine."""
    # Ensure payment.fine_id matches path parameter
    payment.fine_id = fine_id
    service = FinesService(supabase)
    return await service.create_payment(payment, current_user['id'])


@router.get("/payments/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """Get payment details by ID."""
    service = FinesService(supabase)
    return await service.get_payment(payment_id)
