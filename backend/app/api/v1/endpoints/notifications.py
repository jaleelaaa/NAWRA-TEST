"""
Notifications API Endpoints
RESTful API for email and system notifications
"""

from fastapi import APIRouter, Depends, status
from typing import Optional
from uuid import UUID
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.notifications import (
    EmailNotification,
    BulkEmailNotification,
    NotificationResponse,
    BulkNotificationResponse,
    NotificationStatistics,
    OverdueNotificationRequest,
    DueSoonNotificationRequest,
)
from ....services.notification_service import NotificationService

router = APIRouter()


@router.post(
    "/email",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Send Email Notification",
    description="Send a single email notification"
)
async def send_email_notification(
    notification: EmailNotification,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Send an email notification to a single recipient.

    Features:
    - **Template support**: Use pre-defined templates or custom HTML
    - **Priority levels**: Set priority (low, normal, high, urgent)
    - **Scheduling**: Schedule for later delivery (optional)
    - **CC/BCC**: Add carbon copy recipients

    Note: In development, emails are logged instead of sent.
    Configure SMTP settings for production use.
    """
    service = NotificationService(supabase)
    return await service.send_email(notification, current_user['id'])


@router.post(
    "/email/bulk",
    response_model=BulkNotificationResponse,
    summary="Send Bulk Email Notifications",
    description="Send email notifications to multiple recipients"
)
async def send_bulk_email_notification(
    notification: BulkEmailNotification,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Send the same email to multiple recipients (up to 100 per request).
    Returns success/failure status for each recipient.

    Use cases:
    - System announcements
    - Maintenance notices
    - Newsletter distribution
    """
    service = NotificationService(supabase)
    return await service.send_bulk_email(notification, current_user['id'])


@router.post(
    "/overdue",
    response_model=BulkNotificationResponse,
    summary="Send Overdue Notifications",
    description="Send notifications for all overdue items"
)
async def send_overdue_notifications(
    request: OverdueNotificationRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Automatically send overdue notifications to all patrons with overdue items.

    Options:
    - **send_immediately**: Send now or queue for later
    - **dry_run**: Preview recipients without sending

    Returns count of notifications sent and any failures.
    """
    service = NotificationService(supabase)
    return await service.send_overdue_notifications(request, current_user['id'])


@router.post(
    "/due-soon",
    response_model=BulkNotificationResponse,
    summary="Send Due Soon Reminders",
    description="Send reminders for items due soon"
)
async def send_due_soon_notifications(
    request: DueSoonNotificationRequest,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Send reminder notifications for items due soon.

    Configuration:
    - **days_before**: How many days before due date to send (1-30)
    - **send_immediately**: Send now or schedule
    - **dry_run**: Preview without sending

    Typical use: Run daily as scheduled task with days_before=3
    """
    service = NotificationService(supabase)
    return await service.send_due_soon_notifications(request, current_user['id'])


@router.post(
    "/inspection-due",
    response_model=BulkNotificationResponse,
    summary="Send Preservation Inspection Reminders",
    description="Send notifications for preservation inspections due"
)
async def send_inspection_notifications(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Send notifications to preservation staff for items requiring inspection.

    Automatically finds:
    - Items with inspections due within the next 7 days
    - Overdue inspections

    Notifies appropriate staff members.
    """
    service = NotificationService(supabase)
    return await service.send_inspection_due_notifications()


@router.get(
    "/statistics",
    response_model=NotificationStatistics,
    summary="Get Notification Statistics",
    description="Retrieve notification usage statistics"
)
async def get_notification_statistics(
    days: int = 30,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get comprehensive notification statistics including:
    - Total notifications sent
    - Success/failure rates
    - Breakdown by type and priority
    - Recent notifications list

    Useful for monitoring notification system health and usage.
    """
    service = NotificationService(supabase)
    return await service.get_notification_statistics(days)
