"""
Fines Management models for tracking and managing library fines.
Phase 3 - Enhanced Features (Day 14)
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal
from enum import Enum


# =====================================================
# Enums
# =====================================================

class FineRuleType(str, Enum):
    """Fine rule calculation type."""
    PER_DAY = "per_day"
    FIXED = "fixed"
    TIERED = "tiered"
    PERCENTAGE = "percentage"


class FineType(str, Enum):
    """Type of fine."""
    OVERDUE = "overdue"
    DAMAGE = "damage"
    LOST = "lost"
    OTHER = "other"


class FineStatus(str, Enum):
    """Fine payment status."""
    PENDING = "pending"
    PARTIAL = "partial"
    PAID = "paid"
    WAIVED = "waived"
    CANCELLED = "cancelled"


class PaymentMethod(str, Enum):
    """Payment method for fines."""
    CASH = "cash"
    CARD = "card"
    BANK_TRANSFER = "bank_transfer"
    ONLINE = "online"
    CHECK = "check"
    WAIVER = "waiver"


class PaymentStatus(str, Enum):
    """Payment transaction status."""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# =====================================================
# Fine Rule Models
# =====================================================

class FineRuleBase(BaseModel):
    """Base fine rule model."""
    name: str = Field(..., min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    rule_type: FineRuleType
    amount_per_day: Optional[Decimal] = Field(None, ge=0)
    fixed_amount: Optional[Decimal] = Field(None, ge=0)
    minimum_amount: Decimal = Field(default=Decimal("0"), ge=0)
    maximum_amount: Optional[Decimal] = Field(None, ge=0)
    tiered_config: List[dict] = []  # [{days: 7, amount: 1.00}, ...]
    grace_period_days: int = Field(default=0, ge=0)
    applies_to_user_types: Optional[List[str]] = None
    applies_to_categories: Optional[List[UUID]] = None
    applies_to_material_types: Optional[List[str]] = None
    is_active: bool = True
    priority: int = Field(default=0, ge=0)


class FineRuleCreate(FineRuleBase):
    """Fine rule creation model."""
    pass


class FineRuleUpdate(BaseModel):
    """Fine rule update model - all fields optional."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    name_ar: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    description_ar: Optional[str] = None
    rule_type: Optional[FineRuleType] = None
    amount_per_day: Optional[Decimal] = Field(None, ge=0)
    fixed_amount: Optional[Decimal] = Field(None, ge=0)
    minimum_amount: Optional[Decimal] = Field(None, ge=0)
    maximum_amount: Optional[Decimal] = Field(None, ge=0)
    tiered_config: Optional[List[dict]] = None
    grace_period_days: Optional[int] = Field(None, ge=0)
    applies_to_user_types: Optional[List[str]] = None
    applies_to_categories: Optional[List[UUID]] = None
    applies_to_material_types: Optional[List[str]] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=0)


