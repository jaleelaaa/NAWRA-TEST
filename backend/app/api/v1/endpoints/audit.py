"""
Audit Log Management Endpoints

API endpoints for viewing and managing audit logs
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.models.audit import (
    AuditLogResponse,
    AuditLogFilters,
    AuditLogListResponse,
    AuditStatistics,
    AuditAction,
    AuditResourceType,
)
from app.services.audit_service import audit_service


router = APIRouter()


# =====================================================
# Audit Log Query Endpoints
# =====================================================

@router.get(
    "/logs",
    response_model=AuditLogListResponse,
    summary="Get audit logs",
    tags=["Audit"]
)
async def get_audit_logs(
    user_id: Optional[UUID] = Query(None),
    action: Optional[AuditAction] = Query(None),
    resource_type: Optional[AuditResourceType] = Query(None),
    resource_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    ip_address: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
):
    """
    Get audit logs with filtering, pagination, and sorting.

    Query Parameters:
        - user_id: Filter by user ID
        - action: Filter by action type
        - resource_type: Filter by resource type
        - resource_id: Filter by resource ID
        - status: Filter by status (success, failure, error)
        - from_date: Start date (ISO format)
        - to_date: End date (ISO format)
        - ip_address: Filter by IP address
        - search: Search in user_agent and details
        - page: Page number (default: 1)
        - page_size: Items per page (default: 50, max: 100)
        - sort_by: Sort field (default: created_at)
        - sort_order: Sort order (asc/desc, default: desc)

    Returns:
        Paginated list of audit logs

    Raises:
        500: Failed to fetch audit logs
    """
    try:
        filters = AuditLogFilters(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            status=status,
            from_date=from_date,
            to_date=to_date,
            ip_address=ip_address,
            search=search,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        return await audit_service.get_audit_logs(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit logs: {str(e)}"
        )


@router.get(
    "/logs/{log_id}",
    response_model=AuditLogResponse,
    summary="Get audit log by ID",
    tags=["Audit"]
)
async def get_audit_log(log_id: UUID):
    """
    Get a single audit log entry by ID.

    Args:
        log_id: Audit log UUID

    Returns:
        Audit log details

    Raises:
        404: Audit log not found
        500: Failed to fetch audit log
    """
    try:
        log = await audit_service.get_audit_log_by_id(log_id)

        if not log:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audit log not found"
            )

        return log

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit log: {str(e)}"
        )


@router.get(
    "/statistics",
    response_model=AuditStatistics,
    summary="Get audit statistics",
    tags=["Audit", "Statistics"]
)
async def get_audit_statistics(
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
):
    """
    Get comprehensive audit statistics.

    Query Parameters:
        - from_date: Start date for statistics (ISO format)
        - to_date: End date for statistics (ISO format)

    Returns:
        Audit statistics including:
        - Event counts (total, today, this week, this month)
        - Breakdown by action type
        - Breakdown by resource type
        - Breakdown by status
        - Top active users
        - Recent failed actions
        - Active sessions count

    Raises:
        500: Failed to fetch statistics
    """
    try:
        return await audit_service.get_statistics(from_date, to_date)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch audit statistics: {str(e)}"
        )


@router.get(
    "/user/{user_id}/activity",
    response_model=AuditLogListResponse,
    summary="Get user activity logs",
    tags=["Audit", "Users"]
)
async def get_user_activity(
    user_id: UUID,
    from_date: Optional[datetime] = Query(None),
    to_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    """
    Get activity logs for a specific user.

    Args:
        user_id: User UUID

    Query Parameters:
        - from_date: Start date (ISO format)
        - to_date: End date (ISO format)
        - page: Page number
        - page_size: Items per page

    Returns:
        Paginated list of user's audit logs

    Raises:
        500: Failed to fetch user activity
    """
    try:
        filters = AuditLogFilters(
            user_id=user_id,
            from_date=from_date,
            to_date=to_date,
            page=page,
            page_size=page_size,
            sort_by="created_at",
            sort_order="desc",
        )

        return await audit_service.get_audit_logs(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user activity: {str(e)}"
        )


@router.get(
    "/resource/{resource_type}/{resource_id}",
    response_model=AuditLogListResponse,
    summary="Get resource audit trail",
    tags=["Audit"]
)
async def get_resource_audit_trail(
    resource_type: AuditResourceType,
    resource_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
):
    """
    Get complete audit trail for a specific resource.

    Args:
        resource_type: Type of resource (book, user, etc.)
        resource_id: Resource UUID

    Query Parameters:
        - page: Page number
        - page_size: Items per page

    Returns:
        Paginated list of audit logs for the resource

    Raises:
        500: Failed to fetch resource audit trail
    """
    try:
        filters = AuditLogFilters(
            resource_type=resource_type,
            resource_id=resource_id,
            page=page,
            page_size=page_size,
            sort_by="created_at",
            sort_order="desc",
        )

        return await audit_service.get_audit_logs(filters)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch resource audit trail: {str(e)}"
        )


# =====================================================
# Audit Log Management Endpoints
# =====================================================

@router.delete(
    "/logs/cleanup",
    summary="Delete old audit logs",
    tags=["Audit", "Admin"]
)
async def cleanup_old_logs(
    days: int = Query(90, ge=30, le=365)
):
    """
    Delete audit logs older than specified days.

    Query Parameters:
        - days: Number of days to retain (30-365, default: 90)

    Returns:
        Number of deleted logs

    Raises:
        500: Failed to cleanup logs
    """
    try:
        deleted_count = await audit_service.delete_old_logs(days)

        return {
            "message": "Old audit logs deleted successfully",
            "deleted_count": deleted_count,
            "retention_days": days
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cleanup audit logs: {str(e)}"
        )


# =====================================================
# Helper: Manual Audit Log Creation (for testing)
# =====================================================

@router.post(
    "/logs/test",
    summary="Create test audit log",
    tags=["Audit", "Testing"]
)
async def create_test_audit_log(
    action: AuditAction,
    resource_type: AuditResourceType,
    user_id: Optional[UUID] = None,
    resource_id: Optional[UUID] = None,
    request: Request = None,
):
    """
    Create a test audit log entry (for testing purposes).

    Args:
        action: Action type
        resource_type: Resource type
        user_id: Optional user ID
        resource_id: Optional resource ID

    Returns:
        Created audit log

    Raises:
        500: Failed to create audit log
    """
    try:
        ip_address = request.client.host if request else None
        user_agent = request.headers.get("user-agent") if request else None

        log = await audit_service.log_action(
            action=action,
            resource_type=resource_type,
            user_id=user_id,
            resource_id=resource_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={"test": True, "created_via": "api"},
            status="success"
        )

        if log:
            return {
                "message": "Test audit log created successfully",
                "log": log
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create test audit log"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test audit log: {str(e)}"
        )
