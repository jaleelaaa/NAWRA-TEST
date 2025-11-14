"""
Books service for managing library catalog (books and categories).
"""
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, date, timedelta
from app.db.supabase_client import get_supabase
from app.models.books import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryWithCount,
    CategoryListResponse,
    BookCreate,
    BookUpdate,
    BookResponse,
    BookListItem,
    BookListResponse,
    BookFilters,
    PaginationMeta,
    BookStatus,
    BookStatistics,
    BulkBookUpdate,
    BulkBookDelete,
    BulkOperationResponse,
)


class BooksService:
    """Service for managing books and categories."""

    def __init__(self):
        """Initialize the books service."""
        self.supabase = get_supabase()

    # =====================================================
    # Category Operations
    # =====================================================

    async def get_categories(self, include_counts: bool = False) -> CategoryListResponse:
        """
        Get all categories.

        Args:
            include_counts: Whether to include book counts for each category

        Returns:
            CategoryListResponse with list of categories

        Raises:
            Exception: If failed to fetch categories
        """
        try:
            response = self.supabase.table('categories')\
                .select('*')\
                .order('name')\
                .execute()

            categories = [CategoryResponse(**cat) for cat in response.data]

            if include_counts:
                # Get book counts for each category
                categories_with_counts = []
                for cat in categories:
                    count_response = self.supabase.table('books')\
                        .select('id', count='exact')\
                        .eq('category_id', str(cat.id))\
                        .execute()

                    cat_dict = cat.model_dump()
                    cat_dict['book_count'] = count_response.count or 0
                    categories_with_counts.append(CategoryWithCount(**cat_dict))

                return CategoryListResponse(
                    items=categories_with_counts,
                    total=len(categories_with_counts)
                )
            else:
                # Convert to CategoryWithCount with 0 count
                items = [CategoryWithCount(**cat.model_dump(), book_count=0) for cat in categories]
                return CategoryListResponse(
                    items=items,
                    total=len(items)
                )

        except Exception as e:
            raise Exception(f"Failed to fetch categories: {str(e)}")

    async def get_category_by_id(self, category_id: UUID) -> Optional[CategoryResponse]:
        """
        Get a specific category by ID.

        Args:
            category_id: The category's UUID

        Returns:
            CategoryResponse or None if not found

        Raises:
            Exception: If failed to fetch category
        """
        try:
            response = self.supabase.table('categories')\
                .select('*')\
                .eq('id', str(category_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return CategoryResponse(**response.data[0])
            return None

        except Exception as e:
            raise Exception(f"Failed to fetch category: {str(e)}")

    async def create_category(self, category: CategoryCreate) -> CategoryResponse:
        """
        Create a new category.

        Args:
            category: Category data

        Returns:
            Created CategoryResponse

        Raises:
            Exception: If failed to create category
        """
        try:
            category_data = category.model_dump()

            # Convert UUID to string if parent_id exists
            if category_data.get('parent_id'):
                category_data['parent_id'] = str(category_data['parent_id'])

            response = self.supabase.table('categories')\
                .insert(category_data)\
                .execute()

            if response.data and len(response.data) > 0:
                return CategoryResponse(**response.data[0])
            else:
                raise Exception("No data returned from insert")

        except Exception as e:
            raise Exception(f"Failed to create category: {str(e)}")

    async def update_category(
        self,
        category_id: UUID,
        category: CategoryUpdate
    ) -> Optional[CategoryResponse]:
        """
        Update an existing category.

        Args:
            category_id: The category's UUID
            category: Updated category data

        Returns:
            Updated CategoryResponse or None if not found

        Raises:
            Exception: If failed to update category
        """
        try:
            # Only include fields that are set
            update_data = category.model_dump(exclude_unset=True)

            if not update_data:
                # No fields to update, fetch and return existing
                return await self.get_category_by_id(category_id)

            # Convert UUID to string if parent_id exists
            if 'parent_id' in update_data and update_data['parent_id']:
                update_data['parent_id'] = str(update_data['parent_id'])

            response = self.supabase.table('categories')\
                .update(update_data)\
                .eq('id', str(category_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return CategoryResponse(**response.data[0])
            return None

        except Exception as e:
            raise Exception(f"Failed to update category: {str(e)}")

    async def delete_category(self, category_id: UUID) -> bool:
        """
        Delete a category.

        Args:
            category_id: The category's UUID

        Returns:
            True if deleted successfully

        Raises:
            Exception: If failed to delete category or category has books
        """
        try:
            # Check if category has books
            books_response = self.supabase.table('books')\
                .select('id', count='exact')\
                .eq('category_id', str(category_id))\
                .execute()

            if books_response.count and books_response.count > 0:
                raise Exception(
                    f"Cannot delete category with {books_response.count} book(s). "
                    "Please reassign or delete books first."
                )

            # Delete the category
            response = self.supabase.table('categories')\
                .delete()\
                .eq('id', str(category_id))\
                .execute()

            return True

        except Exception as e:
            raise Exception(f"Failed to delete category: {str(e)}")

    # =====================================================
    # Book Operations
    # =====================================================

    async def get_books(self, filters: BookFilters) -> BookListResponse:
        """
        Get books with filtering, sorting, and pagination.

        Args:
            filters: BookFilters object with query parameters

        Returns:
            BookListResponse with paginated results

        Raises:
            Exception: If failed to fetch books
        """
        try:
            # Start building the query
            query = self.supabase.table('books').select('*', count='exact')

            # Apply filters
            if filters.search:
                # Search in title, author, and ISBN
                # Note: Supabase doesn't support OR directly, so we'll do multiple queries
                search_term = f"%{filters.search}%"
                query = query.or_(
                    f"title.ilike.{search_term},"
                    f"title_ar.ilike.{search_term},"
                    f"author.ilike.{search_term},"
                    f"author_ar.ilike.{search_term},"
                    f"isbn.ilike.{search_term}"
                )

            if filters.category_id:
                query = query.eq('category_id', str(filters.category_id))

            if filters.status:
                query = query.eq('status', filters.status.value)

            if filters.available_only:
                query = query.gt('available_quantity', 0)

            if filters.language:
                query = query.eq('language', filters.language)

            if filters.year_from:
                query = query.gte('publication_year', filters.year_from)

            if filters.year_to:
                query = query.lte('publication_year', filters.year_to)

            if filters.acquired_from:
                query = query.gte('acquisition_date', filters.acquired_from.isoformat())

            if filters.acquired_to:
                query = query.lte('acquisition_date', filters.acquired_to.isoformat())

            # Apply sorting
            order_column = filters.sort_by.value
            ascending = filters.sort_order.value == 'asc'
            query = query.order(order_column, desc=not ascending)

            # Calculate pagination
            offset = (filters.page - 1) * filters.page_size
            query = query.range(offset, offset + filters.page_size - 1)

            # Execute query
            response = query.execute()

            # Build response
            items = [BookListItem(**book) for book in response.data]
            total = response.count or 0
            total_pages = (total + filters.page_size - 1) // filters.page_size

            meta = PaginationMeta(
                total=total,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=total_pages,
                has_next=filters.page < total_pages,
                has_prev=filters.page > 1
            )

            return BookListResponse(items=items, meta=meta)

        except Exception as e:
            raise Exception(f"Failed to fetch books: {str(e)}")

    async def get_book_by_id(self, book_id: UUID) -> Optional[BookResponse]:
        """
        Get a specific book by ID with category information.

        Args:
            book_id: The book's UUID

        Returns:
            BookResponse or None if not found

        Raises:
            Exception: If failed to fetch book
        """
        try:
            response = self.supabase.table('books')\
                .select('*, category:categories(*)')\
                .eq('id', str(book_id))\
                .execute()

            if response.data and len(response.data) > 0:
                book_data = response.data[0]

                # Extract category if exists
                category_data = book_data.pop('category', None)
                if category_data:
                    book_data['category'] = CategoryResponse(**category_data)

                return BookResponse(**book_data)
            return None

        except Exception as e:
            raise Exception(f"Failed to fetch book: {str(e)}")

    async def create_book(self, book: BookCreate) -> BookResponse:
        """
        Create a new book.

        Args:
            book: Book data

        Returns:
            Created BookResponse

        Raises:
            Exception: If failed to create book
        """
        try:
            book_data = book.model_dump()

            # Convert UUID to string if category_id exists
            if book_data.get('category_id'):
                book_data['category_id'] = str(book_data['category_id'])

            # Convert date to ISO format
            if book_data.get('acquisition_date'):
                book_data['acquisition_date'] = book_data['acquisition_date'].isoformat()

            # Convert Decimal to float
            if book_data.get('price'):
                book_data['price'] = float(book_data['price'])

            # Convert enum to value
            if 'status' in book_data and isinstance(book_data['status'], BookStatus):
                book_data['status'] = book_data['status'].value

            response = self.supabase.table('books')\
                .insert(book_data)\
                .execute()

            if response.data and len(response.data) > 0:
                book_id = response.data[0]['id']
                return await self.get_book_by_id(UUID(book_id))
            else:
                raise Exception("No data returned from insert")

        except Exception as e:
            raise Exception(f"Failed to create book: {str(e)}")

    async def update_book(
        self,
        book_id: UUID,
        book: BookUpdate
    ) -> Optional[BookResponse]:
        """
        Update an existing book.

        Args:
            book_id: The book's UUID
            book: Updated book data

        Returns:
            Updated BookResponse or None if not found

        Raises:
            Exception: If failed to update book
        """
        try:
            # Only include fields that are set
            update_data = book.model_dump(exclude_unset=True)

            if not update_data:
                # No fields to update, fetch and return existing
                return await self.get_book_by_id(book_id)

            # Convert UUID to string if category_id exists
            if 'category_id' in update_data and update_data['category_id']:
                update_data['category_id'] = str(update_data['category_id'])

            # Convert date to ISO format
            if 'acquisition_date' in update_data and update_data['acquisition_date']:
                update_data['acquisition_date'] = update_data['acquisition_date'].isoformat()

            # Convert Decimal to float
            if 'price' in update_data and update_data['price']:
                update_data['price'] = float(update_data['price'])

            # Convert enum to value
            if 'status' in update_data and isinstance(update_data['status'], BookStatus):
                update_data['status'] = update_data['status'].value

            response = self.supabase.table('books')\
                .update(update_data)\
                .eq('id', str(book_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return await self.get_book_by_id(book_id)
            return None

        except Exception as e:
            raise Exception(f"Failed to update book: {str(e)}")

    async def delete_book(self, book_id: UUID) -> bool:
        """
        Delete a book.

        Args:
            book_id: The book's UUID

        Returns:
            True if deleted successfully

        Raises:
            Exception: If failed to delete book
        """
        try:
            # TODO: Check if book has active circulation records
            # For now, just delete
            response = self.supabase.table('books')\
                .delete()\
                .eq('id', str(book_id))\
                .execute()

            return True

        except Exception as e:
            raise Exception(f"Failed to delete book: {str(e)}")

    # =====================================================
    # Inventory Management
    # =====================================================

    async def update_quantity(
        self,
        book_id: UUID,
        quantity_change: int,
        update_available: bool = True
    ) -> Optional[BookResponse]:
        """
        Update book quantity (e.g., when adding/removing copies).

        Args:
            book_id: The book's UUID
            quantity_change: Change in quantity (positive or negative)
            update_available: Whether to also update available_quantity

        Returns:
            Updated BookResponse or None if not found

        Raises:
            Exception: If failed to update quantity or would result in negative
        """
        try:
            # Get current book
            book = await self.get_book_by_id(book_id)
            if not book:
                return None

            new_quantity = book.quantity + quantity_change
            if new_quantity < 0:
                raise Exception("Quantity cannot be negative")

            update_data = {'quantity': new_quantity}

            if update_available:
                new_available = book.available_quantity + quantity_change
                if new_available < 0:
                    raise Exception("Available quantity cannot be negative")
                if new_available > new_quantity:
                    raise Exception("Available quantity cannot exceed total quantity")
                update_data['available_quantity'] = new_available

            response = self.supabase.table('books')\
                .update(update_data)\
                .eq('id', str(book_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return await self.get_book_by_id(book_id)
            return None

        except Exception as e:
            raise Exception(f"Failed to update quantity: {str(e)}")

    async def check_availability(self, book_id: UUID, required_quantity: int = 1) -> bool:
        """
        Check if a book is available in required quantity.

        Args:
            book_id: The book's UUID
            required_quantity: Required number of copies

        Returns:
            True if available, False otherwise

        Raises:
            Exception: If failed to check availability
        """
        try:
            book = await self.get_book_by_id(book_id)
            if not book:
                return False

            return (
                book.status == BookStatus.AVAILABLE and
                book.available_quantity >= required_quantity
            )

        except Exception as e:
            raise Exception(f"Failed to check availability: {str(e)}")

    # =====================================================
    # Bulk Operations
    # =====================================================

    async def bulk_update_books(self, bulk_update: BulkBookUpdate) -> BulkOperationResponse:
        """
        Update multiple books at once.

        Args:
            bulk_update: BulkBookUpdate with book IDs and updates

        Returns:
            BulkOperationResponse with success status

        Raises:
            Exception: If failed to update books
        """
        try:
            update_data = bulk_update.updates.model_dump(exclude_unset=True)

            if not update_data:
                return BulkOperationResponse(
                    success=True,
                    affected_count=0,
                    message="No fields to update"
                )

            # Convert types as needed
            if 'category_id' in update_data and update_data['category_id']:
                update_data['category_id'] = str(update_data['category_id'])
            if 'acquisition_date' in update_data and update_data['acquisition_date']:
                update_data['acquisition_date'] = update_data['acquisition_date'].isoformat()
            if 'price' in update_data and update_data['price']:
                update_data['price'] = float(update_data['price'])
            if 'status' in update_data and isinstance(update_data['status'], BookStatus):
                update_data['status'] = update_data['status'].value

            # Update books one by one (Supabase doesn't support bulk updates with IN clause)
            affected_count = 0
            errors = []

            for book_id in bulk_update.book_ids:
                try:
                    response = self.supabase.table('books')\
                        .update(update_data)\
                        .eq('id', str(book_id))\
                        .execute()

                    if response.data and len(response.data) > 0:
                        affected_count += 1
                except Exception as e:
                    errors.append(f"Book {book_id}: {str(e)}")

            return BulkOperationResponse(
                success=len(errors) == 0,
                affected_count=affected_count,
                message=f"Updated {affected_count} of {len(bulk_update.book_ids)} books",
                errors=errors if errors else None
            )

        except Exception as e:
            raise Exception(f"Failed to bulk update books: {str(e)}")

    async def bulk_delete_books(self, bulk_delete: BulkBookDelete) -> BulkOperationResponse:
        """
        Delete multiple books at once.

        Args:
            bulk_delete: BulkBookDelete with book IDs

        Returns:
            BulkOperationResponse with success status

        Raises:
            Exception: If failed to delete books
        """
        try:
            affected_count = 0
            errors = []

            for book_id in bulk_delete.book_ids:
                try:
                    response = self.supabase.table('books')\
                        .delete()\
                        .eq('id', str(book_id))\
                        .execute()
                    affected_count += 1
                except Exception as e:
                    errors.append(f"Book {book_id}: {str(e)}")

            return BulkOperationResponse(
                success=len(errors) == 0,
                affected_count=affected_count,
                message=f"Deleted {affected_count} of {len(bulk_delete.book_ids)} books",
                errors=errors if errors else None
            )

        except Exception as e:
            raise Exception(f"Failed to bulk delete books: {str(e)}")

    # =====================================================
    # Statistics
    # =====================================================

    async def get_statistics(self) -> BookStatistics:
        """
        Get book statistics.

        Returns:
            BookStatistics object

        Raises:
            Exception: If failed to fetch statistics
        """
        try:
            # Get total books and copies
            all_books = self.supabase.table('books').select('*').execute()
            books_data = all_books.data

            total_books = len(books_data)
            total_copies = sum(book.get('quantity', 0) for book in books_data)
            available_copies = sum(book.get('available_quantity', 0) for book in books_data)

            # Count by status
            status_counts = {}
            for book in books_data:
                status = book.get('status', 'available')
                status_counts[status] = status_counts.get(status, 0) + 1

            # Count by category
            category_counts = {}
            for book in books_data:
                cat_id = book.get('category_id')
                if cat_id:
                    category_counts[cat_id] = category_counts.get(cat_id, 0) + 1

            # Get category names
            by_category = []
            for cat_id, count in category_counts.items():
                cat_response = self.supabase.table('categories')\
                    .select('name, name_ar')\
                    .eq('id', cat_id)\
                    .execute()
                if cat_response.data and len(cat_response.data) > 0:
                    cat_name = cat_response.data[0].get('name', 'Unknown')
                    by_category.append({'category': cat_name, 'count': count})

            # Count by language
            language_counts = {}
            for book in books_data:
                lang = book.get('language', 'en')
                language_counts[lang] = language_counts.get(lang, 0) + 1

            by_language = [{'language': lang, 'count': count} for lang, count in language_counts.items()]

            # Count by status
            by_status = [{'status': status, 'count': count} for status, count in status_counts.items()]

            # Recent additions (last 30 days)
            thirty_days_ago = (datetime.now() - timedelta(days=30)).isoformat()
            recent_response = self.supabase.table('books')\
                .select('id', count='exact')\
                .gte('created_at', thirty_days_ago)\
                .execute()
            recent_additions = recent_response.count or 0

            return BookStatistics(
                total_books=total_books,
                total_copies=total_copies,
                available_copies=available_copies,
                checked_out=status_counts.get('checked_out', 0),
                reserved=status_counts.get('reserved', 0),
                damaged=status_counts.get('damaged', 0),
                lost=status_counts.get('lost', 0),
                by_category=by_category,
                by_language=by_language,
                by_status=by_status,
                recent_additions=recent_additions
            )

        except Exception as e:
            raise Exception(f"Failed to fetch statistics: {str(e)}")
