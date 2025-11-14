"""
Barcode API Endpoints
RESTful API for barcode generation, scanning, and management
"""

from fastapi import APIRouter, Depends, status
from typing import List
from uuid import UUID
from supabase import Client

from ....db.supabase_client import get_supabase
from ....core.security import get_current_user
from ....models.barcode import (
    BarcodeSettings,
    BarcodeSettingsUpdate,
    BarcodeHistory,
    BarcodeGenerate,
    BarcodeGenerateResponse,
    BarcodeLookup,
    BarcodeLookupResponse,
    BarcodeBatchGenerate,
    BarcodeBatchResponse,
    BarcodeStatistics,
)
from ....services.barcode_service import BarcodeService

router = APIRouter()


@router.get(
    "/settings",
    response_model=BarcodeSettings,
    summary="Get Barcode Settings",
    description="Retrieve current barcode generation settings"
)
async def get_barcode_settings(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get the current barcode generation settings including:
    - Format (CODE128, CODE39, etc.)
    - Prefix and sequence settings
    - Display preferences
    """
    service = BarcodeService(supabase)
    return await service.get_barcode_settings()


@router.patch(
    "/settings",
    response_model=BarcodeSettings,
    summary="Update Barcode Settings",
    description="Update barcode generation settings"
)
async def update_barcode_settings(
    update: BarcodeSettingsUpdate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update barcode settings. Only provided fields will be updated.
    Requires appropriate permissions.
    """
    service = BarcodeService(supabase)
    return await service.update_barcode_settings(update)


@router.post(
    "/generate",
    response_model=BarcodeGenerateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Barcode",
    description="Generate a barcode for a specific book"
)
async def generate_barcode(
    request: BarcodeGenerate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Generate a barcode for a book. Options:
    - **Auto-generate**: Leave custom_barcode empty for sequential generation
    - **Custom barcode**: Provide custom_barcode value

    Returns the barcode value and image (SVG base64 encoded)
    """
    service = BarcodeService(supabase)
    return await service.generate_barcode(request, current_user['id'])


@router.post(
    "/lookup",
    response_model=BarcodeLookupResponse,
    summary="Lookup Book by Barcode",
    description="Find a book using its barcode"
)
async def lookup_barcode(
    lookup: BarcodeLookup,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Look up a book by scanning or entering its barcode.
    Returns complete book information if found.
    Useful for:
    - Quick book retrieval
    - Circulation desk operations
    - Inventory checks
    """
    service = BarcodeService(supabase)
    return await service.lookup_barcode(lookup)


@router.post(
    "/batch/generate",
    response_model=BarcodeBatchResponse,
    summary="Batch Generate Barcodes",
    description="Generate barcodes for multiple books at once"
)
async def batch_generate_barcodes(
    request: BarcodeBatchGenerate,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Generate barcodes for multiple books in a single operation.
    Maximum 100 books per request.
    Returns success/failure status for each book.
    """
    service = BarcodeService(supabase)
    return await service.batch_generate_barcodes(request, current_user['id'])


@router.get(
    "/history/{book_id}",
    response_model=List[BarcodeHistory],
    summary="Get Barcode History",
    description="Retrieve barcode change history for a book"
)
async def get_barcode_history(
    book_id: UUID,
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get the complete history of barcode changes for a specific book.
    Includes old and new barcode values, change reasons, and timestamps.
    """
    service = BarcodeService(supabase)
    return await service.get_barcode_history(book_id)


@router.get(
    "/statistics",
    response_model=BarcodeStatistics,
    summary="Get Barcode Statistics",
    description="Retrieve barcode usage statistics"
)
async def get_barcode_statistics(
    current_user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get comprehensive barcode statistics including:
    - Total books with/without barcodes
    - Coverage percentage
    - Next available barcode
    - Current format settings
    """
    service = BarcodeService(supabase)
    return await service.get_barcode_statistics()
