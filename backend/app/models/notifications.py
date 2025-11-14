"""
Notification Models
Models for email and system notifications
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID


class NotificationType(str, Enum):
    """Types of notifications"""
    EMAIL = "email"
    SYSTEM = "system"
    PUSH = "push"


class NotificationPriority(str, Enum):
    """Priority levels for notifications"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class NotificationTemplate(str, Enum):
    """Pre-defined notification templates"""
    WELCOME = "welcome"
    OVERDUE_ITEM = "overdue_item"
    RESERVATION_READY = "reservation_ready"
    DUE_SOON = "due_soon"
    FINE_NOTICE = "fine_notice"
    PASSWORD_RESET = "password_reset"
    ACCOUNT_CREATED = "account_created"
    INSPECTION_DUE = "inspection_due"
    RESTORATION_URGENT = "restoration_urgent"
    SYSTEM_MAINTENANCE = "system_maintenance"


class EmailNotification(BaseModel):
    """Email notification request"""
    to: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(..., min_length=1, max_length=200, description="Email subject")
    body: str = Field(..., min_length=1, description="Email body (HTML or plain text)")
    cc: Optional[List[EmailStr]] = Field(None, description="CC recipients")
    bcc: Optional[List[EmailStr]] = Field(None, description="BCC recipients")
    template: Optional[NotificationTemplate] = Field(None, description="Use pre-defined template")
    template_data: Optional[Dict[str, Any]] = Field(None, description="Data for template rendering")
    priority: NotificationPriority = NotificationPriority.NORMAL
    scheduled_at: Optional[datetime] = Field(None, description="Schedule for later sending")

    class Config:
        json_schema_extra = {
            "example": {
                "to": "patron@library.om",
                "subject": "Book Due Soon",
                "body": "<p>Your book 'Historic Manuscript' is due in 3 days.</p>",
                "template": "due_soon",
                "template_data": {
                    "book_title": "Historic Manuscript",
                    "due_date": "2024-11-17",
                    "patron_name": "Ahmed Al-Balushi"
                },
                "priority": "normal"
            }
        }


class BulkEmailNotification(BaseModel):
    """Bulk email notification request"""
    recipients: List[EmailStr] = Field(..., min_items=1, max_items=100)
    subject: str
    body: str
    template: Optional[NotificationTemplate] = None
    template_data: Optional[Dict[str, Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "recipients": ["patron1@library.om", "patron2@library.om"],
                "subject": "Library System Maintenance",
                "body": "The library system will be unavailable on Sunday.",
                "template": "system_maintenance"
            }
        }


class NotificationResponse(BaseModel):
    """Response after sending notification"""
    success: bool
    message: str
    notification_id: Optional[UUID] = None
    sent_at: Optional[datetime] = None
    error: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "message": "Email sent successfully",
                "notification_id": "123e4567-e89b-12d3-a456-426614174000",
                "sent_at": "2024-11-14T10:00:00Z"
            }
        }


class BulkNotificationResponse(BaseModel):
    """Response after sending bulk notifications"""
    total_requested: int
    successful: int
    failed: int
    results: List[Dict[str, Any]]
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "total_requested": 10,
                "successful": 9,
                "failed": 1,
                "results": [
                    {"email": "patron1@library.om", "status": "success"},
                    {"email": "patron2@library.om", "status": "failed", "error": "Invalid email"}
                ],
                "message": "Sent 9 of 10 emails successfully"
            }
        }


class NotificationSettings(BaseModel):
    """Notification configuration settings"""
    email_enabled: bool = True
    smtp_host: str = Field(..., description="SMTP server hostname")
    smtp_port: int = Field(587, ge=1, le=65535)
    smtp_username: str
    smtp_password: str = Field(..., description="SMTP password (encrypted)")
    smtp_use_tls: bool = True
    from_email: EmailStr
    from_name: str = "NAWRA Library"
    max_retries: int = Field(3, ge=0, le=10)
    retry_delay: int = Field(60, ge=0, description="Retry delay in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "email_enabled": True,
                "smtp_host": "smtp.gmail.com",
                "smtp_port": 587,
                "smtp_username": "noreply@library.om",
                "smtp_password": "********",
                "smtp_use_tls": True,
                "from_email": "noreply@library.om",
                "from_name": "NAWRA Library",
                "max_retries": 3,
                "retry_delay": 60
            }
        }


class NotificationStatistics(BaseModel):
    """Notification statistics"""
    total_sent: int
    successful: int
    failed: int
    pending: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]
    recent_notifications: List[Dict[str, Any]]

    class Config:
        json_schema_extra = {
            "example": {
                "total_sent": 1000,
                "successful": 950,
                "failed": 50,
                "pending": 10,
                "by_type": {"email": 900, "system": 100},
                "by_priority": {"normal": 800, "high": 150, "urgent": 50},
                "recent_notifications": []
            }
        }


class OverdueNotificationRequest(BaseModel):
    """Request to send overdue notifications"""
    send_immediately: bool = True
    dry_run: bool = Field(False, description="Preview without sending")

    class Config:
        json_schema_extra = {
            "example": {
                "send_immediately": True,
                "dry_run": False
            }
        }


class DueSoonNotificationRequest(BaseModel):
    """Request to send due soon reminders"""
    days_before: int = Field(3, ge=1, le=30, description="Days before due date")
    send_immediately: bool = True
    dry_run: bool = False

    class Config:
        json_schema_extra = {
            "example": {
                "days_before": 3,
                "send_immediately": True,
                "dry_run": False
            }
        }