class FineRuleResponse(FineRuleBase):
    """Fine rule response model."""
    id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FineRuleListResponse(BaseModel):
    """Paginated fine rules list."""
    data: List[FineRuleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# =====================================================
# Fine Models
# =====================================================

class FineBase(BaseModel):
    """Base fine model."""
    circulation_id: Optional[UUID] = None
    user_id: UUID
    book_id: Optional[UUID] = None
    fine_type: FineType
    original_amount: Decimal = Field(..., ge=0)
    notes: Optional[str] = None
    assessed_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = None


class FineCreate(FineBase):
    """Fine creation model."""
    days_overdue: Optional[int] = None
    fine_rule_id: Optional[UUID] = None
    calculation_details: Optional[dict] = None


class FineUpdate(BaseModel):
    """Fine update model."""
    notes: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[FineStatus] = None


class FineWaiver(BaseModel):
    """Fine waiver request."""
    waived_amount: Decimal = Field(..., gt=0)
    waiver_reason: str = Field(..., min_length=1)


class FineResponse(FineBase):
    """Fine response model."""
    id: UUID
    current_amount: Decimal
    paid_amount: Decimal
    waived_amount: Decimal
    status: FineStatus
    days_overdue: Optional[int] = None
    fine_rule_id: Optional[UUID] = None
    calculation_details: Optional[dict] = None
    paid_date: Optional[date] = None
    waived_date: Optional[date] = None
    waiver_reason: Optional[str] = None
    waiver_approved_by: Optional[UUID] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    book_title: Optional[str] = None
    book_isbn: Optional[str] = None

    class Config:
        from_attributes = True


class FineListResponse(BaseModel):
    """Paginated fines list."""
    data: List[FineResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class FineStatistics(BaseModel):
    """Fine statistics."""
    total_fines: int
    total_amount: Decimal
    total_outstanding: Decimal
    total_paid: Decimal
    total_waived: Decimal
    by_status: dict  # {pending: 10, paid: 50, ...}
    by_type: dict  # {overdue: 100, damage: 5, ...}
    average_fine: Decimal
    top_debtors: List[dict]  # [{user_id, name, total_owed}]
    overdue_30_days: int
    overdue_60_days: int
    overdue_90_days: int


# =====================================================
# Payment Models
# =====================================================

class PaymentBase(BaseModel):
    """Base payment model."""
    fine_id: UUID
    amount: Decimal = Field(..., gt=0)
    payment_method: PaymentMethod
    transaction_id: Optional[str] = Field(None, max_length=255)
    transaction_reference: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    receipt_number: Optional[str] = Field(None, max_length=100)


class PaymentCreate(PaymentBase):
    """Payment creation model."""
    pass


class PaymentRefund(BaseModel):
    """Payment refund request."""
    refund_amount: Decimal = Field(..., gt=0)
    refund_reason: str = Field(..., min_length=1)


class PaymentResponse(PaymentBase):
    """Payment response model."""
    id: UUID
    payment_status: PaymentStatus
    transaction_date: datetime
    processed_by: Optional[UUID] = None
    processed_at: datetime
    refund_amount: Decimal
    refund_date: Optional[date] = None
    refund_reason: Optional[str] = None
    refunded_by: Optional[UUID] = None
    created_at: datetime

    # Joined fields
    fine_amount: Optional[Decimal] = None
    user_name: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    """Paginated payments list."""
    data: List[PaymentResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PaymentStatistics(BaseModel):
    """Payment statistics."""
    total_payments: int
    total_amount_collected: Decimal
    total_refunded: Decimal
    by_method: dict  # {cash: 100.00, card: 250.00, ...}
    by_status: dict  # {completed: 50, pending: 5, ...}
    average_payment: Decimal
    today_collections: Decimal
    month_collections: Decimal
    year_collections: Decimal


# =====================================================
# Filter Models
# =====================================================

class FineFilters(BaseModel):
    """Fine search and filter parameters."""
    user_id: Optional[UUID] = None
    book_id: Optional[UUID] = None
    circulation_id: Optional[UUID] = None
    fine_type: Optional[FineType] = None
    status: Optional[FineStatus] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None
    assessed_from: Optional[date] = None
    assessed_to: Optional[date] = None
    overdue_only: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("assessed_date", description="Sort by field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


class PaymentFilters(BaseModel):
    """Payment filter parameters."""
    fine_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    payment_method: Optional[PaymentMethod] = None
    payment_status: Optional[PaymentStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


class FineRuleFilters(BaseModel):
    """Fine rule filter parameters."""
    rule_type: Optional[FineRuleType] = None
    is_active: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("priority", description="Sort by field")
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


# =====================================================
# Calculation Models
# =====================================================

class FineCalculationRequest(BaseModel):
    """Request to calculate fine for circulation."""
    circulation_id: UUID
    return_date: Optional[date] = None  # Defaults to today


class FineCalculationResponse(BaseModel):
    """Fine calculation result."""
    circulation_id: UUID
    book_id: UUID
    user_id: UUID
    days_overdue: int
    fine_amount: Decimal
    rule_applied: Optional[FineRuleResponse] = None
    calculation_details: dict
    grace_period_applied: int
    can_assess: bool
    message: str
