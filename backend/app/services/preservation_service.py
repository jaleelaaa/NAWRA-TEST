"""
Preservation Service

Service for managing preservation records and conservation tracking
"""

from datetime import datetime, date, timedelta
from typing import Optional, List, Dict, Any
from uuid import UUID
import json

from app.db import get_supabase
from app.models.preservation import (
    PreservationCondition,
    ConservationPriority,
    PreservationActionType,
    DamageType,
    PreservationRecordCreate,
    PreservationRecordUpdate,
    PreservationRecordResponse,
    PreservationRecordFilters,
    PreservationRecordListResponse,
    ConservationWorkCreate,
    ConservationWorkResponse,
    PreservationStatistics,
    PreservationScheduleCreate,
    PreservationScheduleResponse,
)


class PreservationService:
    """Service for preservation record management"""

    def __init__(self):
        self._supabase = None
        self.table_name = "preservation_records"
        self.conservation_table = "conservation_work"
        self.schedule_table = "preservation_schedule"

    @property
    def supabase(self):
        """Lazy initialization of Supabase client"""
        if self._supabase is None:
            self._supabase = get_supabase()
        return self._supabase

    async def create_record(
        self, record: PreservationRecordCreate
    ) -> Optional[PreservationRecordResponse]:
        """
        Create a new preservation record

        Args:
            record: Preservation record data

        Returns:
            Created preservation record or None
        """
        try:
            record_data = {
                "book_id": str(record.book_id),
                "inspection_date": record.inspection_date.isoformat(),
                "inspector_name": record.inspector_name,
                "inspector_id": str(record.inspector_id) if record.inspector_id else None,
                "overall_condition": record.overall_condition.value,
                "priority": record.priority.value,
                "damage_types": [dt.value for dt in record.damage_types],
                "damage_description": record.damage_description,
                "damage_description_ar": record.damage_description_ar,
                "pages_total": record.pages_total,
                "pages_damaged": record.pages_damaged,
                "pages_missing": record.pages_missing,
                "binding_condition": record.binding_condition,
                "temperature": record.temperature,
                "humidity": record.humidity,
                "light_exposure": record.light_exposure,
                "requires_conservation": record.requires_conservation,
                "conservation_notes": record.conservation_notes,
                "conservation_notes_ar": record.conservation_notes_ar,
                "estimated_cost": record.estimated_cost,
                "estimated_time_hours": record.estimated_time_hours,
                "recommended_actions": [a.value for a in record.recommended_actions],
                "action_timeline": record.action_timeline,
                "special_storage_required": record.special_storage_required,
                "storage_requirements": record.storage_requirements,
                "handling_instructions": record.handling_instructions,
                "handling_instructions_ar": record.handling_instructions_ar,
                "photos_taken": record.photos_taken,
                "photo_urls": record.photo_urls,
                "notes": record.notes,
                "notes_ar": record.notes_ar,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            result = self.supabase.table(self.table_name).insert(record_data).execute()

            if result.data:
                enriched = await self._enrich_records([result.data[0]])
                return PreservationRecordResponse(**enriched[0])

            return None

        except Exception as e:
            print(f"Failed to create preservation record: {str(e)}")
            return None

    async def get_record(self, record_id: UUID) -> Optional[PreservationRecordResponse]:
        """Get preservation record by ID"""
        try:
            result = self.supabase.table(self.table_name).select(
                "*"
            ).eq("id", str(record_id)).execute()

            if result.data:
                enriched = await self._enrich_records(result.data)
                return PreservationRecordResponse(**enriched[0])

            return None

        except Exception as e:
            print(f"Failed to fetch preservation record: {str(e)}")
            return None

    async def get_records(
        self, filters: PreservationRecordFilters
    ) -> PreservationRecordListResponse:
        """
        Get preservation records with filters and pagination

        Args:
            filters: Filter criteria

        Returns:
            Paginated preservation records
        """
        try:
            query = self.supabase.table(self.table_name).select("*", count="exact")

            # Apply filters
            if filters.book_id:
                query = query.eq("book_id", str(filters.book_id))

            if filters.inspector_id:
                query = query.eq("inspector_id", str(filters.inspector_id))

            if filters.condition:
                query = query.eq("overall_condition", filters.condition.value)

            if filters.priority:
                query = query.eq("priority", filters.priority.value)

            if filters.requires_conservation is not None:
                query = query.eq("requires_conservation", filters.requires_conservation)

            if filters.from_date:
                query = query.gte("inspection_date", filters.from_date.isoformat())

            if filters.to_date:
                query = query.lte("inspection_date", filters.to_date.isoformat())

            if filters.search:
                query = query.or_(
                    f"damage_description.ilike.%{filters.search}%,"
                    f"conservation_notes.ilike.%{filters.search}%,"
                    f"notes.ilike.%{filters.search}%"
                )

            # Sorting
            query = query.order(
                filters.sort_by,
                desc=(filters.sort_order == "desc")
            )

            # Pagination
            start = (filters.page - 1) * filters.page_size
            end = start + filters.page_size - 1
            query = query.range(start, end)

            result = query.execute()

            total = result.count if hasattr(result, 'count') else 0
            items = result.data if result.data else []

            enriched_items = await self._enrich_records(items)

            total_pages = (total + filters.page_size - 1) // filters.page_size

            return PreservationRecordListResponse(
                items=[PreservationRecordResponse(**item) for item in enriched_items],
                total=total,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=total_pages,
            )

        except Exception as e:
            print(f"Failed to fetch preservation records: {str(e)}")
            return PreservationRecordListResponse(
                items=[],
                total=0,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=0,
            )

    async def update_record(
        self, record_id: UUID, update: PreservationRecordUpdate
    ) -> Optional[PreservationRecordResponse]:
        """Update preservation record"""
        try:
            update_data = update.model_dump(exclude_unset=True)

            # Convert enums to values
            if 'overall_condition' in update_data:
                update_data['overall_condition'] = update_data['overall_condition'].value
            if 'priority' in update_data:
                update_data['priority'] = update_data['priority'].value
            if 'damage_types' in update_data:
                update_data['damage_types'] = [dt.value for dt in update_data['damage_types']]
            if 'recommended_actions' in update_data:
                update_data['recommended_actions'] = [a.value for a in update_data['recommended_actions']]

            # Convert dates
            if 'inspection_date' in update_data:
                update_data['inspection_date'] = update_data['inspection_date'].isoformat()

            # Convert UUIDs
            if 'inspector_id' in update_data and update_data['inspector_id']:
                update_data['inspector_id'] = str(update_data['inspector_id'])

            update_data['updated_at'] = datetime.utcnow().isoformat()

            result = self.supabase.table(self.table_name).update(
                update_data
            ).eq("id", str(record_id)).execute()

            if result.data:
                enriched = await self._enrich_records(result.data)
                return PreservationRecordResponse(**enriched[0])

            return None

        except Exception as e:
            print(f"Failed to update preservation record: {str(e)}")
            return None

    async def delete_record(self, record_id: UUID) -> bool:
        """Delete preservation record"""
        try:
            result = self.supabase.table(self.table_name).delete().eq(
                "id", str(record_id)
            ).execute()

            return len(result.data) > 0 if result.data else False

        except Exception as e:
            print(f"Failed to delete preservation record: {str(e)}")
            return False

    async def _enrich_records(self, records: List[Dict]) -> List[Dict]:
        """Enrich preservation records with book information"""
        try:
            # Get unique book IDs
            book_ids = list(set(
                record.get('book_id') for record in records
                if record.get('book_id')
            ))

            # Fetch book information
            books_map = {}
            if book_ids:
                books_result = self.supabase.table("books").select(
                    "id, title, title_ar, author"
                ).in_("id", book_ids).execute()

                if books_result.data:
                    books_map = {
                        book['id']: book
                        for book in books_result.data
                    }

            # Enrich records
            enriched = []
            for record in records:
                enriched_record = record.copy()

                if record.get('book_id') and record['book_id'] in books_map:
                    book = books_map[record['book_id']]
                    enriched_record['book_title'] = book.get('title')
                    enriched_record['book_title_ar'] = book.get('title_ar')
                    enriched_record['book_author'] = book.get('author')

                enriched.append(enriched_record)

            return enriched

        except Exception as e:
            print(f"Failed to enrich preservation records: {str(e)}")
            return records

    async def get_statistics(
        self,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None
    ) -> PreservationStatistics:
        """Get preservation statistics"""
        try:
            today = date.today()
            from_date = from_date or (today - timedelta(days=365))
            to_date = to_date or today

            # Get all records in date range
            result = self.supabase.table(self.table_name).select(
                "*"
            ).gte("inspection_date", from_date.isoformat()).lte(
                "inspection_date", to_date.isoformat()
            ).execute()

            records = result.data if result.data else []

            # Calculate statistics
            total_records = len(records)

            month_start = today.replace(day=1)
            inspections_this_month = len([
                r for r in records
                if date.fromisoformat(r['inspection_date']) >= month_start
            ])

            items_requiring_conservation = len([
                r for r in records
                if r.get('requires_conservation', False)
            ])

            # By condition
            by_condition = {}
            for record in records:
                condition = record.get('overall_condition', 'unknown')
                by_condition[condition] = by_condition.get(condition, 0) + 1

            # By priority
            by_priority = {}
            for record in records:
                priority = record.get('priority', 'unknown')
                by_priority[priority] = by_priority.get(priority, 0) + 1

            # By damage type
            by_damage_type = {}
            for record in records:
                damage_types = record.get('damage_types', [])
                for damage_type in damage_types:
                    by_damage_type[damage_type] = by_damage_type.get(damage_type, 0) + 1

            # Critical and urgent items
            critical_items = [
                r for r in records
                if r.get('overall_condition') == 'critical'
            ][:10]

            urgent_items = [
                r for r in records
                if r.get('priority') in ['urgent', 'immediate']
            ][:10]

            enriched_critical = await self._enrich_records(critical_items)
            enriched_urgent = await self._enrich_records(urgent_items)

            # Budget estimates
            estimated_conservation_cost = sum(
                r.get('estimated_cost', 0) or 0
                for r in records
                if r.get('requires_conservation')
            )

            estimated_conservation_hours = sum(
                r.get('estimated_time_hours', 0) or 0
                for r in records
                if r.get('requires_conservation')
            )

            return PreservationStatistics(
                total_records=total_records,
                inspections_this_month=inspections_this_month,
                items_requiring_conservation=items_requiring_conservation,
                by_condition=by_condition,
                by_priority=by_priority,
                by_damage_type=by_damage_type,
                active_conservation_projects=0,  # Will implement with conservation_work table
                completed_conservation_this_month=0,
                total_conservation_cost=0,
                critical_items=[PreservationRecordResponse(**r) for r in enriched_critical],
                urgent_items=[PreservationRecordResponse(**r) for r in enriched_urgent],
                estimated_conservation_cost=estimated_conservation_cost,
                estimated_conservation_hours=estimated_conservation_hours,
            )

        except Exception as e:
            print(f"Failed to get preservation statistics: {str(e)}")
            return PreservationStatistics(
                total_records=0,
                inspections_this_month=0,
                items_requiring_conservation=0,
                by_condition={},
                by_priority={},
                by_damage_type={},
                active_conservation_projects=0,
                completed_conservation_this_month=0,
                total_conservation_cost=0,
                critical_items=[],
                urgent_items=[],
                estimated_conservation_cost=0,
                estimated_conservation_hours=0,
            )


# Create singleton instance
preservation_service = PreservationService()
