"""
Settings models for user preferences and configuration.
"""
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class GeneralSettings(BaseModel):
    """General user preferences."""
    display_name: Optional[str] = Field(None, max_length=255)
    language: str = Field(default="en", pattern="^(en|ar)$")
    date_format: str = Field(default="DD/MM/YYYY")
    time_format: str = Field(default="24h", pattern="^(12h|24h)$")
    default_landing_page: str = Field(default="dashboard")
    items_per_page: int = Field(default=12, ge=10, le=100)
    default_view_mode: str = Field(default="grid", pattern="^(grid|list|table)$")


class AppearanceSettings(BaseModel):
    """Appearance and UI preferences."""
    theme: str = Field(default="light", pattern="^(light|dark|auto)$")
    interface_density: str = Field(default="default", pattern="^(compact|default|comfortable)$")
    font_size: str = Field(default="medium", pattern="^(small|medium|large|extra-large)$")
    animation_speed: str = Field(default="default", pattern="^(none|reduced|default|fast)$")
    show_breadcrumbs: bool = Field(default=True)


class EmailNotificationSettings(BaseModel):
    """Email notification preferences."""
    system_announcements: bool = Field(default=True)
    due_date_reminders: bool = Field(default=True)
    overdue_notifications: bool = Field(default=True)
    new_circulation_requests: bool = Field(default=True)
    user_registration: bool = Field(default=False)
    daily_digest: bool = Field(default=False)
    digest_time: str = Field(default="09:00")


class InAppNotificationSettings(BaseModel):
    """In-app notification preferences."""
    enabled: bool = Field(default=True)
    sound: bool = Field(default=True)
    badge_counters: bool = Field(default=True)
    position: str = Field(default="top-right", pattern="^(top-right|top-center|bottom-right)$")
    auto_dismiss_time: int = Field(default=5, ge=3, le=30)


class NotificationSettings(BaseModel):
    """Notification preferences."""
    email: EmailNotificationSettings = Field(default_factory=EmailNotificationSettings)
    in_app: InAppNotificationSettings = Field(default_factory=InAppNotificationSettings)


class SecuritySettings(BaseModel):
    """Security preferences."""
    two_factor_enabled: bool = Field(default=False)
    session_timeout: int = Field(default=3600, ge=900, le=86400)  # 15 min to 24 hours
    last_password_change: Optional[datetime] = None


class SettingsBase(BaseModel):
    """Base settings model."""
    general: GeneralSettings = Field(default_factory=GeneralSettings)
    appearance: AppearanceSettings = Field(default_factory=AppearanceSettings)
    notifications: NotificationSettings = Field(default_factory=NotificationSettings)
    security: SecuritySettings = Field(default_factory=SecuritySettings)


class SettingsUpdate(BaseModel):
    """Settings update model - all fields optional for partial updates."""
    general: Optional[GeneralSettings] = None
    appearance: Optional[AppearanceSettings] = None
    notifications: Optional[NotificationSettings] = None
    security: Optional[SecuritySettings] = None


class SettingsResponse(SettingsBase):
    """Settings response model."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SettingsResetRequest(BaseModel):
    """Request to reset settings."""
    section: str = Field(default="all", pattern="^(all|general|appearance|notifications|security)$")
