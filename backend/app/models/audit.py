"""
Audit Log Models

Pydantic models for audit logging and compliance tracking
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class AuditAction(str, Enum):
    """Audit action types"""
    # Authentication
    LOGIN = "login"
    LOGOUT = "logout"
    PASSWORD_CHANGE = "password_change"
    PASSWORD_RESET = "password_reset"

    # User Management
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    USER_VIEW = "user_view"
    USER_STATUS_CHANGE = "user_status_change"

    # Book Management
    BOOK_CREATE = "book_create"
    BOOK_UPDATE = "book_update"
    BOOK_DELETE = "book_delete"
    BOOK_VIEW = "book_view"
    BOOK_BULK_UPDATE = "book_bulk_update"
    BOOK_BULK_DELETE = "book_bulk_delete"

    # Circulation
    CIRCULATION_CHECKOUT = "circulation_checkout"
    CIRCULATION_CHECKIN = "circulation_checkin"
    CIRCULATION_RENEW = "circulation_renew"
    CIRCULATION_RESERVATION = "circulation_reservation"

    # Barcode Operations
    BARCODE_GENERATE = "barcode_generate"
    BARCODE_PRINT = "barcode_print"
    BARCODE_SCAN = "barcode_scan"

    # Category Management
    CATEGORY_CREATE = "category_create"
    CATEGORY_UPDATE = "category_update"
    CATEGORY_DELETE = "category_delete"

    # Settings
    SETTINGS_UPDATE = "settings_update"
    SETTINGS_VIEW = "settings_view"

    # Reports
    REPORT_GENERATE = "report_generate"
    REPORT_EXPORT = "report_export"
    REPORT_VIEW = "report_view"

    # System
    SYSTEM_BACKUP = "system_backup"
    SYSTEM_RESTORE = "system_restore"
    DATABASE_EXPORT = "database_export"

    # Session Tracking
    SESSION_START = "session_start"
    SESSION_END = "session_end"


class AuditResourceType(str, Enum):
    """Types of resources being audited"""
    USER = "user"
    BOOK = "book"
    CATEGORY = "category"
    CIRCULATION = "circulation"
    RESERVATION = "reservation"
    FINE = "fine"
    SETTING = "setting"
    REPORT = "report"
    SESSION = "session"
    SYSTEM = "system"
    BARCODE = "barcode"


class AuditLogBase(BaseModel):
    """Base audit log data"""
    user_id: Optional[UUID] = None
    action: AuditAction
    resource_type: AuditResourceType
    resource_id: Optional[UUID] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    status: str = "success"  # success, failure, error
    error_message: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    """Audit log creation model"""
    pass


class AuditLogResponse(AuditLogBase):
    """Audit log response model"""
    id: UUID
    created_at: datetime

    # Enriched fields
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    resource_name: Optional[str] = None

    class Config:
        from_attributes = True


class AuditLogFilters(BaseModel):
    """Filters for audit log queries"""
    user_id: Optional[UUID] = None
    action: Optional[AuditAction] = None
    resource_type: Optional[AuditResourceType] = None
    resource_id: Optional[UUID] = None
    status: Optional[str] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    ip_address: Optional[str] = None
    search: Optional[str] = None  # Search in details, user_agent, etc.

    # Pagination
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=100)

    # Sorting
    sort_by: str = "created_at"
    sort_order: str = "desc"  # asc or desc


class AuditLogListResponse(BaseModel):
    """Paginated audit log response"""
    items: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AuditStatistics(BaseModel):
    """Audit statistics for dashboard"""
    total_events: int
    events_today: int
    events_this_week: int
    events_this_month: int

    # By action type
    by_action: Dict[str, int]

    # By resource type
    by_resource: Dict[str, int]

    # By status
    by_status: Dict[str, int]

    # By user (top 10)
    top_users: List[Dict[str, Any]]

    # Recent failed actions
    recent_failures: List[AuditLogResponse]

    # User sessions
    active_sessions: int
    total_sessions_today: int


class SessionInfo(BaseModel):
    """User session information"""
    user_id: UUID
    user_name: str
    user_email: str
    session_start: datetime
    last_activity: datetime
    duration_minutes: int
    ip_address: str
    user_agent: str
    actions_count: int


class UserActivityReport(BaseModel):
    """Detailed user activity report"""
    user_id: UUID
    user_name: str
    user_email: str

    # Time range
    from_date: datetime
    to_date: datetime

    # Activity summary
    total_actions: int
    login_count: int
    last_login: Optional[datetime]

    # Actions breakdown
    actions_by_type: Dict[str, int]
    actions_by_day: List[Dict[str, Any]]

    # Resources accessed
    books_viewed: int
    books_modified: int
    users_viewed: int
    users_modified: int

    # Session info
    total_session_time: int  # minutes
    average_session_time: int  # minutes

    # Recent activities
    recent_actions: List[AuditLogResponse]


class SystemActivityReport(BaseModel):
    """System-wide activity report"""
    from_date: datetime
    to_date: datetime

    # Overall stats
    total_events: int
    unique_users: int
    total_sessions: int

    # Daily breakdown
    events_by_day: List[Dict[str, Any]]

    # Actions breakdown
    actions_breakdown: Dict[str, int]

    # Resource breakdown
    resources_breakdown: Dict[str, int]

    # Peak hours
    peak_hours: List[Dict[str, Any]]

    # Top users
    most_active_users: List[Dict[str, Any]]

    # Security events
    failed_logins: int
    security_events: List[AuditLogResponse]


class AuditExportRequest(BaseModel):
    """Request model for audit log export"""
    filters: AuditLogFilters
    format: str = "csv"  # csv, excel, pdf
    include_details: bool = True
    columns: Optional[List[str]] = None
