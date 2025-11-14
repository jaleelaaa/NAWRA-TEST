"""
Preservation Service
Business logic for preservation records management
"""

from uuid import UUID
from typing import Optional, List
from datetime import date, datetime, timedelta
from supabase import Client
from fastapi import HTTPException, status

from ..models.preservation import (
    PreservationCreate,
    PreservationUpdate,
    PreservationResponse,
    PreservationListResponse,
    PreservationStatistics,
    DamageType,
)


class PreservationService:
    """Service class for preservation records operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def create_preservation_record(
        self,
        record: PreservationCreate,
        user_id: UUID
    ) -> PreservationResponse:
        """Create a new preservation record for an artifact"""
        try:
            # Prepare data for insertion
            data = record.model_dump()
            data['recorded_by'] = str(user_id)
            data['book_id'] = str(data['book_id'])

            # Convert enums and dates to strings
            if 'condition_status' in data:
                data['condition_status'] = data['condition_status'].value if hasattr(data['condition_status'], 'value') else data['condition_status']

            if 'restoration_priority' in data and data['restoration_priority']:
                data['restoration_priority'] = data['restoration_priority'].value if hasattr(data['restoration_priority'], 'value') else data['restoration_priority']

            if 'inspection_frequency' in data and data['inspection_frequency']:
                data['inspection_frequency'] = data['inspection_frequency'].value if hasattr(data['inspection_frequency'], 'value') else data['inspection_frequency']

            if 'light_exposure' in data and data['light_exposure']:
                data['light_exposure'] = data['light_exposure'].value if hasattr(data['light_exposure'], 'value') else data['light_exposure']

            if 'damage_severity' in data and data['damage_severity']:
                data['damage_severity'] = data['damage_severity'].value if hasattr(data['damage_severity'], 'value') else data['damage_severity']

            # Convert damage types enum list to strings
            if 'damage_types' in data and data['damage_types']:
                data['damage_types'] = [
                    dt.value if hasattr(dt, 'value') else dt
                    for dt in data['damage_types']
                ]

            # Convert date objects to ISO strings
            if 'last_inspection_date' in data and isinstance(data['last_inspection_date'], date):
                data['last_inspection_date'] = data['last_inspection_date'].isoformat()

            if 'next_inspection_date' in data and data['next_inspection_date'] and isinstance(data['next_inspection_date'], date):
                data['next_inspection_date'] = data['next_inspection_date'].isoformat()

            if 'last_conservation_date' in data and data['last_conservation_date'] and isinstance(data['last_conservation_date'], date):
                data['last_conservation_date'] = data['last_conservation_date'].isoformat()

            # Convert conservation history to dict list
            if 'conservation_history' in data and data['conservation_history']:
                data['conservation_history'] = [
                    {
                        **entry.model_dump() if hasattr(entry, 'model_dump') else entry,
                        'date': entry.date.isoformat() if hasattr(entry, 'date') and isinstance(entry.date, date) else entry.get('date')
                    }
                    for entry in data['conservation_history']
                ]

            response = self.supabase.table("preservation_records").insert(data).execute()

            if response.data:
                return PreservationResponse(**response.data[0])

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create preservation record"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating preservation record: {str(e)}"
            )

    async def get_preservation_record(self, record_id: UUID) -> PreservationResponse:
        """Get preservation record by ID with book details"""
        try:
            response = self.supabase.table("preservation_records")\
                .select("*, books(title, title_ar)")\
                .eq("id", str(record_id))\
                .single()\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Preservation record not found"
                )

            # Flatten joined data
            record = response.data
            if 'books' in record and record['books']:
                record['book_title'] = record['books'].get('title')
                record['book_title_ar'] = record['books'].get('title_ar')
                del record['books']

            return PreservationResponse(**record)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching preservation record: {str(e)}"
            )

    async def get_preservation_by_book(self, book_id: UUID) -> List[PreservationResponse]:
        """Get all preservation records for a specific book"""
        try:
            response = self.supabase.table("preservation_records")\
                .select("*")\
                .eq("book_id", str(book_id))\
                .order("created_at", desc=True)\
                .execute()

            return [PreservationResponse(**record) for record in response.data]
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching preservation records for book: {str(e)}"
            )

    async def list_preservation_records(
        self,
        page: int = 1,
        page_size: int = 20,
        condition_status: Optional[str] = None,
        restoration_needed: Optional[bool] = None,
        overdue_inspection: bool = False
    ) -> PreservationListResponse:
        """List preservation records with filters and pagination"""
        try:
            offset = (page - 1) * page_size

            # Build query with count
            query = self.supabase.table("preservation_records")\
                .select("*, books(title, title_ar)", count="exact")

            # Apply filters
            if condition_status:
                query = query.eq("condition_status", condition_status)

            if restoration_needed is not None:
                query = query.eq("restoration_needed", restoration_needed)

            if overdue_inspection:
                today = date.today().isoformat()
                query = query.lt("next_inspection_date", today)

            # Execute query with pagination
            response = query.range(offset, offset + page_size - 1)\
                .order("created_at", desc=True)\
                .execute()

            # Flatten joined data
            records = []
            for record in response.data:
                if 'books' in record and record['books']:
                    record['book_title'] = record['books'].get('title')
                    record['book_title_ar'] = record['books'].get('title_ar')
                    del record['books']
                records.append(PreservationResponse(**record))

            total = response.count or 0
            total_pages = (total + page_size - 1) // page_size

            return PreservationListResponse(
                data=records,
                total=total,
                page=page,
                page_size=page_size,
                total_pages=total_pages
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing preservation records: {str(e)}"
            )

    async def update_preservation_record(
        self,
        record_id: UUID,
        update: PreservationUpdate
    ) -> PreservationResponse:
        """Update a preservation record"""
        try:
            data = update.model_dump(exclude_unset=True)

            # Convert enums to strings
            if 'condition_status' in data:
                data['condition_status'] = data['condition_status'].value if hasattr(data['condition_status'], 'value') else data['condition_status']

            if 'restoration_priority' in data and data['restoration_priority']:
                data['restoration_priority'] = data['restoration_priority'].value if hasattr(data['restoration_priority'], 'value') else data['restoration_priority']

            if 'inspection_frequency' in data and data['inspection_frequency']:
                data['inspection_frequency'] = data['inspection_frequency'].value if hasattr(data['inspection_frequency'], 'value') else data['inspection_frequency']

            if 'light_exposure' in data and data['light_exposure']:
                data['light_exposure'] = data['light_exposure'].value if hasattr(data['light_exposure'], 'value') else data['light_exposure']

            if 'damage_severity' in data and data['damage_severity']:
                data['damage_severity'] = data['damage_severity'].value if hasattr(data['damage_severity'], 'value') else data['damage_severity']

            # Convert damage types enum list to strings
            if 'damage_types' in data and data['damage_types']:
                data['damage_types'] = [
                    dt.value if hasattr(dt, 'value') else dt
                    for dt in data['damage_types']
                ]

            # Convert date objects to ISO strings
            if 'last_inspection_date' in data and isinstance(data['last_inspection_date'], date):
                data['last_inspection_date'] = data['last_inspection_date'].isoformat()

            if 'next_inspection_date' in data and data['next_inspection_date'] and isinstance(data['next_inspection_date'], date):
                data['next_inspection_date'] = data['next_inspection_date'].isoformat()

            if 'last_conservation_date' in data and data['last_conservation_date'] and isinstance(data['last_conservation_date'], date):
                data['last_conservation_date'] = data['last_conservation_date'].isoformat()

            # Convert conservation history to dict list
            if 'conservation_history' in data and data['conservation_history']:
                data['conservation_history'] = [
                    {
                        **entry.model_dump() if hasattr(entry, 'model_dump') else entry,
                        'date': entry.date.isoformat() if hasattr(entry, 'date') and isinstance(entry.date, date) else entry.get('date')
                    }
                    for entry in data['conservation_history']
                ]

            response = self.supabase.table("preservation_records")\
                .update(data)\
                .eq("id", str(record_id))\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Preservation record not found"
                )

            return PreservationResponse(**response.data[0])
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error updating preservation record: {str(e)}"
            )

    async def delete_preservation_record(self, record_id: UUID):
        """Delete a preservation record"""
        try:
            response = self.supabase.table("preservation_records")\
                .delete()\
                .eq("id", str(record_id))\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Preservation record not found"
                )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting preservation record: {str(e)}"
            )

    async def get_preservation_statistics(self) -> PreservationStatistics:
        """Get preservation statistics for dashboard"""
        try:
            # Total records
            total_response = self.supabase.table("preservation_records")\
                .select("*", count="exact")\
                .execute()
            total = total_response.count or 0

            # By condition - use RPC function if available, otherwise fallback to manual
            by_condition = {}
            try:
                condition_response = self.supabase.rpc('get_preservation_by_condition').execute()
                by_condition = {row['condition_status']: row['count'] for row in condition_response.data}
            except:
                # Fallback: manually count each condition
                for status in ['excellent', 'good', 'fair', 'poor', 'critical']:
                    count_response = self.supabase.table("preservation_records")\
                        .select("*", count="exact")\
                        .eq("condition_status", status)\
                        .execute()
                    by_condition[status] = count_response.count or 0

            # Needs restoration
            restoration_response = self.supabase.table("preservation_records")\
                .select("*", count="exact")\
                .eq("restoration_needed", True)\
                .execute()
            needs_restoration = restoration_response.count or 0

            # Urgent restoration
            urgent_response = self.supabase.table("preservation_records")\
                .select("*", count="exact")\
                .eq("restoration_needed", True)\
                .eq("restoration_priority", "urgent")\
                .execute()
            urgent_restoration = urgent_response.count or 0

            # Upcoming inspections (next 30 days)
            today = date.today()
            future_date = (today + timedelta(days=30)).isoformat()
            upcoming_response = self.supabase.table("preservation_records")\
                .select("*", count="exact")\
                .gte("next_inspection_date", today.isoformat())\
                .lte("next_inspection_date", future_date)\
                .execute()
            upcoming_inspections = upcoming_response.count or 0

            # Overdue inspections
            overdue_response = self.supabase.table("preservation_records")\
                .select("*", count="exact")\
                .lt("next_inspection_date", today.isoformat())\
                .execute()
            overdue_inspections = overdue_response.count or 0

            # Calculate average condition score
            condition_scores = {
                'excellent': 100,
                'good': 75,
                'fair': 50,
                'poor': 25,
                'critical': 0
            }
            total_score = sum(by_condition.get(status, 0) * score for status, score in condition_scores.items())
            average_score = total_score / total if total > 0 else 0

            return PreservationStatistics(
                total_records=total,
                by_condition=by_condition,
                needs_restoration=needs_restoration,
                urgent_restoration=urgent_restoration,
                upcoming_inspections=upcoming_inspections,
                overdue_inspections=overdue_inspections,
                average_condition_score=round(average_score, 2)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error calculating preservation statistics: {str(e)}"
            )
