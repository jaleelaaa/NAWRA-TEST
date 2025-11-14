"""
Barcode Models
Models for barcode generation, scanning, and management
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from uuid import UUID


class BarcodeFormat(str, Enum):
    """Supported barcode formats"""
    CODE128 = "CODE128"
    CODE39 = "CODE39"
    EAN13 = "EAN13"
    EAN8 = "EAN8"
    UPCA = "UPCA"
    UPCE = "UPCE"
    QR = "QR"


class BarcodeSettings(BaseModel):
    """Barcode generation settings"""
    id: UUID
    prefix: str = Field(default="LIB", max_length=10)
    format: BarcodeFormat = BarcodeFormat.CODE128
    include_checksum: bool = True
    auto_generate: bool = True
    next_sequence: int = Field(default=1, ge=1)
    sequence_length: int = Field(default=8, ge=4, le=12)
    show_text: bool = True
    barcode_height: int = Field(default=50, ge=20, le=200)
    barcode_width: int = Field(default=2, ge=1, le=5)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "prefix": "LIB",
                "format": "CODE128",
                "include_checksum": True,
                "auto_generate": True,
                "next_sequence": 1001,
                "sequence_length": 8,
                "show_text": True,
                "barcode_height": 50,
                "barcode_width": 2,
                "created_at": "2024-11-14T10:00:00Z",
                "updated_at": "2024-11-14T10:00:00Z"
            }
        }


class BarcodeSettingsUpdate(BaseModel):
    """Update barcode settings"""
    prefix: Optional[str] = Field(None, max_length=10)
    format: Optional[BarcodeFormat] = None
    include_checksum: Optional[bool] = None
    auto_generate: Optional[bool] = None
    sequence_length: Optional[int] = Field(None, ge=4, le=12)
    show_text: Optional[bool] = None
    barcode_height: Optional[int] = Field(None, ge=20, le=200)
    barcode_width: Optional[int] = Field(None, ge=1, le=5)


class BarcodeHistory(BaseModel):
    """Barcode change history entry"""
    id: UUID
    book_id: UUID
    old_barcode: Optional[str] = None
    new_barcode: str
    change_reason: Optional[str] = None
    changed_by: Optional[UUID] = None
    changed_at: datetime

    class Config:
        from_attributes = True


class BarcodeGenerate(BaseModel):
    """Request to generate barcode for a book"""
    book_id: UUID
    custom_barcode: Optional[str] = Field(None, description="Custom barcode value (overrides auto-generation)")
    reason: Optional[str] = Field(None, description="Reason for generating/changing barcode")

    class Config:
        json_schema_extra = {
            "example": {
                "book_id": "123e4567-e89b-12d3-a456-426614174000",
                "custom_barcode": None,
                "reason": "Initial barcode generation"
            }
        }


class BarcodeGenerateResponse(BaseModel):
    """Response after generating barcode"""
    book_id: UUID
    barcode: str
    barcode_image: str  # Base64 encoded image or SVG
    format: BarcodeFormat
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "book_id": "123e4567-e89b-12d3-a456-426614174000",
                "barcode": "LIB00001001",
                "barcode_image": "data:image/svg+xml;base64,...",
                "format": "CODE128",
                "message": "Barcode generated successfully"
            }
        }


class BarcodeLookup(BaseModel):
    """Barcode lookup request"""
    barcode: str = Field(..., min_length=3, max_length=50)

    class Config:
        json_schema_extra = {
            "example": {
                "barcode": "LIB00001001"
            }
        }


class BarcodeLookupResponse(BaseModel):
    """Barcode lookup response with book details"""
    found: bool
    barcode: str
    book: Optional[dict] = None  # Full book details if found
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "found": True,
                "barcode": "LIB00001001",
                "book": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "title": "Historic Manuscript",
                    "author": "Ahmed Al-Balushi",
                    "status": "available"
                },
                "message": "Book found"
            }
        }


class BarcodeBatchGenerate(BaseModel):
    """Generate barcodes for multiple books"""
    book_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    reason: Optional[str] = "Batch barcode generation"

    class Config:
        json_schema_extra = {
            "example": {
                "book_ids": [
                    "123e4567-e89b-12d3-a456-426614174000",
                    "123e4567-e89b-12d3-a456-426614174001"
                ],
                "reason": "Batch barcode generation for new acquisitions"
            }
        }


class BarcodeBatchResponse(BaseModel):
    """Response for batch barcode generation"""
    total_requested: int
    successful: int
    failed: int
    barcodes: List[dict]  # List of {book_id, barcode, status}
    message: str

    class Config:
        json_schema_extra = {
            "example": {
                "total_requested": 2,
                "successful": 2,
                "failed": 0,
                "barcodes": [
                    {"book_id": "123e4567-e89b-12d3-a456-426614174000", "barcode": "LIB00001001", "status": "success"},
                    {"book_id": "123e4567-e89b-12d3-a456-426614174001", "barcode": "LIB00001002", "status": "success"}
                ],
                "message": "Batch generation completed"
            }
        }


class BarcodePrintRequest(BaseModel):
    """Request to print barcodes"""
    barcodes: List[str] = Field(..., min_items=1, max_items=50)
    format: BarcodeFormat = BarcodeFormat.CODE128
    include_text: bool = True
    page_size: str = Field(default="A4", description="Paper size: A4, Letter, Label")
    labels_per_row: int = Field(default=2, ge=1, le=4)

    class Config:
        json_schema_extra = {
            "example": {
                "barcodes": ["LIB00001001", "LIB00001002"],
                "format": "CODE128",
                "include_text": True,
                "page_size": "A4",
                "labels_per_row": 2
            }
        }


class BarcodeStatistics(BaseModel):
    """Barcode usage statistics"""
    total_books: int
    books_with_barcode: int
    books_without_barcode: int
    barcode_coverage_percentage: float
    next_available_barcode: str
    barcode_format: BarcodeFormat

    class Config:
        json_schema_extra = {
            "example": {
                "total_books": 1000,
                "books_with_barcode": 850,
                "books_without_barcode": 150,
                "barcode_coverage_percentage": 85.0,
                "next_available_barcode": "LIB00001001",
                "barcode_format": "CODE128"
            }
        }
