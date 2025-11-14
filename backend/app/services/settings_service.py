"""
Settings service for managing user preferences and configuration.
"""
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.db.supabase_client import get_supabase
from app.models.settings import (
    SettingsBase,
    SettingsUpdate,
    SettingsResponse,
    GeneralSettings,
    AppearanceSettings,
    NotificationSettings,
    SecuritySettings,
)


class SettingsService:
    """Service for managing user settings."""

    def __init__(self):
        """Initialize the settings service."""
        self.supabase = get_supabase()

    def _get_default_settings(self) -> Dict[str, Any]:
        """Get default settings structure."""
        return {
            "general": GeneralSettings().model_dump(),
            "appearance": AppearanceSettings().model_dump(),
            "notifications": NotificationSettings().model_dump(),
            "security": SecuritySettings().model_dump(),
        }

    async def get_user_settings(self, user_id: UUID) -> SettingsResponse:
        """
        Get settings for a specific user.
        Creates default settings if none exist.

        Args:
            user_id: The user's UUID

        Returns:
            SettingsResponse object

        Raises:
            Exception: If failed to fetch or create settings
        """
        try:
            # Try to fetch existing settings
            response = self.supabase.table('user_settings')\
                .select('*')\
                .eq('user_id', str(user_id))\
                .execute()

            if response.data and len(response.data) > 0:
                # Settings exist, return them
                settings_data = response.data[0]
                return SettingsResponse(**settings_data)
            else:
                # No settings exist, create defaults
                return await self.create_default_settings(user_id)

        except Exception as e:
            raise Exception(f"Failed to fetch user settings: {str(e)}")

    async def create_default_settings(self, user_id: UUID) -> SettingsResponse:
        """
        Create default settings for a user.

        Args:
            user_id: The user's UUID

        Returns:
            SettingsResponse object with default values

        Raises:
            Exception: If failed to create settings
        """
        try:
            default_settings = self._get_default_settings()

            settings_data = {
                "user_id": str(user_id),
                **default_settings,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            response = self.supabase.table('user_settings')\
                .insert(settings_data)\
                .execute()

            if response.data and len(response.data) > 0:
                return SettingsResponse(**response.data[0])
            else:
                raise Exception("Failed to create default settings")

        except Exception as e:
            raise Exception(f"Failed to create default settings: {str(e)}")

    async def update_settings(
        self,
        user_id: UUID,
        settings_update: SettingsUpdate
    ) -> SettingsResponse:
        """
        Update user settings.
        Performs partial updates - only updates provided fields.

        Args:
            user_id: The user's UUID
            settings_update: SettingsUpdate object with fields to update

        Returns:
            Updated SettingsResponse object

        Raises:
            Exception: If failed to update settings
        """
        try:
            # First, get current settings
            current_settings = await self.get_user_settings(user_id)

            # Build update data - only include non-None fields
            update_data = {}

            if settings_update.general is not None:
                update_data["general"] = settings_update.general.model_dump()

            if settings_update.appearance is not None:
                update_data["appearance"] = settings_update.appearance.model_dump()

            if settings_update.notifications is not None:
                update_data["notifications"] = settings_update.notifications.model_dump()

            if settings_update.security is not None:
                update_data["security"] = settings_update.security.model_dump()

            # Add updated_at timestamp
            update_data["updated_at"] = datetime.utcnow().isoformat()

            # Perform update
            response = self.supabase.table('user_settings')\
                .update(update_data)\
                .eq('user_id', str(user_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return SettingsResponse(**response.data[0])
            else:
                raise Exception("No settings found to update")

        except Exception as e:
            raise Exception(f"Failed to update settings: {str(e)}")

    async def reset_settings(
        self,
        user_id: UUID,
        section: str = "all"
    ) -> SettingsResponse:
        """
        Reset user settings to defaults.
        Can reset all settings or specific section.

        Args:
            user_id: The user's UUID
            section: Section to reset ('all', 'general', 'appearance', 'notifications', 'security')

        Returns:
            Updated SettingsResponse object

        Raises:
            Exception: If failed to reset settings
        """
        try:
            default_settings = self._get_default_settings()
            update_data = {}

            if section == "all":
                update_data = default_settings
            elif section == "general":
                update_data["general"] = default_settings["general"]
            elif section == "appearance":
                update_data["appearance"] = default_settings["appearance"]
            elif section == "notifications":
                update_data["notifications"] = default_settings["notifications"]
            elif section == "security":
                update_data["security"] = default_settings["security"]
            else:
                raise ValueError(f"Invalid section: {section}")

            update_data["updated_at"] = datetime.utcnow().isoformat()

            response = self.supabase.table('user_settings')\
                .update(update_data)\
                .eq('user_id', str(user_id))\
                .execute()

            if response.data and len(response.data) > 0:
                return SettingsResponse(**response.data[0])
            else:
                raise Exception("No settings found to reset")

        except Exception as e:
            raise Exception(f"Failed to reset settings: {str(e)}")

    async def delete_user_settings(self, user_id: UUID) -> bool:
        """
        Delete user settings (cleanup on user deletion).

        Args:
            user_id: The user's UUID

        Returns:
            True if successful

        Raises:
            Exception: If failed to delete settings
        """
        try:
            self.supabase.table('user_settings')\
                .delete()\
                .eq('user_id', str(user_id))\
                .execute()

            return True

        except Exception as e:
            raise Exception(f"Failed to delete settings: {str(e)}")
