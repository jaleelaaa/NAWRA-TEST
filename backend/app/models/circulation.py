"""
Circulation Pydantic models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class CirculationStatus(str, Enum):
    """Circulation status enum"""
    ACTIVE = "active"
    OVERDUE = "overdue"
    RETURNED = "returned"
    RESERVED = "reserved"


class BookCondition(str, Enum):
    """Book condition enum"""
    GOOD = "good"
    FAIR = "fair"
    DAMAGED = "damaged"


class CirculationBase(BaseModel):
    """Base circulation schema"""
    user_id: UUID
    book_id: UUID
    issue_date: date
    due_date: date
    notes: Optional[str] = None


class CirculationCreate(CirculationBase):
    """Create circulation record schema"""
    send_email: bool = Field(default=False, description="Send email notification to user")
    print_receipt: bool = Field(default=False, description="Print receipt for transaction")


class CirculationReturn(BaseModel):
    """Return book schema"""
    return_date: date
    book_condition: BookCondition
    notes: Optional[str] = None


class CirculationUpdate(BaseModel):
    """Update circulation record schema"""
    due_date: Optional[date] = None
    status: Optional[CirculationStatus] = None
    return_date: Optional[date] = None
    book_condition: Optional[BookCondition] = None
    fine_amount: Optional[float] = None
    fine_paid: Optional[bool] = None
    notes: Optional[str] = None


class CirculationResponse(BaseModel):
    """Circulation record response schema"""
    id: UUID
    user_id: UUID
    user_name: str
    user_role: str
    book_id: UUID
    book_title: str
    book_isbn: Optional[str] = None
    category: Optional[str] = None
    shelf_location: Optional[str] = None
    issue_date: date
    due_date: date
    return_date: Optional[date] = None
    status: CirculationStatus
    book_condition: Optional[BookCondition] = None
    fine_amount: Optional[float] = None
    fine_paid: Optional[bool] = None
    days_left: int
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        use_enum_values = True


class CirculationListResponse(BaseModel):
    """Paginated circulation list response"""
    items: List[CirculationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CirculationStatsResponse(BaseModel):
    """Circulation statistics response"""
    active_issues: int
    overdue_books: int
    returned_today: int
    reserved_books: int
    total_fines: float
    total_fines_paid: float
    average_borrow_duration: float  # in days
    most_borrowed_books: List[dict]  # [{"book_id": UUID, "title": str, "count": int}]
    most_active_users: List[dict]  # [{"user_id": UUID, "name": str, "count": int}]


class CirculationSearchParams(BaseModel):
    """Search and filter parameters for circulation records"""
    search: Optional[str] = Field(None, description="Search by user name, book title, or user ID")
    status: Optional[CirculationStatus] = None
    user_type: Optional[str] = None
    due_date_filter: Optional[str] = Field(
        None,
        description="Filter by due date: 'today', 'tomorrow', 'week', 'overdue'"
    )
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("issue_date", description="Sort by field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


class CirculationDetailResponse(CirculationResponse):
    """Detailed circulation record with additional user and book info"""
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    book_author: Optional[str] = None
    book_publisher: Optional[str] = None
    book_year: Optional[int] = None
    renewal_count: int = Field(0, description="Number of times renewed")
    can_renew: bool = Field(True, description="Whether book can be renewed")
