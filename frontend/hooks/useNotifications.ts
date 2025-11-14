/**
 * Notifications React Query Hooks
 * Custom hooks for notification operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  sendEmailNotification,
  sendBulkEmailNotification,
  sendOverdueNotifications,
  sendDueSoonNotifications,
  sendInspectionNotifications,
  fetchNotificationStatistics,
} from '@/lib/api/notifications';
import type {
  EmailNotification,
  BulkEmailNotification,
  OverdueNotificationRequest,
  DueSoonNotificationRequest,
} from '@/lib/types/notifications';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

/**
 * Hook to send a single email notification
 */
export function useSendEmail() {
  const t = useTranslations('notifications.messages');

  return useMutation({
    mutationFn: (notification: EmailNotification) => sendEmailNotification(notification),
    onSuccess: () => {
      toast.success(t('emailSent') || 'Email sent successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('emailError') || 'Failed to send email';
      toast.error(message);
    },
  });
}

/**
 * Hook to send bulk email notifications
 */
export function useSendBulkEmail() {
  const t = useTranslations('notifications.messages');

  return useMutation({
    mutationFn: (notification: BulkEmailNotification) => sendBulkEmailNotification(notification),
    onSuccess: (data) => {
      toast.success(
        t('bulkSuccess', { count: data.successful }) ||
        `Sent ${data.successful} of ${data.total_requested} emails successfully`
      );
      if (data.failed > 0) {
        toast.warning(
          t('bulkPartial', { failed: data.failed }) ||
          `${data.failed} emails failed to send`
        );
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('bulkError') || 'Failed to send bulk emails';
      toast.error(message);
    },
  });
}

/**
 * Hook to send overdue notifications
 */
export function useSendOverdueNotifications() {
  const queryClient = useQueryClient();
  const t = useTranslations('notifications.messages');

  return useMutation({
    mutationFn: (request: OverdueNotificationRequest) => sendOverdueNotifications(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (data.total_requested > 0) {
        toast.success(
          t('overdueSuccess', { count: data.successful }) ||
          `Sent ${data.successful} overdue notifications`
        );
      } else {
        toast.info(t('noOverdue') || 'No overdue items found');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('overdueError') || 'Failed to send overdue notifications';
      toast.error(message);
    },
  });
}

/**
 * Hook to send due soon reminders
 */
export function useSendDueSoonNotifications() {
  const queryClient = useQueryClient();
  const t = useTranslations('notifications.messages');

  return useMutation({
    mutationFn: (request: DueSoonNotificationRequest) => sendDueSoonNotifications(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      if (data.total_requested > 0) {
        toast.success(
          t('dueSoonSuccess', { count: data.successful }) ||
          `Sent ${data.successful} due soon reminders`
        );
      } else {
        toast.info(t('noDueSoon') || 'No items due soon');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('dueSoonError') || 'Failed to send due soon reminders';
      toast.error(message);
    },
  });
}

/**
 * Hook to send preservation inspection reminders
 */
export function useSendInspectionNotifications() {
  const queryClient = useQueryClient();
  const t = useTranslations('notifications.messages');

  return useMutation({
    mutationFn: () => sendInspectionNotifications(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success(
        t('inspectionSuccess', { count: data.successful }) ||
        `Sent ${data.successful} inspection reminders`
      );
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || t('inspectionError') || 'Failed to send inspection reminders';
      toast.error(message);
    },
  });
}

/**
 * Hook to fetch notification statistics
 */
export function useNotificationStatistics(days: number = 30) {
  return useQuery({
    queryKey: ['notifications', 'statistics', days],
    queryFn: () => fetchNotificationStatistics(days),
    staleTime: 60000, // 1 minute
  });
}
