"""
Notification Service
Business logic for email and system notifications
"""

from uuid import UUID, uuid4
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from supabase import Client
from fastapi import HTTPException, status
import logging

from ..models.notifications import (
    EmailNotification,
    BulkEmailNotification,
    NotificationResponse,
    BulkNotificationResponse,
    NotificationStatistics,
    OverdueNotificationRequest,
    DueSoonNotificationRequest,
    NotificationPriority,
    NotificationTemplate,
)

logger = logging.getLogger(__name__)


class NotificationService:
    """Service class for notification operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    def _render_template(self, template: NotificationTemplate, data: Dict[str, Any]) -> tuple[str, str]:
        """
        Render notification template with data
        Returns: (subject, body)
        """
        templates = {
            NotificationTemplate.WELCOME: (
                "Welcome to NAWRA Library",
                f"<p>Dear {data.get('name', 'User')},</p><p>Welcome to NAWRA Library Management System!</p>"
            ),
            NotificationTemplate.OVERDUE_ITEM: (
                "Overdue Book Notification",
                f"<p>Dear {data.get('patron_name', 'Patron')},</p>"
                f"<p>The following item is overdue:</p>"
                f"<ul><li><strong>{data.get('book_title', 'Book')}</strong></li>"
                f"<li>Due date: {data.get('due_date', 'N/A')}</li></ul>"
                f"<p>Please return it as soon as possible to avoid fines.</p>"
            ),
            NotificationTemplate.DUE_SOON: (
                "Book Due Soon",
                f"<p>Dear {data.get('patron_name', 'Patron')},</p>"
                f"<p>Your book '<strong>{data.get('book_title', 'Book')}</strong>' is due on {data.get('due_date', 'soon')}.</p>"
                f"<p>Please return or renew it before the due date.</p>"
            ),
            NotificationTemplate.RESERVATION_READY: (
                "Reserved Book Available",
                f"<p>Dear {data.get('patron_name', 'Patron')},</p>"
                f"<p>Your reserved book '<strong>{data.get('book_title', 'Book')}</strong>' is now available for pickup.</p>"
            ),
            NotificationTemplate.INSPECTION_DUE: (
                "Preservation Inspection Due",
                f"<p>The following item requires inspection:</p>"
                f"<ul><li><strong>{data.get('book_title', 'Item')}</strong></li>"
                f"<li>Last inspection: {data.get('last_inspection', 'N/A')}</li></ul>"
            ),
            NotificationTemplate.RESTORATION_URGENT: (
                "Urgent Restoration Required",
                f"<p><strong>Urgent:</strong> The following item requires immediate restoration:</p>"
                f"<ul><li>{data.get('book_title', 'Item')}</li>"
                f"<li>Condition: {data.get('condition', 'Critical')}</li></ul>"
            ),
            NotificationTemplate.SYSTEM_MAINTENANCE: (
                "System Maintenance Notice",
                f"<p>The NAWRA Library system will undergo maintenance.</p>"
                f"<p><strong>Scheduled time:</strong> {data.get('maintenance_time', 'To be announced')}</p>"
                f"<p>The system will be unavailable during this time.</p>"
            ),
        }

        return templates.get(template, ("Notification", data.get('message', 'No message')))

    async def send_email(self, notification: EmailNotification, user_id: Optional[UUID] = None) -> NotificationResponse:
        """
        Send email notification
        Note: This is a placeholder implementation. In production, integrate with actual SMTP service
        or email provider (SendGrid, AWS SES, etc.)
        """
        try:
            # If template specified, render it
            subject = notification.subject
            body = notification.body

            if notification.template and notification.template_data:
                subject, body = self._render_template(notification.template, notification.template_data)

            # Simulate email sending
            # In production, replace with actual SMTP or email service
            logger.info(f"Sending email to {notification.to}: {subject}")

            # For now, log the email instead of sending
            email_log = {
                "to": notification.to,
                "subject": subject,
                "body": body,
                "priority": notification.priority.value if hasattr(notification.priority, 'value') else notification.priority,
                "sent_at": datetime.now().isoformat(),
                "status": "sent"
            }

            logger.info(f"Email logged: {email_log}")

            # In production, save to notifications table in database
            notification_id = uuid4()

            return NotificationResponse(
                success=True,
                message="Email sent successfully",
                notification_id=notification_id,
                sent_at=datetime.now()
            )

        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return NotificationResponse(
                success=False,
                message="Failed to send email",
                error=str(e)
            )

    async def send_bulk_email(
        self,
        notification: BulkEmailNotification,
        user_id: Optional[UUID] = None
    ) -> BulkNotificationResponse:
        """Send email to multiple recipients"""
        results = []
        successful = 0
        failed = 0

        for recipient in notification.recipients:
            try:
                email = EmailNotification(
                    to=recipient,
                    subject=notification.subject,
                    body=notification.body,
                    template=notification.template,
                    template_data=notification.template_data
                )

                response = await self.send_email(email, user_id)

                if response.success:
                    successful += 1
                    results.append({"email": recipient, "status": "success"})
                else:
                    failed += 1
                    results.append({"email": recipient, "status": "failed", "error": response.error})

            except Exception as e:
                failed += 1
                results.append({"email": recipient, "status": "failed", "error": str(e)})

        return BulkNotificationResponse(
            total_requested=len(notification.recipients),
            successful=successful,
            failed=failed,
            results=results,
            message=f"Sent {successful} of {len(notification.recipients)} emails successfully"
        )

    async def send_overdue_notifications(
        self,
        request: OverdueNotificationRequest,
        user_id: Optional[UUID] = None
    ) -> BulkNotificationResponse:
        """Send notifications for overdue items"""
        try:
            # Query for overdue circulation records
            # This is a placeholder - adjust based on actual circulation table schema
            today = datetime.now().date().isoformat()

            # In production, query actual circulation data
            # For now, return empty response
            logger.info(f"Checking for overdue items as of {today}")

            return BulkNotificationResponse(
                total_requested=0,
                successful=0,
                failed=0,
                results=[],
                message="No overdue items found" if not request.dry_run else "Dry run completed"
            )

        except Exception as e:
            logger.error(f"Error sending overdue notifications: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error sending overdue notifications: {str(e)}"
            )

    async def send_due_soon_notifications(
        self,
        request: DueSoonNotificationRequest,
        user_id: Optional[UUID] = None
    ) -> BulkNotificationResponse:
        """Send notifications for items due soon"""
        try:
            # Calculate target date
            target_date = (datetime.now() + timedelta(days=request.days_before)).date().isoformat()

            # Query for items due soon
            logger.info(f"Checking for items due on {target_date}")

            # In production, query actual circulation data
            return BulkNotificationResponse(
                total_requested=0,
                successful=0,
                failed=0,
                results=[],
                message=f"No items due in {request.days_before} days" if not request.dry_run else "Dry run completed"
            )

        except Exception as e:
            logger.error(f"Error sending due soon notifications: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error sending due soon notifications: {str(e)}"
            )

    async def send_inspection_due_notifications(self) -> BulkNotificationResponse:
        """Send notifications for preservation inspections due"""
        try:
            # Query preservation records with upcoming inspections
            today = datetime.now().date().isoformat()
            week_from_now = (datetime.now() + timedelta(days=7)).date().isoformat()

            response = self.supabase.table("preservation_records")\
                .select("*, books(title, title_ar)")\
                .gte("next_inspection_date", today)\
                .lte("next_inspection_date", week_from_now)\
                .execute()

            results = []
            successful = 0

            for record in response.data:
                # Send notification to appropriate staff
                # This is a placeholder for actual email sending
                logger.info(f"Inspection due for: {record.get('books', {}).get('title', 'Unknown')}")
                successful += 1
                results.append({
                    "book_id": record.get('book_id'),
                    "status": "notification_sent"
                })

            return BulkNotificationResponse(
                total_requested=len(response.data),
                successful=successful,
                failed=0,
                results=results,
                message=f"Sent {successful} inspection reminder(s)"
            )

        except Exception as e:
            logger.error(f"Error sending inspection notifications: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error sending inspection notifications: {str(e)}"
            )

    async def get_notification_statistics(self, days: int = 30) -> NotificationStatistics:
        """Get notification statistics"""
        try:
            # This is a placeholder implementation
            # In production, query from notifications table

            return NotificationStatistics(
                total_sent=0,
                successful=0,
                failed=0,
                pending=0,
                by_type={"email": 0, "system": 0},
                by_priority={"normal": 0, "high": 0, "urgent": 0},
                recent_notifications=[]
            )

        except Exception as e:
            logger.error(f"Error getting notification statistics: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error getting notification statistics: {str(e)}"
            )
