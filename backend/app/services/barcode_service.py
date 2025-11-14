"""
Barcode Service
Business logic for barcode generation, scanning, and management
"""

from uuid import UUID
from typing import Optional, List
import base64
import io
from datetime import datetime
from supabase import Client
from fastapi import HTTPException, status

from ..models.barcode import (
    BarcodeSettings,
    BarcodeSettingsUpdate,
    BarcodeHistory,
    BarcodeGenerate,
    BarcodeGenerateResponse,
    BarcodeLookup,
    BarcodeLookupResponse,
    BarcodeBatchGenerate,
    BarcodeBatchResponse,
    BarcodePrintRequest,
    BarcodeStatistics,
    BarcodeFormat,
)


class BarcodeService:
    """Service class for barcode operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    def _generate_barcode_image(self, barcode_value: str, format: BarcodeFormat, show_text: bool = True, height: int = 50, width: int = 2) -> str:
        """
        Generate barcode image as SVG (base64 encoded)
        In production, use a library like python-barcode or qrcode
        For now, returns a simple SVG placeholder
        """
        try:
            # Simple SVG barcode representation (placeholder)
            # In production, use: from barcode import Code128, generate
            svg_width = len(barcode_value) * 15 * width
            svg_height = height + (20 if show_text else 0)

            svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{svg_width}" height="{svg_height}" viewBox="0 0 {svg_width} {svg_height}">
    <rect width="100%" height="100%" fill="white"/>
    <g transform="translate(10, 10)">
        <!-- Barcode bars would go here -->
        <rect x="0" y="0" width="{width}" height="{height}" fill="black"/>
        <rect x="{width * 3}" y="0" width="{width * 2}" height="{height}" fill="black"/>
        <rect x="{width * 6}" y="0" width="{width}" height="{height}" fill="black"/>
        <rect x="{width * 9}" y="0" width="{width * 3}" height="{height}" fill="black"/>
    </g>
    {f'<text x="{svg_width/2}" y="{height + 15}" text-anchor="middle" font-family="monospace" font-size="12">{barcode_value}</text>' if show_text else ''}
</svg>'''

            # Encode as base64
            svg_bytes = svg.encode('utf-8')
            svg_base64 = base64.b64encode(svg_bytes).decode('utf-8')
            return f"data:image/svg+xml;base64,{svg_base64}"

        except Exception as e:
            # Fallback to data URI with text
            return f"data:text/plain,{barcode_value}"

    async def get_barcode_settings(self) -> BarcodeSettings:
        """Get current barcode settings"""
        try:
            response = self.supabase.table("barcode_settings")\
                .select("*")\
                .limit(1)\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Barcode settings not found"
                )

            return BarcodeSettings(**response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching barcode settings: {str(e)}"
            )

    async def update_barcode_settings(self, update: BarcodeSettingsUpdate) -> BarcodeSettings:
        """Update barcode settings"""
        try:
            data = update.model_dump(exclude_unset=True)

            # Convert enum to string if present
            if 'format' in data and data['format']:
                data['format'] = data['format'].value if hasattr(data['format'], 'value') else data['format']

            # Get the first (and only) settings record
            current_settings = await self.get_barcode_settings()

            response = self.supabase.table("barcode_settings")\
                .update(data)\
                .eq("id", str(current_settings.id))\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Barcode settings not found"
                )

            return BarcodeSettings(**response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating barcode settings: {str(e)}"
            )

    async def generate_barcode(self, request: BarcodeGenerate, user_id: UUID) -> BarcodeGenerateResponse:
        """Generate barcode for a book"""
        try:
            # Check if book exists
            book_response = self.supabase.table("books")\
                .select("id, barcode, title")\
                .eq("id", str(request.book_id))\
                .single()\
                .execute()

            if not book_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Book not found"
                )

            book = book_response.data
            old_barcode = book.get('barcode')

            # Get settings
            settings = await self.get_barcode_settings()

            # Determine barcode value
            if request.custom_barcode:
                new_barcode = request.custom_barcode.upper().strip()

                # Check if custom barcode already exists
                existing = self.supabase.table("books")\
                    .select("id")\
                    .eq("barcode", new_barcode)\
                    .neq("id", str(request.book_id))\
                    .execute()

                if existing.data:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Barcode {new_barcode} already exists"
                    )
            else:
                # Auto-generate using database function
                barcode_response = self.supabase.rpc('generate_next_barcode').execute()
                new_barcode = barcode_response.data

            # Update book with new barcode
            update_response = self.supabase.table("books")\
                .update({"barcode": new_barcode})\
                .eq("id", str(request.book_id))\
                .execute()

            if not update_response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update book with barcode"
                )

            # Record in history
            history_data = {
                "book_id": str(request.book_id),
                "old_barcode": old_barcode,
                "new_barcode": new_barcode,
                "change_reason": request.reason or "Barcode generated",
                "changed_by": str(user_id)
            }
            self.supabase.table("barcode_history").insert(history_data).execute()

            # Generate barcode image
            barcode_image = self._generate_barcode_image(
                new_barcode,
                settings.format,
                settings.show_text,
                settings.barcode_height,
                settings.barcode_width
            )

            return BarcodeGenerateResponse(
                book_id=request.book_id,
                barcode=new_barcode,
                barcode_image=barcode_image,
                format=settings.format,
                message="Barcode generated successfully"
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating barcode: {str(e)}"
            )

    async def lookup_barcode(self, lookup: BarcodeLookup) -> BarcodeLookupResponse:
        """Look up a book by barcode"""
        try:
            response = self.supabase.table("books")\
                .select("*")\
                .eq("barcode", lookup.barcode.upper().strip())\
                .single()\
                .execute()

            if response.data:
                return BarcodeLookupResponse(
                    found=True,
                    barcode=lookup.barcode,
                    book=response.data,
                    message="Book found"
                )
            else:
                return BarcodeLookupResponse(
                    found=False,
                    barcode=lookup.barcode,
                    book=None,
                    message="Book not found"
                )

        except Exception as e:
            return BarcodeLookupResponse(
                found=False,
                barcode=lookup.barcode,
                book=None,
                message=f"Error during lookup: {str(e)}"
            )

    async def batch_generate_barcodes(self, request: BarcodeBatchGenerate, user_id: UUID) -> BarcodeBatchResponse:
        """Generate barcodes for multiple books"""
        results = []
        successful = 0
        failed = 0

        for book_id in request.book_ids:
            try:
                generate_request = BarcodeGenerate(
                    book_id=book_id,
                    reason=request.reason
                )
                result = await self.generate_barcode(generate_request, user_id)
                results.append({
                    "book_id": str(book_id),
                    "barcode": result.barcode,
                    "status": "success"
                })
                successful += 1
            except Exception as e:
                results.append({
                    "book_id": str(book_id),
                    "barcode": None,
                    "status": "failed",
                    "error": str(e)
                })
                failed += 1

        return BarcodeBatchResponse(
            total_requested=len(request.book_ids),
            successful=successful,
            failed=failed,
            barcodes=results,
            message=f"Generated {successful} barcodes, {failed} failed"
        )

    async def get_barcode_history(self, book_id: UUID) -> List[BarcodeHistory]:
        """Get barcode change history for a book"""
        try:
            response = self.supabase.table("barcode_history")\
                .select("*")\
                .eq("book_id", str(book_id))\
                .order("changed_at", desc=True)\
                .execute()

            return [BarcodeHistory(**record) for record in response.data]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching barcode history: {str(e)}"
            )

    async def get_barcode_statistics(self) -> BarcodeStatistics:
        """Get barcode usage statistics"""
        try:
            # Total books
            total_response = self.supabase.table("books")\
                .select("*", count="exact")\
                .execute()
            total_books = total_response.count or 0

            # Books with barcode
            with_barcode_response = self.supabase.table("books")\
                .select("*", count="exact")\
                .not_.is_("barcode", "null")\
                .execute()
            books_with_barcode = with_barcode_response.count or 0

            # Books without barcode
            books_without_barcode = total_books - books_with_barcode

            # Coverage percentage
            coverage = (books_with_barcode / total_books * 100) if total_books > 0 else 0

            # Get next available barcode
            settings = await self.get_barcode_settings()
            next_barcode = f"{settings.prefix}{str(settings.next_sequence).zfill(settings.sequence_length)}"

            return BarcodeStatistics(
                total_books=total_books,
                books_with_barcode=books_with_barcode,
                books_without_barcode=books_without_barcode,
                barcode_coverage_percentage=round(coverage, 2),
                next_available_barcode=next_barcode,
                barcode_format=settings.format
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error calculating barcode statistics: {str(e)}"
            )
