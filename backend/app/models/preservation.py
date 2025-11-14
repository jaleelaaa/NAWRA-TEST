"""
Preservation Records Models
Tracks artifact condition, conservation history, and restoration needs
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from uuid import UUID


class ConditionStatus(str, Enum):
    """Artifact condition status"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    CRITICAL = "critical"


class RestorationPriority(str, Enum):
    """Priority level for restoration work"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class DamageType(str, Enum):
    """Types of damage that can affect artifacts"""
    WATER = "water"
    MOLD = "mold"
    PEST = "pest"
    PHYSICAL = "physical"
    CHEMICAL = "chemical"
    FIRE = "fire"
    UV = "uv"
    WEAR = "wear"


class LightExposure(str, Enum):
    """Light exposure levels"""
    MINIMAL = "minimal"
    MODERATE = "moderate"
    HIGH = "high"


class InspectionFrequency(str, Enum):
    """How often to inspect artifacts"""
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class DamageSeverity(str, Enum):
    """Severity of damage"""
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"


class ConservationHistoryEntry(BaseModel):
    """Single conservation activity entry"""
    date: date
    action: str
    conservator: str
    cost: Optional[float] = None
    notes: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-01-15",
                "action": "Cleaned and rebound cover",
                "conservator": "Ahmed Al-Balushi",
                "cost": 150.50,
                "notes": "Used archival materials"
            }
        }


class PreservationBase(BaseModel):
    """Base preservation record fields"""
    book_id: UUID
    condition_status: ConditionStatus
    condition_notes: Optional[str] = None
    conservation_history: List[ConservationHistoryEntry] = []
    last_conservation_date: Optional[date] = None
    conservator_name: Optional[str] = None
    restoration_needed: bool = False
    restoration_priority: Optional[RestorationPriority] = None
    restoration_notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    last_inspection_date: date = Field(default_factory=date.today)
    next_inspection_date: Optional[date] = None
    inspection_frequency: Optional[InspectionFrequency] = None
    storage_temperature: Optional[float] = Field(None, ge=-20, le=50)
    storage_humidity: Optional[float] = Field(None, ge=0, le=100)
    light_exposure: Optional[LightExposure] = None
    damage_types: List[DamageType] = []
    damage_severity: Optional[DamageSeverity] = None
    damage_photos: List[str] = []


class PreservationCreate(PreservationBase):
    """Schema for creating a new preservation record"""
    pass

    class Config:
        json_schema_extra = {
            "example": {
                "book_id": "123e4567-e89b-12d3-a456-426614174000",
                "condition_status": "good",
                "condition_notes": "Minor wear on spine",
                "restoration_needed": False,
                "last_inspection_date": "2024-11-14",
                "next_inspection_date": "2025-02-14",
                "inspection_frequency": "quarterly",
                "storage_temperature": 20.5,
                "storage_humidity": 45.0,
                "light_exposure": "minimal"
            }
        }


class PreservationUpdate(BaseModel):
    """Schema for updating a preservation record"""
    condition_status: Optional[ConditionStatus] = None
    condition_notes: Optional[str] = None
    conservation_history: Optional[List[ConservationHistoryEntry]] = None
    last_conservation_date: Optional[date] = None
    conservator_name: Optional[str] = None
    restoration_needed: Optional[bool] = None
    restoration_priority: Optional[RestorationPriority] = None
    restoration_notes: Optional[str] = None
    estimated_cost: Optional[float] = None
    last_inspection_date: Optional[date] = None
    next_inspection_date: Optional[date] = None
    inspection_frequency: Optional[InspectionFrequency] = None
    storage_temperature: Optional[float] = Field(None, ge=-20, le=50)
    storage_humidity: Optional[float] = Field(None, ge=0, le=100)
    light_exposure: Optional[LightExposure] = None
    damage_types: Optional[List[DamageType]] = None
    damage_severity: Optional[DamageSeverity] = None
    damage_photos: Optional[List[str]] = None


class PreservationResponse(PreservationBase):
    """Schema for preservation record response"""
    id: UUID
    recorded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    # Joined fields from books table
    book_title: Optional[str] = None
    book_title_ar: Optional[str] = None

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174001",
                "book_id": "123e4567-e89b-12d3-a456-426614174000",
                "condition_status": "good",
                "condition_notes": "Minor wear on spine",
                "conservation_history": [],
                "restoration_needed": False,
                "last_inspection_date": "2024-11-14",
                "next_inspection_date": "2025-02-14",
                "inspection_frequency": "quarterly",
                "storage_temperature": 20.5,
                "storage_humidity": 45.0,
                "light_exposure": "minimal",
                "damage_types": [],
                "damage_photos": [],
                "recorded_by": "123e4567-e89b-12d3-a456-426614174002",
                "created_at": "2024-11-14T10:00:00Z",
                "updated_at": "2024-11-14T10:00:00Z",
                "book_title": "Historic Manuscript",
                "book_title_ar": "مخطوطة تاريخية"
            }
        }


class PreservationListResponse(BaseModel):
    """Paginated list of preservation records"""
    data: List[PreservationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PreservationStatistics(BaseModel):
    """Preservation statistics for dashboard"""
    total_records: int
    by_condition: dict  # {excellent: 10, good: 20, fair: 15, poor: 5, critical: 2}
    needs_restoration: int
    urgent_restoration: int
    upcoming_inspections: int  # within next 30 days
    overdue_inspections: int
    average_condition_score: float  # 0-100

    class Config:
        json_schema_extra = {
            "example": {
                "total_records": 52,
                "by_condition": {
                    "excellent": 10,
                    "good": 20,
                    "fair": 15,
                    "poor": 5,
                    "critical": 2
                },
                "needs_restoration": 7,
                "urgent_restoration": 2,
                "upcoming_inspections": 12,
                "overdue_inspections": 3,
                "average_condition_score": 72.5
            }
        }
