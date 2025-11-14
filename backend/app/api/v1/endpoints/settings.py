"""
Settings management endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import Optional
from uuid import UUID
from app.models.settings import (
    SettingsResponse,
    SettingsUpdate,
    SettingsResetRequest,
)
from app.services.settings_service import SettingsService


router = APIRouter()


def get_settings_service() -> SettingsService:
    """Dependency to get settings service instance."""
    return SettingsService()


# TODO: Replace this with actual authentication middleware
async def get_current_user_id(
    x_user_id: Optional[str] = Header(None, description="User ID from auth token")
) -> UUID:
    """
    Extract current user ID from authentication.
    This is a placeholder - should be replaced with actual JWT token validation.

    For now, accepts user ID from X-User-Id header for testing.
    """
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    try:
        return UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )


@router.get("", response_model=SettingsResponse, summary="Get user settings")
async def get_settings(
    current_user_id: UUID = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    Get settings for the current authenticated user.
    Creates default settings if none exist.

    Returns:
        SettingsResponse object with all user preferences
    """
    try:
        settings = await settings_service.get_user_settings(current_user_id)
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch settings: {str(e)}"
        )


@router.put("", response_model=SettingsResponse, summary="Update user settings")
async def update_settings(
    settings_update: SettingsUpdate,
    current_user_id: UUID = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    Update settings for the current authenticated user.
    Performs partial updates - only updates provided fields.

    Args:
        settings_update: SettingsUpdate object with fields to update

    Returns:
        Updated SettingsResponse object
    """
    try:
        updated_settings = await settings_service.update_settings(
            current_user_id,
            settings_update
        )
        return updated_settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.post("/reset", response_model=SettingsResponse, summary="Reset settings to defaults")
async def reset_settings(
    reset_request: SettingsResetRequest,
    current_user_id: UUID = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    Reset user settings to default values.
    Can reset all settings or specific section.

    Args:
        reset_request: SettingsResetRequest with section to reset
            - section: 'all', 'general', 'appearance', 'notifications', or 'security'

    Returns:
        Updated SettingsResponse object with reset values
    """
    try:
        reset_settings = await settings_service.reset_settings(
            current_user_id,
            reset_request.section
        )
        return reset_settings
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset settings: {str(e)}"
        )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, summary="Delete user settings")
async def delete_settings(
    current_user_id: UUID = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
):
    """
    Delete user settings (cleanup on user deletion).
    This is primarily for administrative cleanup.

    Returns:
        204 No Content on success
    """
    try:
        await settings_service.delete_user_settings(current_user_id)
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete settings: {str(e)}"
        )
