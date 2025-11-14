"""
Books and categories management endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from fastapi.responses import Response
from typing import Optional
from uuid import UUID
from app.models.books import (
    # Category models
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    # Book models
    BookCreate,
    BookUpdate,
    BookResponse,
    BookListResponse,
    BookFilters,
    BookStatistics,
    BookSortField,
    SortOrder,
    BookStatus,
    # Bulk operations
    BulkBookUpdate,
    BulkBookDelete,
    BulkOperationResponse,
)
from app.services.books_service import BooksService
from app.services.barcode_service import get_barcode_service
from datetime import date


router = APIRouter()


def get_books_service() -> BooksService:
    """Dependency to get books service instance."""
    return BooksService()


# =====================================================
# Category Endpoints
# =====================================================

@router.get(
    "/categories",
    response_model=CategoryListResponse,
    summary="Get all categories",
    tags=["Categories"]
)
async def get_categories(
    include_counts: bool = Query(False, description="Include book counts for each category"),
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get all library categories.

    Args:
        include_counts: Whether to include book counts for each category

    Returns:
        CategoryListResponse with list of all categories
    """
    try:
        categories = await books_service.get_categories(include_counts=include_counts)
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )


@router.get(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Get category by ID",
    tags=["Categories"]
)
async def get_category(
    category_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get a specific category by ID.

    Args:
        category_id: The category's UUID

    Returns:
        CategoryResponse object

    Raises:
        404: Category not found
    """
    try:
        category = await books_service.get_category_by_id(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {category_id} not found"
            )
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch category: {str(e)}"
        )


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new category",
    tags=["Categories"]
)
async def create_category(
    category: CategoryCreate,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Create a new library category.

    Args:
        category: Category creation data

    Returns:
        Created CategoryResponse object

    Raises:
        400: Invalid category data
        500: Failed to create category
    """
    try:
        new_category = await books_service.create_category(category)
        return new_category
    except Exception as e:
        # Check for unique constraint violations
        if 'unique' in str(e).lower() or 'duplicate' in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name or Dewey Decimal already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create category: {str(e)}"
        )


@router.put(
    "/categories/{category_id}",
    response_model=CategoryResponse,
    summary="Update a category",
    tags=["Categories"]
)
async def update_category(
    category_id: UUID,
    category: CategoryUpdate,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Update an existing category.

    Args:
        category_id: The category's UUID
        category: Updated category data

    Returns:
        Updated CategoryResponse object

    Raises:
        404: Category not found
        400: Invalid update data
        500: Failed to update category
    """
    try:
        updated_category = await books_service.update_category(category_id, category)
        if not updated_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category {category_id} not found"
            )
        return updated_category
    except HTTPException:
        raise
    except Exception as e:
        if 'unique' in str(e).lower() or 'duplicate' in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category name or Dewey Decimal already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update category: {str(e)}"
        )


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a category",
    tags=["Categories"]
)
async def delete_category(
    category_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Delete a category.

    Args:
        category_id: The category's UUID

    Returns:
        204 No Content on success

    Raises:
        404: Category not found
        400: Category has books (cannot delete)
        500: Failed to delete category
    """
    try:
        await books_service.delete_category(category_id)
        return None
    except Exception as e:
        error_msg = str(e).lower()
        if 'cannot delete' in error_msg or 'has books' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete category: {str(e)}"
        )


# =====================================================
# Book Endpoints
# =====================================================

@router.get(
    "/books",
    response_model=BookListResponse,
    summary="Get books with filters",
    tags=["Books"]
)
async def get_books(
    # Search and filters
    search: Optional[str] = Query(None, description="Search in title, author, ISBN"),
    category_id: Optional[UUID] = Query(None, description="Filter by category"),
    status: Optional[BookStatus] = Query(None, description="Filter by status"),
    available_only: Optional[bool] = Query(None, description="Show only available books"),
    language: Optional[str] = Query(None, description="Filter by language"),
    year_from: Optional[int] = Query(None, ge=1000, le=9999, description="Publication year from"),
    year_to: Optional[int] = Query(None, ge=1000, le=9999, description="Publication year to"),
    acquired_from: Optional[date] = Query(None, description="Acquisition date from"),
    acquired_to: Optional[date] = Query(None, description="Acquisition date to"),

    # Sorting
    sort_by: BookSortField = Query(BookSortField.CREATED_AT, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order"),

    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),

    books_service: BooksService = Depends(get_books_service)
):
    """
    Get books with advanced filtering, sorting, and pagination.

    Supports:
    - Full-text search in title, author, and ISBN
    - Filtering by category, status, language, year range, acquisition date
    - Sorting by various fields
    - Pagination

    Returns:
        BookListResponse with paginated results and metadata
    """
    try:
        # Build filters object
        filters = BookFilters(
            search=search,
            category_id=category_id,
            status=status,
            available_only=available_only,
            language=language,
            year_from=year_from,
            year_to=year_to,
            acquired_from=acquired_from,
            acquired_to=acquired_to,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size
        )

        books = await books_service.get_books(filters)
        return books
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch books: {str(e)}"
        )


