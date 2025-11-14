"""
Audit Log API Endpoints
RESTful API for audit logging and activity tracking
"""

from fastapi import APIRouter, Depends, Query, status
from typing import Optional
from uuid import UUID
from datetime import datetime
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.audit import (
    AuditLogResponse,
    AuditLogFilters,
    AuditLogListResponse,
    AuditStatistics,
    UserActivityReport,
    AuditAction,
    AuditEntityType,
    AuditStatus,
)
from ....services.audit_service import AuditService

router = APIRouter()


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="List Audit Logs",
    description="List all audit logs with optional filtering and pagination"
)
async def list_audit_logs(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    entity_type: Optional[AuditEntityType] = Query(None, description="Filter by entity type"),
    entity_id: Optional[str] = Query(None, description="Filter by entity ID"),
    status_param: Optional[AuditStatus] = Query(None, alias="status", description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Retrieve audit logs with comprehensive filtering options:
    - **user_id**: Filter by specific user
    - **action**: Filter by action type (CREATE, UPDATE, DELETE, etc.)
    - **entity_type**: Filter by entity (books, users, etc.)
    - **entity_id**: Filter by specific entity
    - **status**: Filter by status (success, failure, warning)
    - **start_date/end_date**: Filter by date range
    """
    filters = AuditLogFilters(
        user_id=UUID(user_id) if user_id else None,
        action=action,
        entity_type=entity_type,
        entity_id=UUID(entity_id) if entity_id else None,
        status=status_param,
        start_date=start_date,
        end_date=end_date,
        page=page,
        page_size=page_size
    )

    service = AuditService(supabase)
    return await service.list_audit_logs(filters)


@router.get(
    "/{log_id}",
    response_model=AuditLogResponse,
    summary="Get Audit Log",
    description="Retrieve a specific audit log entry by ID"
)
async def get_audit_log(
    log_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get detailed information about a specific audit log entry.
    """
    service = AuditService(supabase)
    return await service.get_audit_log(log_id)


@router.get(
    "/statistics/summary",
    response_model=AuditStatistics,
    summary="Get Audit Statistics",
    description="Get comprehensive audit log statistics"
)
async def get_audit_statistics(
    days: int = Query(7, ge=1, le=365, description="Number of days to include"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get comprehensive audit log statistics including:
    - Total activities count
    - Activities by action type
    - Activities by entity type
    - Top users by activity
    - Recent activities
    - Activity summary
    """
    service = AuditService(supabase)
    return await service.get_audit_statistics(days)


@router.get(
    "/user/{user_id}/report",
    response_model=UserActivityReport,
    summary="Get User Activity Report",
    description="Get detailed activity report for a specific user"
)
async def get_user_activity_report(
    user_id: UUID,
    days: int = Query(30, ge=1, le=365, description="Number of days to include"),
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Generate a comprehensive activity report for a specific user including:
    - Total actions performed
    - Breakdown by action type
    - Daily activity chart data
    - Recent actions list

    Useful for:
    - User activity monitoring
    - Compliance and auditing
    - Performance tracking
    """
    service = AuditService(supabase)
    return await service.get_user_activity_report(user_id, days)
