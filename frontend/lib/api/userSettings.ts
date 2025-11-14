/**
 * User Settings API Service
 *
 * User-specific preferences and configuration
 */

import { apiClient } from './client';
import type {
  UserSettings,
  SettingsUpdate,
  SettingsResetRequest,
} from '../types/settings';

/**
 * Get current user's settings
 * Creates default settings if none exist
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get<UserSettings>('/settings');
  return response.data;
};

/**
 * Update current user's settings
 * Performs partial update - only updates provided fields
 */
export const updateUserSettings = async (
  settings: SettingsUpdate
): Promise<UserSettings> => {
  const response = await apiClient.put<UserSettings>('/settings', settings);
  return response.data;
};

/**
 * Reset user settings to defaults
 * Can reset all settings or specific section
 */
export const resetUserSettings = async (
  request: SettingsResetRequest
): Promise<UserSettings> => {
  const response = await apiClient.post<UserSettings>('/settings/reset', request);
  return response.data;
};

/**
 * Delete current user's settings
 * (Used for cleanup on account deletion)
 */
export const deleteUserSettings = async (): Promise<void> => {
  await apiClient.delete('/settings');
};
