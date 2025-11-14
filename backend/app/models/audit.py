"""
Audit Log Models
Models for activity tracking and audit trail
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from enum import Enum
from uuid import UUID


class AuditAction(str, Enum):
    """Types of auditable actions"""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    ACCESS = "ACCESS"
    EXPORT = "EXPORT"
    IMPORT = "IMPORT"
    GENERATE = "GENERATE"
    SCAN = "SCAN"
    CHECKOUT = "CHECKOUT"
    CHECKIN = "CHECKIN"
    RESERVE = "RESERVE"
    RENEW = "RENEW"


class AuditEntityType(str, Enum):
    """Types of entities that can be audited"""
    BOOK = "books"
    USER = "users"
    CIRCULATION = "circulation"
    PRESERVATION = "preservation"
    BARCODE = "barcode"
    CATEGORY = "categories"
    SETTINGS = "settings"
    REPORT = "reports"
    SYSTEM = "system"


class AuditStatus(str, Enum):
    """Status of the audited action"""
    SUCCESS = "success"
    FAILURE = "failure"
    WARNING = "warning"


class AuditLogBase(BaseModel):
    """Base audit log fields"""
    user_id: Optional[UUID] = None
    action: AuditAction
    entity_type: AuditEntityType
    entity_id: Optional[UUID] = None
    entity_name: Optional[str] = None
    description: str
    changes: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = {}
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    request_method: Optional[str] = None
    request_path: Optional[str] = None
    status: AuditStatus = AuditStatus.SUCCESS
    error_message: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    """Schema for creating audit log entry"""
    pass

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "action": "UPDATE",
                "entity_type": "books",
                "entity_id": "123e4567-e89b-12d3-a456-426614174001",
                "entity_name": "Historic Manuscript",
                "description": "Updated book metadata",
                "changes": {
                    "title": {"old": "Old Title", "new": "New Title"}
                },
                "status": "success"
            }
        }


class AuditLogResponse(AuditLogBase):
    """Schema for audit log response"""
    id: UUID
    username: Optional[str] = None
    user_role: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174002",
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "username": "admin@ministry.om",
                "user_role": "administrator",
                "action": "UPDATE",
                "entity_type": "books",
                "entity_id": "123e4567-e89b-12d3-a456-426614174001",
                "entity_name": "Historic Manuscript",
                "description": "Updated book metadata",
                "status": "success",
                "created_at": "2024-11-14T10:00:00Z"
            }
        }


class AuditLogFilters(BaseModel):
    """Filters for querying audit logs"""
    user_id: Optional[UUID] = None
    action: Optional[AuditAction] = None
    entity_type: Optional[AuditEntityType] = None
    entity_id: Optional[UUID] = None
    status: Optional[AuditStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class AuditLogListResponse(BaseModel):
    """Paginated list of audit logs"""
    data: List[AuditLogResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ActivitySummary(BaseModel):
    """Summary of activities by type"""
    action: str
    entity_type: str
    count: int


class AuditStatistics(BaseModel):
    """Audit log statistics"""
    total_activities: int
    activities_by_action: Dict[str, int]
    activities_by_entity: Dict[str, int]
    activities_by_user: List[Dict[str, Any]]  # Top users by activity
    recent_activities: List[AuditLogResponse]
    activity_summary: List[ActivitySummary]

    class Config:
        json_schema_extra = {
            "example": {
                "total_activities": 1500,
                "activities_by_action": {
                    "CREATE": 500,
                    "UPDATE": 600,
                    "DELETE": 50,
                    "LOGIN": 350
                },
                "activities_by_entity": {
                    "books": 800,
                    "users": 400,
                    "circulation": 300
                },
                "activities_by_user": [
                    {"user_id": "...", "username": "admin@ministry.om", "count": 250},
                    {"user_id": "...", "username": "librarian@ministry.om", "count": 180}
                ],
                "recent_activities": [],
                "activity_summary": []
            }
        }


class UserActivity(BaseModel):
    """User activity over time"""
    date: date
    action_count: int


class UserActivityReport(BaseModel):
    """Detailed user activity report"""
    user_id: UUID
    username: str
    total_actions: int
    actions_by_type: Dict[str, int]
    daily_activity: List[UserActivity]
    recent_actions: List[AuditLogResponse]