@router.get(
    "/books/{book_id}",
    response_model=BookResponse,
    summary="Get book by ID",
    tags=["Books"]
)
async def get_book(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get a specific book by ID with full details and category information.

    Args:
        book_id: The book's UUID

    Returns:
        BookResponse object with complete book details

    Raises:
        404: Book not found
    """
    try:
        book = await books_service.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book {book_id} not found"
            )
        return book
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch book: {str(e)}"
        )


@router.post(
    "/books",
    response_model=BookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new book",
    tags=["Books"]
)
async def create_book(
    book: BookCreate,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Create a new book in the library catalog.

    Args:
        book: Book creation data

    Returns:
        Created BookResponse object

    Raises:
        400: Invalid book data or duplicate ISBN/barcode
        500: Failed to create book
    """
    try:
        new_book = await books_service.create_book(book)
        return new_book
    except Exception as e:
        error_msg = str(e).lower()
        if 'unique' in error_msg or 'duplicate' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ISBN or barcode already exists"
            )
        if 'foreign key' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category_id - category does not exist"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create book: {str(e)}"
        )


@router.put(
    "/books/{book_id}",
    response_model=BookResponse,
    summary="Update a book",
    tags=["Books"]
)
async def update_book(
    book_id: UUID,
    book: BookUpdate,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Update an existing book.

    Args:
        book_id: The book's UUID
        book: Updated book data (partial updates supported)

    Returns:
        Updated BookResponse object

    Raises:
        404: Book not found
        400: Invalid update data
        500: Failed to update book
    """
    try:
        updated_book = await books_service.update_book(book_id, book)
        if not updated_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book {book_id} not found"
            )
        return updated_book
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if 'unique' in error_msg or 'duplicate' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ISBN or barcode already exists"
            )
        if 'foreign key' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category_id - category does not exist"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update book: {str(e)}"
        )


@router.delete(
    "/books/{book_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a book",
    tags=["Books"]
)
async def delete_book(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Delete a book from the library catalog.

    Args:
        book_id: The book's UUID

    Returns:
        204 No Content on success

    Raises:
        404: Book not found
        400: Book has active circulation records
        500: Failed to delete book
    """
    try:
        await books_service.delete_book(book_id)
        return None
    except Exception as e:
        error_msg = str(e).lower()
        if 'circulation' in error_msg or 'cannot delete' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete book with active circulation records"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete book: {str(e)}"
        )


# =====================================================
# Inventory Management Endpoints
# =====================================================

@router.patch(
    "/books/{book_id}/quantity",
    response_model=BookResponse,
    summary="Update book quantity",
    tags=["Books", "Inventory"]
)
async def update_book_quantity(
    book_id: UUID,
    quantity_change: int = Query(..., description="Change in quantity (positive or negative)"),
    update_available: bool = Query(True, description="Also update available quantity"),
    books_service: BooksService = Depends(get_books_service)
):
    """
    Update book quantity (add or remove copies).

    Args:
        book_id: The book's UUID
        quantity_change: Change in quantity (e.g., +5 to add 5 copies, -2 to remove 2)
        update_available: Whether to also update available_quantity

    Returns:
        Updated BookResponse object

    Raises:
        404: Book not found
        400: Invalid quantity change (would result in negative)
        500: Failed to update quantity
    """
    try:
        updated_book = await books_service.update_quantity(
            book_id,
            quantity_change,
            update_available
        )
        if not updated_book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book {book_id} not found"
            )
        return updated_book
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if 'negative' in error_msg or 'cannot' in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update quantity: {str(e)}"
        )


@router.get(
    "/books/{book_id}/availability",
    response_model=dict,
    summary="Check book availability",
    tags=["Books", "Inventory"]
)
async def check_book_availability(
    book_id: UUID,
    required_quantity: int = Query(1, ge=1, description="Required number of copies"),
    books_service: BooksService = Depends(get_books_service)
):
    """
    Check if a book is available in required quantity.

    Args:
        book_id: The book's UUID
        required_quantity: Required number of copies

    Returns:
        Dictionary with availability status

    Raises:
        404: Book not found
    """
    try:
        is_available = await books_service.check_availability(book_id, required_quantity)

        # Get book details for response
        book = await books_service.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Book {book_id} not found"
            )

        return {
            "book_id": str(book_id),
            "is_available": is_available,
            "available_quantity": book.available_quantity,
            "total_quantity": book.quantity,
            "status": book.status.value
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check availability: {str(e)}"
        )


# =====================================================
# Bulk Operations Endpoints
# =====================================================

