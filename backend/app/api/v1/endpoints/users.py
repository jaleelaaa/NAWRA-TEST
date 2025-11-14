"""
User management endpoints
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query, Response
from typing import Optional
from ....models.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    UserStatsResponse
)
from ....services.user_service import UserService
import csv
import io

router = APIRouter()


def get_user_service() -> UserService:
    """Dependency to get user service instance"""
    return UserService()


@router.get("", response_model=UserListResponse, summary="Get all users")
async def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    user_service: UserService = Depends(get_user_service)
):
    """
    Get paginated list of users with optional filtering and sorting

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 12, max: 100)
    - **search**: Search in full_name, email, arabic_name
    - **role**: Filter by role name
    - **is_active**: Filter by active status
    - **sort_by**: Sort field (created_at, full_name, email, etc.)
    - **sort_order**: Sort order (asc or desc)
    """
    try:
        result = await user_service.get_users(
            page=page,
            page_size=page_size,
            search=search,
            role=role,
            is_active=is_active,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )


@router.get("/stats", response_model=UserStatsResponse, summary="Get user statistics")
async def get_user_stats(user_service: UserService = Depends(get_user_service)):
    """
    Get user statistics including:
    - Total users
    - Active/Inactive users
    - Users by role
    - Users by type
    - Recent signups (last 30 days)
    """
    try:
        stats = await user_service.get_user_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user stats: {str(e)}"
        )


@router.get("/export", summary="Export users to CSV")
async def export_users(
    search: Optional[str] = Query(None, description="Search in name, email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    user_service: UserService = Depends(get_user_service)
):
    """
    Export users to CSV file with optional filtering
    """
    try:
        # Get all users with filters (no pagination)
        result = await user_service.get_users(
            page=1,
            page_size=10000,  # Large number to get all users
            search=search,
            role=role,
            is_active=is_active,
            sort_by="created_at",
            sort_order="desc"
        )

        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow([
            'ID', 'Email', 'Full Name', 'Arabic Name', 'User Type',
            'Role', 'Status', 'Phone', 'Address', 'Last Login',
            'Created At', 'Updated At'
        ])

        # Write data
        for user in result['items']:
            writer.writerow([
                user['id'],
                user['email'],
                user['full_name'],
                user.get('arabic_name', ''),
                user['user_type'],
                user['role'],
                'Active' if user['is_active'] else 'Inactive',
                user.get('phone', ''),
                user.get('address', ''),
                user.get('last_login', ''),
                user['created_at'],
                user['updated_at']
            ])

        # Return CSV response
        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=users_export.csv"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export users: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse, summary="Get user by ID")
async def get_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """
    Get single user by ID
    """
    try:
        user = await user_service.get_user(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Create new user")
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    """
    Create new user

    - **email**: User email (must be unique)
    - **password**: User password (min 8 characters)
    - **full_name**: Full name
    - **arabic_name**: Arabic name (optional)
    - **user_type**: User type (Patron, Student, etc.)
    - **role_id**: Role ID (optional, defaults to Patron)
    - **phone**: Phone number (optional)
    - **address**: Address (optional)
    - **is_active**: Active status (default: true)
    """
    try:
        user = await user_service.create_user(user_data.dict())
        return user
    except Exception as e:
        error_msg = str(e)
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {error_msg}"
        )


@router.patch("/{user_id}", response_model=UserResponse, summary="Update user")
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service)
):
    """
    Update existing user

    All fields are optional - only provided fields will be updated
    """
    try:
        # Filter out None values
        update_data = {k: v for k, v in user_data.dict().items() if v is not None}

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        user = await user_service.update_user(user_id, update_data)
        return user
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        if "duplicate" in error_msg.lower() or "unique" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {error_msg}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete user")
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service)
):
    """
    Delete user by ID
    """
    try:
        await user_service.delete_user(user_id)
        return None
    except Exception as e:
        error_msg = str(e)
        if "not found" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {error_msg}"
        )
