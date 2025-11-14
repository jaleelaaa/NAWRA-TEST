"""
Location Service - Business logic for location management.
Phase 3 - Enhanced Features (Day 12)
"""
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from supabase import Client
from fastapi import HTTPException, status

from ..models.locations import (
    LocationCreate,
    LocationUpdate,
    LocationResponse,
    LocationWithHierarchy,
    LocationListResponse,
    LocationTreeNode,
    LocationStatistics,
    LocationHistoryCreate,
    LocationHistoryResponse,
    LocationHistoryListResponse,
    LocationFilters,
    LocationHistoryFilters,
    BulkLocationMove,
    BulkLocationMoveResponse,
    LocationType,
)


class LocationService:
    """Service for location management operations."""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def create_location(
        self,
        location: LocationCreate
    ) -> LocationResponse:
        """Create a new location."""
        try:
            # Check if code already exists
            existing = self.supabase.table("locations")\
                .select("id")\
                .eq("code", location.code)\
                .execute()

            if existing.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Location with code '{location.code}' already exists"
                )

            # Validate parent location if specified
            if location.parent_id:
                parent = self.supabase.table("locations")\
                    .select("id, location_type")\
                    .eq("id", str(location.parent_id))\
                    .single()\
                    .execute()

                if not parent.data:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Parent location not found"
                    )

            # Create location
            data = location.dict()
            if data.get('parent_id'):
                data['parent_id'] = str(data['parent_id'])

            response = self.supabase.table("locations").insert(data).execute()

            if response.data:
                return await self.get_location(UUID(response.data[0]['id']))

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create location"
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating location: {str(e)}"
            )

    async def get_location(self, location_id: UUID) -> LocationResponse:
        """Get location by ID."""
        response = self.supabase.table("locations")\
            .select("*")\
            .eq("id", str(location_id))\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )

        location_data = response.data

        # Get parent name if exists
        if location_data.get('parent_id'):
            parent = self.supabase.table("locations")\
                .select("name")\
                .eq("id", location_data['parent_id'])\
                .single()\
                .execute()
            if parent.data:
                location_data['parent_name'] = parent.data.get('name')

        # Count children
        children = self.supabase.table("locations")\
            .select("id", count="exact")\
            .eq("parent_id", str(location_id))\
            .execute()
        location_data['children_count'] = children.count or 0

        # Calculate utilization percentage
        if location_data.get('capacity') and location_data.get('capacity') > 0:
            location_data['utilization_percentage'] = round(
                (location_data.get('current_count', 0) / location_data['capacity']) * 100,
                2
            )

        return LocationResponse(**location_data)

    async def get_location_with_hierarchy(
        self,
        location_id: UUID
    ) -> LocationWithHierarchy:
        """Get location with full hierarchy (ancestors and children)."""
        location = await self.get_location(location_id)

        # Get ancestors (traverse up)
        ancestors = []
        current_parent_id = location.parent_id
        while current_parent_id:
            parent = await self.get_location(current_parent_id)
            ancestors.insert(0, parent)  # Insert at beginning to maintain order
            current_parent_id = parent.parent_id

        # Get direct children
        children_response = self.supabase.table("locations")\
            .select("*")\
            .eq("parent_id", str(location_id))\
            .eq("is_active", True)\
            .order("code")\
            .execute()

        children = [LocationResponse(**child) for child in children_response.data]

        # Count books in this location
        books = self.supabase.table("books")\
            .select("id", count="exact")\
            .eq("location_id", str(location_id))\
            .execute()

        return LocationWithHierarchy(
            **location.dict(),
            ancestors=ancestors,
            children=children,
            book_count=books.count or 0
        )

    async def list_locations(self, filters: LocationFilters) -> LocationListResponse:
        """List locations with filters and pagination."""
        offset = (filters.page - 1) * filters.page_size

        # Build query
        query = self.supabase.table("locations").select("*", count="exact")

        # Apply filters
        if filters.search:
            # Search in name, code, or description
            query = query.or_(
                f"name.ilike.%{filters.search}%,"
                f"code.ilike.%{filters.search}%,"
                f"description.ilike.%{filters.search}%"
            )

        if filters.location_type:
            query = query.eq("location_type", filters.location_type.value)

        if filters.parent_id:
            query = query.eq("parent_id", str(filters.parent_id))

        if filters.is_active is not None:
            query = query.eq("is_active", filters.is_active)

        if filters.is_restricted is not None:
            query = query.eq("is_restricted", filters.is_restricted)

        if filters.has_climate_control is not None:
            query = query.eq("has_climate_control", filters.has_climate_control)

        if filters.has_capacity:
            query = query.not_.is_("capacity", "null")

        if filters.over_capacity:
            # PostgreSQL: current_count > capacity
            query = query.filter("current_count", "gt", "capacity")

        # Sorting
        order_col = filters.sort_by
        if filters.sort_order == "desc":
            order_col += ".desc"

        # Execute query with pagination
        response = query.range(offset, offset + filters.page_size - 1)\
            .order(order_col)\
            .execute()

        # Enrich locations with additional data
        locations = []
        for loc_data in response.data:
            # Get parent name
            if loc_data.get('parent_id'):
                parent = self.supabase.table("locations")\
                    .select("name")\
                    .eq("id", loc_data['parent_id'])\
                    .single()\
                    .execute()
                if parent.data:
                    loc_data['parent_name'] = parent.data.get('name')

            # Count children
            children = self.supabase.table("locations")\
                .select("id", count="exact")\
                .eq("parent_id", loc_data['id'])\
                .execute()
            loc_data['children_count'] = children.count or 0

            # Calculate utilization
            if loc_data.get('capacity') and loc_data.get('capacity') > 0:
                loc_data['utilization_percentage'] = round(
                    (loc_data.get('current_count', 0) / loc_data['capacity']) * 100,
                    2
                )

            locations.append(LocationResponse(**loc_data))

        total = response.count or 0
        total_pages = (total + filters.page_size - 1) // filters.page_size

        return LocationListResponse(
            data=locations,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages
        )

    async def update_location(
        self,
        location_id: UUID,
        update: LocationUpdate
    ) -> LocationResponse:
        """Update location."""
        # Check if location exists
        await self.get_location(location_id)

        # Check if new code conflicts
        if update.code:
            existing = self.supabase.table("locations")\
                .select("id")\
                .eq("code", update.code)\
                .neq("id", str(location_id))\
                .execute()

            if existing.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Location with code '{update.code}' already exists"
                )

        # Validate new parent location
        if update.parent_id:
            if str(update.parent_id) == str(location_id):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Location cannot be its own parent"
                )

            parent = self.supabase.table("locations")\
                .select("id")\
                .eq("id", str(update.parent_id))\
                .execute()

            if not parent.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Parent location not found"
                )

        # Update location
        data = update.dict(exclude_unset=True)
        if 'parent_id' in data and data['parent_id']:
            data['parent_id'] = str(data['parent_id'])

        data['updated_at'] = datetime.utcnow().isoformat()

        response = self.supabase.table("locations")\
            .update(data)\
            .eq("id", str(location_id))\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )

        return await self.get_location(location_id)

    async def delete_location(self, location_id: UUID):
        """Delete location (only if empty)."""
        location = await self.get_location(location_id)

        # Check if location has books
        books = self.supabase.table("books")\
            .select("id", count="exact")\
            .eq("location_id", str(location_id))\
            .execute()

        if books.count and books.count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete location with {books.count} books. Move books first."
            )

        # Check if location has children
        children = self.supabase.table("locations")\
            .select("id", count="exact")\
            .eq("parent_id", str(location_id))\
            .execute()

        if children.count and children.count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete location with {children.count} child locations."
            )

        # Delete location
        response = self.supabase.table("locations")\
            .delete()\
            .eq("id", str(location_id))\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location not found"
            )

    async def get_location_tree(
        self,
        parent_id: Optional[UUID] = None
    ) -> List[LocationTreeNode]:
        """Get location tree structure."""
        # Get locations at this level
        query = self.supabase.table("locations")\
            .select("*")\
            .eq("is_active", True)\
            .order("code")

        if parent_id:
            query = query.eq("parent_id", str(parent_id))
        else:
            query = query.is_("parent_id", "null")

        response = query.execute()

        # Build tree nodes recursively
        tree = []
        for loc in response.data:
            # Get children recursively
            children = await self.get_location_tree(UUID(loc['id']))

            tree.append(LocationTreeNode(
                id=loc['id'],
                name=loc['name'],
                name_ar=loc.get('name_ar'),
                code=loc['code'],
                location_type=loc['location_type'],
                current_count=loc.get('current_count', 0),
                capacity=loc.get('capacity'),
                children=children
            ))

        return tree

    async def get_statistics(self) -> LocationStatistics:
        """Get location statistics."""
        # Total locations
        total_response = self.supabase.table("locations")\
            .select("*", count="exact")\
            .eq("is_active", True)\
            .execute()
        total = total_response.count or 0

        # By type
        by_type = {}
        for loc_type in LocationType:
            type_response = self.supabase.table("locations")\
                .select("*", count="exact")\
                .eq("location_type", loc_type.value)\
                .eq("is_active", True)\
                .execute()
            by_type[loc_type.value] = type_response.count or 0

        # Capacity statistics
        capacity_response = self.supabase.table("locations")\
            .select("capacity, current_count")\
            .not_.is_("capacity", "null")\
            .eq("is_active", True)\
            .execute()

        total_capacity = sum(loc.get('capacity', 0) for loc in capacity_response.data)
        total_occupied = sum(loc.get('current_count', 0) for loc in capacity_response.data)
        utilization = (total_occupied / total_capacity * 100) if total_capacity > 0 else 0

        # Over capacity count
        over_capacity = sum(
            1 for loc in capacity_response.data
            if loc.get('current_count', 0) > loc.get('capacity', 0)
        )

        # Restricted locations
        restricted_response = self.supabase.table("locations")\
            .select("*", count="exact")\
            .eq("is_restricted", True)\
            .eq("is_active", True)\
            .execute()
        restricted = restricted_response.count or 0

        # Climate controlled
        climate_response = self.supabase.table("locations")\
            .select("*", count="exact")\
            .eq("has_climate_control", True)\
            .eq("is_active", True)\
            .execute()
        climate = climate_response.count or 0

        # Most and least utilized
        most_utilized = [
            {
                'id': loc['id'],
                'name': loc['name'],
                'code': loc['code'],
                'utilization': round((loc['current_count'] / loc['capacity']) * 100, 2) if loc.get('capacity') else 0
            }
            for loc in sorted(
                capacity_response.data,
                key=lambda x: (x['current_count'] / x['capacity']) if x.get('capacity') else 0,
                reverse=True
            )[:5]
        ]

        least_utilized = [
            {
                'id': loc['id'],
                'name': loc['name'],
                'code': loc['code'],
                'utilization': round((loc['current_count'] / loc['capacity']) * 100, 2) if loc.get('capacity') else 0
            }
            for loc in sorted(
                capacity_response.data,
                key=lambda x: (x['current_count'] / x['capacity']) if x.get('capacity') else 0
            )[:5]
        ]

        return LocationStatistics(
            total_locations=total,
            by_type=by_type,
            total_capacity=total_capacity,
            total_occupied=total_occupied,
            utilization_percentage=round(utilization, 2),
            over_capacity_count=over_capacity,
            restricted_locations=restricted,
            climate_controlled=climate,
            most_utilized=most_utilized,
            least_utilized=least_utilized
        )

    # =====================================================
    # Location History
    # =====================================================

    async def create_history_entry(
        self,
        history: LocationHistoryCreate,
        user_id: UUID
    ) -> LocationHistoryResponse:
        """Create location history entry."""
        data = history.dict()
        data['moved_by'] = str(user_id)

        # Get location names
        if data.get('from_location_id'):
            from_loc = await self.get_location(UUID(data['from_location_id']))
            data['from_location_text'] = from_loc.full_path
            data['from_location_id'] = str(data['from_location_id'])

        if data.get('to_location_id'):
            to_loc = await self.get_location(UUID(data['to_location_id']))
            data['to_location_text'] = to_loc.full_path
            data['to_location_id'] = str(data['to_location_id'])

        response = self.supabase.table("location_history").insert(data).execute()

        if response.data:
            return await self.get_history_entry(UUID(response.data[0]['id']))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create location history entry"
        )

    async def get_history_entry(self, history_id: UUID) -> LocationHistoryResponse:
        """Get location history entry by ID."""
        response = self.supabase.table("location_history")\
            .select("*, books(title, title_ar, isbn)")\
            .eq("id", str(history_id))\
            .single()\
            .execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location history entry not found"
            )

        history_data = response.data

        # Flatten book data
        if history_data.get('books'):
            history_data['book_title'] = history_data['books'].get('title')
            history_data['book_title_ar'] = history_data['books'].get('title_ar')
            history_data['book_isbn'] = history_data['books'].get('isbn')
            del history_data['books']

        # Get user name
        if history_data.get('moved_by'):
            user = self.supabase.table("users")\
                .select("full_name")\
                .eq("id", history_data['moved_by'])\
                .single()\
                .execute()
            if user.data:
                history_data['moved_by_name'] = user.data.get('full_name')

        return LocationHistoryResponse(**history_data)

    async def list_location_history(
        self,
        filters: LocationHistoryFilters
    ) -> LocationHistoryListResponse:
        """List location history with filters."""
        offset = (filters.page - 1) * filters.page_size

        # Build query
        query = self.supabase.table("location_history")\
            .select("*, books(title, title_ar, isbn)", count="exact")

        # Apply filters
        if filters.book_id:
            query = query.eq("book_id", str(filters.book_id))

        if filters.from_location_id:
            query = query.eq("from_location_id", str(filters.from_location_id))

        if filters.to_location_id:
            query = query.eq("to_location_id", str(filters.to_location_id))

        if filters.location_id:
            # Either from or to
            query = query.or_(
                f"from_location_id.eq.{filters.location_id},"
                f"to_location_id.eq.{filters.location_id}"
            )

        if filters.moved_by:
            query = query.eq("moved_by", str(filters.moved_by))

        if filters.reason:
            query = query.eq("reason", filters.reason.value)

        if filters.date_from:
            query = query.gte("moved_at", filters.date_from.isoformat())

        if filters.date_to:
            query = query.lte("moved_at", filters.date_to.isoformat())

        # Execute query
        order_col = "moved_at"
        if filters.sort_order == "desc":
            order_col += ".desc"

        response = query.range(offset, offset + filters.page_size - 1)\
            .order(order_col)\
            .execute()

        # Process results
        history_entries = []
        for entry in response.data:
            # Flatten book data
            if entry.get('books'):
                entry['book_title'] = entry['books'].get('title')
                entry['book_title_ar'] = entry['books'].get('title_ar')
                entry['book_isbn'] = entry['books'].get('isbn')
                del entry['books']

            # Get user name
            if entry.get('moved_by'):
                user = self.supabase.table("users")\
                    .select("full_name")\
                    .eq("id", entry['moved_by'])\
                    .single()\
                    .execute()
                if user.data:
                    entry['moved_by_name'] = user.data.get('full_name')

            history_entries.append(LocationHistoryResponse(**entry))

        total = response.count or 0
        total_pages = (total + filters.page_size - 1) // filters.page_size

        return LocationHistoryListResponse(
            data=history_entries,
            total=total,
            page=filters.page,
            page_size=filters.page_size,
            total_pages=total_pages
        )

    async def bulk_move_books(
        self,
        bulk_move: BulkLocationMove,
        user_id: UUID
    ) -> BulkLocationMoveResponse:
        """Move multiple books to a new location."""
        # Validate target location
        await self.get_location(bulk_move.to_location_id)

        success_count = 0
        failed_count = 0
        failed_books = []

        for book_id in bulk_move.book_ids:
            try:
                # Update book location
                response = self.supabase.table("books")\
                    .update({"location_id": str(bulk_move.to_location_id)})\
                    .eq("id", str(book_id))\
                    .execute()

                if response.data:
                    success_count += 1
                else:
                    failed_count += 1
                    failed_books.append({
                        "book_id": str(book_id),
                        "error": "Book not found"
                    })

            except Exception as e:
                failed_count += 1
                failed_books.append({
                    "book_id": str(book_id),
                    "error": str(e)
                })

        return BulkLocationMoveResponse(
            success_count=success_count,
            failed_count=failed_count,
            failed_books=failed_books,
            message=f"Moved {success_count} books successfully. {failed_count} failed."
        )
