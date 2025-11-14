"""
User Pydantic models
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    full_name: str = Field(..., min_length=1, max_length=255)
    arabic_name: Optional[str] = Field(None, max_length=255)
    user_type: str = Field(..., description="User type (Patron, Student, etc.)")
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None


class UserCreate(UserBase):
    """Create user schema"""
    password: str = Field(..., min_length=8, max_length=100)
    role_id: Optional[str] = None
    is_active: bool = Field(default=True)


class UserUpdate(BaseModel):
    """Update user schema"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    arabic_name: Optional[str] = Field(None, max_length=255)
    user_type: Optional[str] = None
    phone: Optional[str] = Field(None, max_length=20)
    address: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserResponse(BaseModel):
    """User response schema"""
    id: UUID
    email: str
    full_name: str
    arabic_name: Optional[str] = None
    user_type: str
    role: str
    is_active: bool
    phone: Optional[str] = None
    address: Optional[str] = None
    last_login: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Paginated user list response"""
    items: List[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserStatsResponse(BaseModel):
    """User statistics response"""
    total_users: int
    active_users: int
    inactive_users: int
    users_by_role: dict
    users_by_type: dict
    recent_signups: int  # Last 30 days
