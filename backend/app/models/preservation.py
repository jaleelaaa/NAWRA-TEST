"""
Preservation Records Models

Pydantic models for tracking item condition, conservation, and restoration
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class PreservationCondition(str, Enum):
    """Overall condition assessment"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"


class ConservationPriority(str, Enum):
    """Priority level for conservation work"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"
    IMMEDIATE = "immediate"


class PreservationActionType(str, Enum):
    """Types of preservation actions"""
    INSPECTION = "inspection"
    CLEANING = "cleaning"
    REPAIR = "repair"
    RESTORATION = "restoration"
    REBINDING = "rebinding"
    DEACIDIFICATION = "deacidification"
    DIGITIZATION = "digitization"
    ENCAPSULATION = "encapsulation"
    ENVIRONMENTAL_CONTROL = "environmental_control"
    PEST_CONTROL = "pest_control"
    PHOTOGRAPHY = "photography"
    OTHER = "other"


class DamageType(str, Enum):
    """Types of damage"""
    WATER_DAMAGE = "water_damage"
    MOLD = "mold"
    INSECT_DAMAGE = "insect_damage"
    TEARS = "tears"
    LOOSE_BINDING = "loose_binding"
    MISSING_PAGES = "missing_pages"
    FADING = "fading"
    BRITTLENESS = "brittleness"
    STAINS = "stains"
    ACID_DAMAGE = "acid_damage"
    MECHANICAL_DAMAGE = "mechanical_damage"
    OTHER = "other"


class PreservationRecordBase(BaseModel):
    """Base preservation record data"""
    book_id: UUID
    inspection_date: date
    inspector_name: str
    inspector_id: Optional[UUID] = None

    # Overall Assessment
    overall_condition: PreservationCondition
    priority: ConservationPriority

    # Damage Assessment
    damage_types: List[DamageType] = Field(default_factory=list)
    damage_description: Optional[str] = None
    damage_description_ar: Optional[str] = None

    # Physical Measurements
    pages_total: Optional[int] = None
    pages_damaged: Optional[int] = None
    pages_missing: Optional[int] = None
    binding_condition: Optional[str] = None

    # Environmental Factors
    temperature: Optional[float] = None  # Celsius
    humidity: Optional[float] = None  # Percentage
    light_exposure: Optional[str] = None  # low, medium, high

    # Conservation Needs
    requires_conservation: bool = False
    conservation_notes: Optional[str] = None
    conservation_notes_ar: Optional[str] = None
    estimated_cost: Optional[float] = None
    estimated_time_hours: Optional[int] = None

    # Recommended Actions
    recommended_actions: List[PreservationActionType] = Field(default_factory=list)
    action_timeline: Optional[str] = None

    # Storage & Handling
    special_storage_required: bool = False
    storage_requirements: Optional[str] = None
    handling_instructions: Optional[str] = None
    handling_instructions_ar: Optional[str] = None

    # Documentation
    photos_taken: bool = False
    photo_urls: List[str] = Field(default_factory=list)

    # Additional Notes
    notes: Optional[str] = None
    notes_ar: Optional[str] = None


class PreservationRecordCreate(PreservationRecordBase):
    """Preservation record creation model"""
    pass


class PreservationRecordUpdate(BaseModel):
    """Preservation record update model"""
    inspector_name: Optional[str] = None
    inspector_id: Optional[UUID] = None
    inspection_date: Optional[date] = None
    overall_condition: Optional[PreservationCondition] = None
    priority: Optional[ConservationPriority] = None
    damage_types: Optional[List[DamageType]] = None
    damage_description: Optional[str] = None
    damage_description_ar: Optional[str] = None
    pages_damaged: Optional[int] = None
    pages_missing: Optional[int] = None
    binding_condition: Optional[str] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    light_exposure: Optional[str] = None
    requires_conservation: Optional[bool] = None
    conservation_notes: Optional[str] = None
    conservation_notes_ar: Optional[str] = None
    estimated_cost: Optional[float] = None
    estimated_time_hours: Optional[int] = None
    recommended_actions: Optional[List[PreservationActionType]] = None
    action_timeline: Optional[str] = None
    special_storage_required: Optional[bool] = None
    storage_requirements: Optional[str] = None
    handling_instructions: Optional[str] = None
    handling_instructions_ar: Optional[str] = None
    photos_taken: Optional[bool] = None
    photo_urls: Optional[List[str]] = None
    notes: Optional[str] = None
    notes_ar: Optional[str] = None


class PreservationRecordResponse(PreservationRecordBase):
    """Preservation record response model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    # Enriched fields
    book_title: Optional[str] = None
    book_title_ar: Optional[str] = None
    book_author: Optional[str] = None

    class Config:
        from_attributes = True


