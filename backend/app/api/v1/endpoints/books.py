"""
Books and categories management endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
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
# Barcode Management Endpoints
# =====================================================

from fastapi.responses import Response, StreamingResponse
from app.services.barcode_service import barcode_service


@router.post(
    "/books/{book_id}/barcode/generate",
    summary="Generate barcode number for book",
    tags=["Books", "Barcode"]
)
async def generate_book_barcode(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Generate and assign a unique barcode number to a book.

    Args:
        book_id: UUID of the book

    Returns:
        Dictionary with generated barcode number

    Raises:
        404: Book not found
        400: Book already has a barcode
        500: Failed to generate barcode
    """
    try:
        # Get book
        book = await books_service.get_book(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        # Check if book already has barcode
        if book.get('barcode'):
            return {
                "barcode_number": book['barcode'],
                "message": "Book already has a barcode",
                "book_id": str(book_id)
            }

        # Generate barcode
        barcode_number = barcode_service.generate_barcode_number(str(book_id))

        # Update book with barcode
        await books_service.update_book(book_id, BookUpdate(barcode=barcode_number))

        return {
            "barcode_number": barcode_number,
            "message": "Barcode generated successfully",
            "book_id": str(book_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate barcode: {str(e)}"
        )


@router.get(
    "/books/{book_id}/barcode/image",
    summary="Get barcode as image",
    tags=["Books", "Barcode"],
    responses={
        200: {
            "content": {"image/png": {}},
            "description": "Barcode image in PNG format"
        }
    }
)
async def get_barcode_image(
    book_id: UUID,
    format: str = Query("png", regex="^(png|svg)$"),
    include_text: bool = Query(True),
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get barcode as image (PNG or SVG).

    Args:
        book_id: UUID of the book
        format: Image format (png or svg)
        include_text: Include barcode number text below barcode

    Returns:
        Barcode image

    Raises:
        404: Book not found or no barcode
        500: Failed to generate image
    """
    try:
        # Get book
        book = await books_service.get_book(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        barcode_number = book.get('barcode')
        if not barcode_number:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book does not have a barcode. Generate one first."
            )

        # Generate image
        if format == 'svg':
            svg_content = barcode_service.generate_barcode_svg(
                barcode_number,
                include_text=include_text
            )
            return Response(
                content=svg_content,
                media_type="image/svg+xml"
            )
        else:  # png
            png_bytes = barcode_service.generate_barcode_image(
                barcode_number,
                include_text=include_text
            )
            return Response(
                content=png_bytes,
                media_type="image/png"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate barcode image: {str(e)}"
        )


@router.get(
    "/books/{book_id}/barcode/label",
    summary="Get printable barcode label",
    tags=["Books", "Barcode"],
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Barcode label in PDF format"
        }
    }
)
async def get_barcode_label(
    book_id: UUID,
    books_service: BooksService = Depends(get_books_service)
):
    """
    Get a printable label with barcode and book information.

    Args:
        book_id: UUID of the book

    Returns:
        PDF label

    Raises:
        404: Book not found or no barcode
        500: Failed to generate label
    """
    try:
        # Get book
        book = await books_service.get_book(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book not found"
            )

        barcode_number = book.get('barcode')
        if not barcode_number:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Book does not have a barcode. Generate one first."
            )

        # Generate label PDF
        pdf_bytes = barcode_service.generate_label_pdf(
            barcode_number=barcode_number,
            title=book.get('title', 'N/A'),
            author=book.get('author', 'N/A'),
            category=book.get('category', {}).get('name', 'N/A') if isinstance(book.get('category'), dict) else 'N/A',
            shelf_location=book.get('shelf_location', 'N/A')
        )

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=label_{barcode_number}.pdf"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate label: {str(e)}"
        )


@router.post(
    "/books/barcode/bulk-labels",
    summary="Generate bulk barcode labels",
    tags=["Books", "Barcode"],
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Bulk barcode labels in PDF format"
        }
    }
)
async def generate_bulk_labels(
    book_ids: list[UUID],
    books_service: BooksService = Depends(get_books_service)
):
    """
    Generate multiple barcode labels in a single PDF for bulk printing.

    Args:
        book_ids: List of book UUIDs

    Returns:
        PDF with multiple labels

    Raises:
        400: No books provided or books not found
        500: Failed to generate labels
    """
    try:
        if not book_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No book IDs provided"
            )

        # Get all books
        books_data = []
        for book_id in book_ids:
            book = await books_service.get_book(book_id)
            if book and book.get('barcode'):
                books_data.append({
                    'barcode_number': book['barcode'],
                    'title': book.get('title', 'N/A'),
                    'author': book.get('author', 'N/A'),
                    'category': book.get('category', {}).get('name', 'N/A') if isinstance(book.get('category'), dict) else 'N/A',
                    'shelf_location': book.get('shelf_location', 'N/A')
                })

        if not books_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No books found with barcodes"
            )

        # Generate bulk PDF
        pdf_bytes = barcode_service.generate_bulk_labels_pdf(books_data)

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=bulk_labels_{len(books_data)}_items.pdf"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate bulk labels: {str(e)}"
        )
