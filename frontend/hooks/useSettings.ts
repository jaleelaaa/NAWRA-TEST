/**
 * React Query hooks for user settings management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import {
  getUserSettings,
  updateUserSettings,
  resetUserSettings,
} from '../lib/api/userSettings';
import type {
  UserSettings,
  SettingsUpdate,
  SettingsResetRequest,
} from '../lib/types/settings';

/**
 * Query keys for settings
 */
export const settingsKeys = {
  all: ['user-settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
};

/**
 * Hook to fetch user settings
 */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: getUserSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update user settings with optimistic updates
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateUserSettings,

    // Optimistic update
    onMutate: async (newSettings: SettingsUpdate) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.detail() });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(
        settingsKeys.detail()
      );

      // Optimistically update to new value
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.detail(), (old) => {
          if (!old) return old;

          return {
            ...old,
            ...newSettings,
            general: newSettings.general
              ? { ...old.general, ...newSettings.general }
              : old.general,
            appearance: newSettings.appearance
              ? { ...old.appearance, ...newSettings.appearance }
              : old.appearance,
            notifications: newSettings.notifications
              ? { ...old.notifications, ...newSettings.notifications }
              : old.notifications,
            security: newSettings.security
              ? { ...old.security, ...newSettings.security }
              : old.security,
            updated_at: new Date().toISOString(),
          };
        });
      }

      return { previousSettings };
    },

    // On success
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated successfully.',
        variant: 'default',
      });
    },

    // On error, rollback
    onError: (error, variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(settingsKeys.detail(), context.previousSettings);
      }
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
    },
  });
}

/**
 * Hook to reset settings to defaults
 */
export function useResetSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: resetUserSettings,

    onSuccess: (data, variables) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
      const sectionName =
        variables.section === 'all' ? 'All settings' : `${variables.section} settings`;
      toast({
        title: 'Settings reset',
        description: `${sectionName} have been reset to defaults.`,
        variant: 'default',
      });
    },

    onError: (error) => {
      toast({
        title: 'Reset failed',
        description: error instanceof Error ? error.message : 'Failed to reset settings',
        variant: 'destructive',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
    },
  });
}
