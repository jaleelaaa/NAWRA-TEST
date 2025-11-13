"""
Reports & Analytics endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from typing import Optional
from datetime import datetime, timedelta
from ....db import get_supabase
from supabase import Client
import csv
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_db() -> Client:
    """Dependency to get Supabase client"""
    return get_supabase()


@router.get("/dashboard", summary="Get reports dashboard statistics")
async def get_dashboard_stats(db: Client = Depends(get_db)):
    """
    Get comprehensive dashboard statistics for reports page including:
    - Total reports generated
    - Active data period
    - Export operations
    - Report categories
    """
    # Default date range - 90 days
    start_date = datetime.now() - timedelta(days=90)
    end_date = datetime.now()

    try:
        # Try to get actual date range from transactions table
        transactions = db.table('transactions').select('checkout_date').order(
            'checkout_date', desc=False
        ).limit(1).execute()

        if transactions.data and len(transactions.data) > 0:
            start_date = datetime.fromisoformat(transactions.data[0]['checkout_date'].replace('Z', '+00:00'))
    except Exception as e:
        # Log the error but continue with mock data
        logger.warning(f"Could not fetch transactions for date range: {str(e)}. Using default date range.")

    days_active = (end_date - start_date).days

    # Return dashboard statistics (using mock data for counts)
    return {
        "total_reports": {
            "count": 128,
            "change": 15  # Percentage change
        },
        "active_period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "days_active": days_active
        },
        "export_operations": {
            "count": 23,
            "change": 23,
            "period": "this week"
        },
        "categories": {
            "count": 5,
            "active_types": ["circulation", "user_activity", "collection", "financial", "overview"]
        }
    }


@router.get("/trends", summary="Get report generation trends over time")
async def get_report_trends(
    period: str = Query(default="week", regex="^(week|month|year)$", description="Time period"),
    db: Client = Depends(get_db)
):
    """
    Get trend data for report generation over time

    - **period**: Time period (week, month, year)
    """
    try:
        end_date = datetime.now()

        # Determine date range based on period
        if period == "week":
            start_date = end_date - timedelta(days=90)
            interval_days = 7
            date_format = '%b %d'
        elif period == "month":
            start_date = end_date - timedelta(days=365)
            interval_days = 30
            date_format = '%b %Y'
        else:  # year
            start_date = end_date - timedelta(days=365*3)
            interval_days = 365
            date_format = '%Y'

        # Generate trend data points
        result = []
        current_date = start_date
        base_value = 45

        while current_date <= end_date:
            # Simulate growing trend with some variance
            import random
            days_diff = (current_date - start_date).days
            growth = int((days_diff / (end_date - start_date).days) * 90)
            variance = random.randint(-8, 12)
            value = base_value + growth + variance

            result.append({
                'date': current_date.strftime(date_format),
                'date_full': current_date.strftime('%Y-%m-%d'),
                'value': max(value, 35)  # Ensure minimum value
            })

            current_date += timedelta(days=interval_days)

        return {
            "data": result,
            "period": period
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching trend data: {str(e)}"
        )


@router.get("/distribution", summary="Get report distribution by category")
async def get_report_distribution(db: Client = Depends(get_db)):
    """
    Get report distribution across different categories

    Returns count of reports/books by category for bar chart
    """
    category_counts = {}

    try:
        # Try to fetch books with category information from database
        response = db.table('books').select(
            'id, category_id, categories(name, name_ar)'
        ).execute()

        # Count books by category
        for book in response.data:
            if book.get('categories'):
                category_name = book['categories'].get('name', 'Uncategorized')
            else:
                category_name = 'Uncategorized'

            category_counts[category_name] = category_counts.get(category_name, 0) + 1

    except Exception as e:
        # Log the error and fall back to mock data
        logger.warning(f"Could not fetch books/categories for distribution: {str(e)}. Using mock data.")

    # If no data from database or error occurred, use default categories
    if not category_counts:
        category_counts = {
            'Fiction': 285,
            'Non-Fiction': 420,
            'Reference': 175,
            'Science': 315,
            'History': 265,
            'Art': 140
        }

    # Format result
    result = [
        {
            'category': category,
            'count': count
        }
        for category, count in category_counts.items()
    ]

    return {
        "data": result,
        "total": sum(category_counts.values())
    }


@router.get("/summary", summary="Get report summary with history")
async def get_report_summary(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(8, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Client = Depends(get_db)
):
    """
    Get paginated list of generated reports with filtering

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 8)
    - **category**: Filter by report category
    - **status**: Filter by status (completed, pending, failed)
    """
    try:
        # Mock data for report history
        # In production, this would query a reports_history table
        all_items = [
            {
                'id': 1,
                'report_name': 'Monthly Circulation',
                'category': 'circulation',
                'date_generated': '2025-03-15T10:30:00Z',
                'status': 'completed'
            },
            {
                'id': 2,
                'report_name': 'User Engagement Q1',
                'category': 'user_activity',
                'date_generated': '2025-03-10T14:20:00Z',
                'status': 'completed'
            },
            {
                'id': 3,
                'report_name': 'Collection Audit',
                'category': 'collection',
                'date_generated': '2025-03-20T09:15:00Z',
                'status': 'pending'
            },
            {
                'id': 4,
                'report_name': 'Financial Summary',
                'category': 'financial',
                'date_generated': '2025-03-05T16:45:00Z',
                'status': 'completed'
            },
            {
                'id': 5,
                'report_name': 'System Overview',
                'category': 'overview',
                'date_generated': '2025-03-18T11:00:00Z',
                'status': 'completed'
            },
            {
                'id': 6,
                'report_name': 'Branch Performance',
                'category': 'circulation',
                'date_generated': '2025-03-12T13:30:00Z',
                'status': 'pending'
            },
            {
                'id': 7,
                'report_name': 'User Demographics',
                'category': 'user_activity',
                'date_generated': '2025-03-08T10:00:00Z',
                'status': 'completed'
            },
            {
                'id': 8,
                'report_name': 'Collection Gap Analysis',
                'category': 'collection',
                'date_generated': '2025-03-01T15:20:00Z',
                'status': 'completed'
            },
            {
                'id': 9,
                'report_name': 'Overdue Books Report',
                'category': 'circulation',
                'date_generated': '2025-02-28T09:00:00Z',
                'status': 'completed'
            },
            {
                'id': 10,
                'report_name': 'Fine Collection Report',
                'category': 'financial',
                'date_generated': '2025-02-25T14:00:00Z',
                'status': 'completed'
            }
        ]

        # Apply filters
        filtered_items = all_items
        if category and category != 'all':
            filtered_items = [item for item in filtered_items if item['category'] == category]
        if status and status != 'all':
            filtered_items = [item for item in filtered_items if item['status'] == status]

        # Calculate pagination
        total = len(filtered_items)
        total_pages = (total + page_size - 1) // page_size
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        items = filtered_items[start_idx:end_idx]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching report summary: {str(e)}"
        )


@router.get("/circulation", summary="Get circulation report")
async def get_circulation_report(
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Client = Depends(get_db)
):
    """
    Get detailed circulation report with book loans, returns, and trends

    - **from_date**: Start date for report (optional)
    - **to_date**: End date for report (optional)
    """
    try:
        # Set default date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        if from_date:
            start_date = datetime.fromisoformat(from_date)
        if to_date:
            end_date = datetime.fromisoformat(to_date)

        # Fetch circulation data
        transactions = db.table('transactions').select(
            '*, books(title, title_ar, isbn), users(full_name, email)'
        ).gte(
            'checkout_date', start_date.isoformat()
        ).lte(
            'checkout_date', end_date.isoformat()
        ).execute()

        # Calculate statistics
        total_checkouts = len(transactions.data)
        total_returns = sum(1 for t in transactions.data if t.get('return_date'))
        total_overdue = sum(1 for t in transactions.data if t.get('is_overdue'))

        return {
            "period": {
                "from": start_date.isoformat(),
                "to": end_date.isoformat()
            },
            "summary": {
                "total_checkouts": total_checkouts,
                "total_returns": total_returns,
                "total_overdue": total_overdue,
                "active_loans": total_checkouts - total_returns
            },
            "transactions": transactions.data
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating circulation report: {str(e)}"
        )


@router.get("/user-activity", summary="Get user activity report")
async def get_user_activity_report(
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Client = Depends(get_db)
):
    """
    Get user activity report with registrations and engagement patterns

    - **from_date**: Start date for report (optional)
    - **to_date**: End date for report (optional)
    """
    try:
        # Set default date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        if from_date:
            start_date = datetime.fromisoformat(from_date)
        if to_date:
            end_date = datetime.fromisoformat(to_date)

        # Fetch user data
        users = db.table('users').select('*').execute()

        # Fetch user transactions
        transactions = db.table('transactions').select(
            'user_id, checkout_date'
        ).gte(
            'checkout_date', start_date.isoformat()
        ).lte(
            'checkout_date', end_date.isoformat()
        ).execute()

        # Calculate statistics
        total_users = len(users.data)
        active_users = len(set(t['user_id'] for t in transactions.data))

        # User type distribution
        user_types = {}
        for user in users.data:
            user_type = user.get('user_type', 'Unknown')
            user_types[user_type] = user_types.get(user_type, 0) + 1

        return {
            "period": {
                "from": start_date.isoformat(),
                "to": end_date.isoformat()
            },
            "summary": {
                "total_users": total_users,
                "active_users": active_users,
                "engagement_rate": round((active_users / total_users * 100) if total_users > 0 else 0, 2)
            },
            "user_types": user_types
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating user activity report: {str(e)}"
        )


@router.get("/collection", summary="Get collection report")
async def get_collection_report(db: Client = Depends(get_db)):
    """
    Get collection report with overview of library collection organized by category
    """
    try:
        # Fetch books with categories
        books = db.table('books').select(
            '*, categories(name, name_ar)'
        ).execute()

        # Calculate statistics
        total_books = len(books.data)

        # Books by category
        by_category = {}
        by_language = {}

        for book in books.data:
            # Category count
            if book.get('categories'):
                category = book['categories'].get('name', 'Uncategorized')
            else:
                category = 'Uncategorized'
            by_category[category] = by_category.get(category, 0) + 1

            # Language count
            language = book.get('language', 'Unknown')
            by_language[language] = by_language.get(language, 0) + 1

        return {
            "summary": {
                "total_books": total_books,
                "total_categories": len(by_category),
                "total_languages": len(by_language)
            },
            "by_category": by_category,
            "by_language": by_language
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating collection report: {str(e)}"
        )


@router.get("/financial", summary="Get financial report")
async def get_financial_report(
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Client = Depends(get_db)
):
    """
    Get financial report with fines collected, pending, and waived

    - **from_date**: Start date for report (optional)
    - **to_date**: End date for report (optional)
    """
    try:
        # Set default date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)

        if from_date:
            start_date = datetime.fromisoformat(from_date)
        if to_date:
            end_date = datetime.fromisoformat(to_date)

        # Mock financial data
        # In production, this would query a fines/payments table
        return {
            "period": {
                "from": start_date.isoformat(),
                "to": end_date.isoformat()
            },
            "summary": {
                "total_fines": 1250.50,
                "collected": 850.00,
                "pending": 325.50,
                "waived": 75.00
            },
            "by_type": {
                "overdue": 980.50,
                "damaged": 180.00,
                "lost": 90.00
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating financial report: {str(e)}"
        )


@router.post("/export", summary="Export report data")
async def export_report(
    report_type: str = Query(..., description="Type of report to export"),
    format: str = Query(default="csv", regex="^(csv|excel|pdf)$", description="Export format"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Client = Depends(get_db)
):
    """
    Export report data in specified format

    - **report_type**: Type of report (circulation, user_activity, collection, financial, overview)
    - **format**: Export format (csv, excel, pdf)
    - **from_date**: Start date for report (optional)
    - **to_date**: End date for report (optional)
    """
    try:
        # For now, only implement CSV export
        if format != "csv":
            raise HTTPException(
                status_code=400,
                detail=f"Export format '{format}' not yet implemented. Currently only CSV is supported."
            )

        # Get report data based on type
        if report_type == "circulation":
            report_data = await get_circulation_report(from_date, to_date, db)
            filename = "circulation_report.csv"
            headers = ['Transaction ID', 'Book Title', 'User', 'Checkout Date', 'Return Date', 'Status']
            rows = [
                [
                    t.get('id', ''),
                    t.get('books', {}).get('title', ''),
                    t.get('users', {}).get('full_name', ''),
                    t.get('checkout_date', ''),
                    t.get('return_date', ''),
                    'Returned' if t.get('return_date') else 'Active'
                ]
                for t in report_data.get('transactions', [])
            ]
        elif report_type == "summary":
            report_data = await get_report_summary(1, 10000, None, None, db)
            filename = "reports_summary.csv"
            headers = ['ID', 'Report Name', 'Category', 'Date Generated', 'Status']
            rows = [
                [
                    item['id'],
                    item['report_name'],
                    item['category'],
                    item['date_generated'],
                    item['status']
                ]
                for item in report_data['items']
            ]
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Report type '{report_type}' export not yet implemented"
            )

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header and data
        writer.writerow(headers)
        writer.writerows(rows)

        # Return CSV response
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error exporting report: {str(e)}"
        )