class PreservationRecordFilters(BaseModel):
    """Filters for preservation record queries"""
    book_id: Optional[UUID] = None
    inspector_id: Optional[UUID] = None
    condition: Optional[PreservationCondition] = None
    priority: Optional[ConservationPriority] = None
    requires_conservation: Optional[bool] = None
    damage_type: Optional[DamageType] = None
    from_date: Optional[date] = None
    to_date: Optional[date] = None
    search: Optional[str] = None

    # Pagination
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    # Sorting
    sort_by: str = "inspection_date"
    sort_order: str = "desc"


class PreservationRecordListResponse(BaseModel):
    """Paginated preservation records response"""
    items: List[PreservationRecordResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConservationWork(BaseModel):
    """Conservation work record"""
    preservation_record_id: UUID
    action_type: PreservationActionType
    performed_by: str
    performed_by_id: Optional[UUID] = None
    start_date: date
    completion_date: Optional[date] = None
    status: str  # planned, in_progress, completed, cancelled

    # Work Details
    work_description: str
    work_description_ar: Optional[str] = None
    materials_used: Optional[List[str]] = Field(default_factory=list)
    cost: Optional[float] = None
    time_spent_hours: Optional[int] = None

    # Results
    result_condition: Optional[PreservationCondition] = None
    result_notes: Optional[str] = None
    result_notes_ar: Optional[str] = None
    before_photos: List[str] = Field(default_factory=list)
    after_photos: List[str] = Field(default_factory=list)


class ConservationWorkCreate(BaseModel):
    """Conservation work creation model"""
    preservation_record_id: UUID
    action_type: PreservationActionType
    performed_by: str
    performed_by_id: Optional[UUID] = None
    start_date: date
    status: str = "planned"
    work_description: str
    work_description_ar: Optional[str] = None
    materials_used: Optional[List[str]] = None
    estimated_cost: Optional[float] = None
    estimated_hours: Optional[int] = None


class ConservationWorkResponse(ConservationWork):
    """Conservation work response model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PreservationStatistics(BaseModel):
    """Preservation statistics for dashboard"""
    total_records: int
    inspections_this_month: int
    items_requiring_conservation: int

    # By Condition
    by_condition: Dict[str, int]

    # By Priority
    by_priority: Dict[str, int]

    # By Damage Type
    by_damage_type: Dict[str, int]

    # Conservation Work
    active_conservation_projects: int
    completed_conservation_this_month: int
    total_conservation_cost: float

    # Critical Items
    critical_items: List[PreservationRecordResponse]
    urgent_items: List[PreservationRecordResponse]

    # Budget Estimates
    estimated_conservation_cost: float
    estimated_conservation_hours: int


class PreservationSchedule(BaseModel):
    """Scheduled preservation inspections"""
    book_id: UUID
    scheduled_date: date
    inspection_type: str  # routine, follow_up, emergency
    inspector_id: Optional[UUID] = None
    notes: Optional[str] = None
    completed: bool = False
    completed_date: Optional[date] = None
    preservation_record_id: Optional[UUID] = None


class PreservationScheduleCreate(BaseModel):
    """Preservation schedule creation model"""
    book_id: UUID
    scheduled_date: date
    inspection_type: str
    inspector_id: Optional[UUID] = None
    notes: Optional[str] = None


class PreservationScheduleResponse(PreservationSchedule):
    """Preservation schedule response model"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    # Enriched fields
    book_title: Optional[str] = None
    inspector_name: Optional[str] = None

    class Config:
        from_attributes = True


class BulkInspectionRequest(BaseModel):
    """Bulk inspection request"""
    book_ids: List[UUID]
    inspector_name: str
    inspector_id: Optional[UUID] = None
    inspection_date: date
    default_condition: PreservationCondition = PreservationCondition.GOOD
    notes: Optional[str] = None


class PreservationReport(BaseModel):
    """Comprehensive preservation report"""
    from_date: date
    to_date: date

    # Summary
    total_inspections: int
    items_deteriorating: int
    conservation_projects_started: int
    conservation_projects_completed: int

    # Financial
    total_spent: float
    total_estimated: float
    budget_utilization: float

    # Condition Trends
    condition_changes: List[Dict[str, Any]]

    # Priority Items
    immediate_action_items: List[PreservationRecordResponse]

    # Recommendations
    recommendations: List[str]