@router.post(
    "/books/bulk-update",
    response_model=BulkOperationResponse,
    summary="Bulk update books",
    tags=["Books", "Bulk Operations"]
)
async def bulk_update_books(
    bulk_update: BulkBookUpdate,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Update multiple books at once.

    Args:
        bulk_update: Book IDs and update data

    Returns:
        BulkOperationResponse with success status and affected count

    Raises:
        400: Invalid update data
        500: Failed to update books
    """
    try:
        result = await books_service.bulk_update_books(bulk_update)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk update books: {str(e)}"
        )


@router.post(
    "/books/bulk-delete",
    response_model=BulkOperationResponse,
    summary="Bulk delete books",
    tags=["Books", "Bulk Operations"]
)
async def bulk_delete_books(
    bulk_delete: BulkBookDelete,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Delete multiple books at once.

    Args:
        bulk_delete: List of book IDs to delete

    Returns:
        BulkOperationResponse with success status and affected count

    Raises:
        400: Some books have active circulation records
        500: Failed to delete books
    """
    try:
        result = await books_service.bulk_delete_books(bulk_delete)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk delete books: {str(e)}"
        )


# =====================================================
# Statistics Endpoint
# =====================================================

@router.get(
    "/books/statistics",
    response_model=BookStatistics,
    summary="Get book statistics",
    tags=["Books", "Statistics"]
)
async def get_book_statistics(
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get comprehensive book statistics.

    Returns:
        BookStatistics with counts by category, language, status, and more

    Raises:
        500: Failed to fetch statistics
    """
    try:
        stats = await books_service.get_statistics()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch statistics: {str(e)}"
        )


# =====================================================
# Barcode Endpoints
# =====================================================

@router.post(
    "/books/{book_id}/generate-barcode",
    summary="Generate barcode for a book",
    tags=["Books", "Barcode"]
)
async def generate_book_barcode(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Generate and assign a unique barcode to a book.

    Args:
        book_id: UUID of the book

    Returns:
        Updated book with barcode assigned

    Raises:
        404: Book not found
        400: Book already has a barcode
        500: Failed to generate barcode
    """
    try:
        barcode_service = get_barcode_service()

        # Get book
        book = await books_service.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        # Check if book already has barcode
        if book.get('barcode'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Book already has a barcode. Use update endpoint to change it."
            )

        # Generate barcode number
        barcode_number = barcode_service.generate_barcode_number(prefix="LIB")

        # Update book with barcode
        updated_book = await books_service.update_book(
            book_id,
            {"barcode": barcode_number}
        )

        return {
            "success": True,
            "barcode": barcode_number,
            "book": updated_book
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate barcode: {str(e)}"
        )


@router.get(
    "/books/{book_id}/barcode-image",
    summary="Get barcode image for a book",
    tags=["Books", "Barcode"]
)
async def get_book_barcode_image(
    book_id: UUID,
    include_text: bool = Query(True, description="Include human-readable text"),
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get barcode image for a book.

    Args:
        book_id: UUID of the book
        include_text: Whether to include human-readable text below barcode

    Returns:
        PNG image of the barcode

    Raises:
        404: Book not found or book has no barcode
        500: Failed to generate image
    """
    try:
        barcode_service = get_barcode_service()

        # Get book
        book = await books_service.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        # Check if book has barcode
        barcode_number = book.get('barcode')
        if not barcode_number:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book does not have a barcode assigned"
            )

        # Generate barcode image
        image_bytes, content_type = barcode_service.generate_barcode_image(
            barcode_number,
            include_text=include_text
        )

        return Response(
            content=image_bytes,
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename=barcode_{book_id}.png"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate barcode image: {str(e)}"
        )


@router.get(
    "/books/{book_id}/spine-label",
    summary="Get printable spine label for a book",
    tags=["Books", "Barcode"]
)
async def get_book_spine_label(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get printable spine label with barcode, title, author, and call number.

    Args:
        book_id: UUID of the book

    Returns:
        PNG image of the spine label

    Raises:
        404: Book not found or book has no barcode
        500: Failed to generate label
    """
    try:
        barcode_service = get_barcode_service()

        # Get book
        book = await books_service.get_book_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        # Check if book has barcode
        barcode_number = book.get('barcode')
        if not barcode_number:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book does not have a barcode assigned"
            )

        # Generate spine label
        label_bytes = barcode_service.create_book_label(
            book_title=book.get('title', 'Unknown Title'),
            barcode_number=barcode_number,
            call_number=book.get('dewey_decimal'),
            author=book.get('author')
        )

        return Response(
            content=label_bytes,
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=spine_label_{book_id}.png"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate spine label: {str(e)}"
        )


@router.post(
    "/books/isbn/{isbn}/barcode-image",
    summary="Get barcode image from ISBN",
    tags=["Books", "Barcode"]
)
async def get_isbn_barcode_image(
    isbn: str,
    include_text: bool = Query(True, description="Include human-readable text")
):
    """
    Generate EAN-13 barcode from ISBN number.

    Args:
        isbn: ISBN-13 number (13 digits, hyphens optional)
        include_text: Whether to include human-readable text

    Returns:
        PNG image of the barcode

    Raises:
        400: Invalid ISBN format
        500: Failed to generate image
    """
    try:
        barcode_service = get_barcode_service()

        # Generate ISBN barcode
        image_bytes, content_type = barcode_service.generate_isbn_barcode(isbn)

        return Response(
            content=image_bytes,
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename=isbn_{isbn}.png"
            }
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate ISBN barcode: {str(e)}"
        )
