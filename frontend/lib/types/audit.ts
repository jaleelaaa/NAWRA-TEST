/**
 * Audit Log Types
 * Type definitions for activity tracking and audit trail
 */

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS = 'ACCESS',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  GENERATE = 'GENERATE',
  SCAN = 'SCAN',
  CHECKOUT = 'CHECKOUT',
  CHECKIN = 'CHECKIN',
  RESERVE = 'RESERVE',
  RENEW = 'RENEW',
}

export enum AuditEntityType {
  BOOK = 'books',
  USER = 'users',
  CIRCULATION = 'circulation',
  PRESERVATION = 'preservation',
  BARCODE = 'barcode',
  CATEGORY = 'categories',
  SETTINGS = 'settings',
  REPORT = 'reports',
  SYSTEM = 'system',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  WARNING = 'warning',
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  username: string | null;
  user_role: string | null;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string | null;
  entity_name: string | null;
  description: string;
  changes: Record<string, any> | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  request_method: string | null;
  request_path: string | null;
  status: AuditStatus;
  error_message: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  page?: number;
  page_size?: number;
  user_id?: string;
  action?: AuditAction;
  entity_type?: AuditEntityType;
  entity_id?: string;
  status?: AuditStatus;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ActivitySummary {
  action: string;
  entity_type: string;
  count: number;
}

export interface AuditStatistics {
  total_activities: number;
  activities_by_action: Record<string, number>;
  activities_by_entity: Record<string, number>;
  activities_by_user: Array<{
    user_id: string;
    username: string;
    count: number;
  }>;
  recent_activities: AuditLog[];
  activity_summary: ActivitySummary[];
}

export interface UserActivity {
  date: string;
  action_count: number;
}

export interface UserActivityReport {
  user_id: string;
  username: string;
  total_actions: number;
  actions_by_type: Record<string, number>;
  daily_activity: UserActivity[];
  recent_actions: AuditLog[];
}

// Helper functions
export const getActionLabel = (action: AuditAction): string => {
  const labels: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'Created',
    [AuditAction.UPDATE]: 'Updated',
    [AuditAction.DELETE]: 'Deleted',
    [AuditAction.LOGIN]: 'Logged In',
    [AuditAction.LOGOUT]: 'Logged Out',
    [AuditAction.ACCESS]: 'Accessed',
    [AuditAction.EXPORT]: 'Exported',
    [AuditAction.IMPORT]: 'Imported',
    [AuditAction.GENERATE]: 'Generated',
    [AuditAction.SCAN]: 'Scanned',
    [AuditAction.CHECKOUT]: 'Checked Out',
    [AuditAction.CHECKIN]: 'Checked In',
    [AuditAction.RESERVE]: 'Reserved',
    [AuditAction.RENEW]: 'Renewed',
  };
  return labels[action] || action;
};

export const getActionColor = (action: AuditAction): string => {
  const colors: Record<AuditAction, string> = {
    [AuditAction.CREATE]: 'text-green-600 bg-green-50',
    [AuditAction.UPDATE]: 'text-blue-600 bg-blue-50',
    [AuditAction.DELETE]: 'text-red-600 bg-red-50',
    [AuditAction.LOGIN]: 'text-purple-600 bg-purple-50',
    [AuditAction.LOGOUT]: 'text-gray-600 bg-gray-50',
    [AuditAction.ACCESS]: 'text-cyan-600 bg-cyan-50',
    [AuditAction.EXPORT]: 'text-orange-600 bg-orange-50',
    [AuditAction.IMPORT]: 'text-yellow-600 bg-yellow-50',
    [AuditAction.GENERATE]: 'text-indigo-600 bg-indigo-50',
    [AuditAction.SCAN]: 'text-teal-600 bg-teal-50',
    [AuditAction.CHECKOUT]: 'text-pink-600 bg-pink-50',
    [AuditAction.CHECKIN]: 'text-lime-600 bg-lime-50',
    [AuditAction.RESERVE]: 'text-violet-600 bg-violet-50',
    [AuditAction.RENEW]: 'text-emerald-600 bg-emerald-50',
  };
  return colors[action] || 'text-gray-600 bg-gray-50';
};

export const getStatusColor = (status: AuditStatus): string => {
  const colors: Record<AuditStatus, string> = {
    [AuditStatus.SUCCESS]: 'text-green-600 bg-green-50',
    [AuditStatus.FAILURE]: 'text-red-600 bg-red-50',
    [AuditStatus.WARNING]: 'text-yellow-600 bg-yellow-50',
  };
  return colors[status] || 'text-gray-600 bg-gray-50';
};
