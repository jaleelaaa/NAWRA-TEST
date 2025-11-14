"""
Audit Service

Service for managing audit logs and compliance tracking
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from uuid import UUID
import json

from app.db import get_supabase
from app.models.audit import (
    AuditAction,
    AuditResourceType,
    AuditLogCreate,
    AuditLogResponse,
    AuditLogFilters,
    AuditLogListResponse,
    AuditStatistics,
    SessionInfo,
    UserActivityReport,
    SystemActivityReport,
)


class AuditService:
    """Service for audit log management"""

    def __init__(self):
        self._supabase = None
        self.table_name = "audit_logs"

    @property
    def supabase(self):
        """Lazy initialization of Supabase client"""
        if self._supabase is None:
            self._supabase = get_supabase()
        return self._supabase

    async def log_action(
        self,
        action: AuditAction,
        resource_type: AuditResourceType,
        user_id: Optional[UUID] = None,
        resource_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        status: str = "success",
        error_message: Optional[str] = None,
    ) -> Optional[Dict]:
        """
        Log an audit event

        Args:
            action: The action performed
            resource_type: Type of resource affected
            user_id: ID of user performing action
            resource_id: ID of resource affected
            ip_address: IP address of request
            user_agent: User agent string
            details: Additional details as dict
            status: Status of action (success, failure, error)
            error_message: Error message if action failed

        Returns:
            Created audit log record or None if logging fails
        """
        try:
            audit_data = {
                "user_id": str(user_id) if user_id else None,
                "action": action.value if isinstance(action, AuditAction) else action,
                "resource_type": resource_type.value if isinstance(resource_type, AuditResourceType) else resource_type,
                "resource_id": str(resource_id) if resource_id else None,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "details": details or {},
                "status": status,
                "error_message": error_message,
                "created_at": datetime.utcnow().isoformat(),
            }

            result = self.supabase.table(self.table_name).insert(audit_data).execute()

            if result.data:
                return result.data[0]

            return None

        except Exception as e:
            # Don't let audit logging failures break the application
            print(f"Failed to log audit event: {str(e)}")
            return None

    async def get_audit_logs(
        self, filters: AuditLogFilters
    ) -> AuditLogListResponse:
        """
        Get audit logs with filters and pagination

        Args:
            filters: Filter criteria

        Returns:
            Paginated audit logs
        """
        try:
            # Build query
            query = self.supabase.table(self.table_name).select(
                "*",
                count="exact"
            )

            # Apply filters
            if filters.user_id:
                query = query.eq("user_id", str(filters.user_id))

            if filters.action:
                query = query.eq("action", filters.action.value)

            if filters.resource_type:
                query = query.eq("resource_type", filters.resource_type.value)

            if filters.resource_id:
                query = query.eq("resource_id", str(filters.resource_id))

            if filters.status:
                query = query.eq("status", filters.status)

            if filters.ip_address:
                query = query.eq("ip_address", filters.ip_address)

            if filters.from_date:
                query = query.gte("created_at", filters.from_date.isoformat())

            if filters.to_date:
                query = query.lte("created_at", filters.to_date.isoformat())

            if filters.search:
                # Search in user_agent or details
                query = query.or_(
                    f"user_agent.ilike.%{filters.search}%,"
                    f"details.cs.{{'search': '{filters.search}'}}"
                )

            # Sorting
            query = query.order(
                filters.sort_by,
                desc=(filters.sort_order == "desc")
            )

            # Pagination
            start = (filters.page - 1) * filters.page_size
            end = start + filters.page_size - 1
            query = query.range(start, end)

            # Execute query
            result = query.execute()

            total = result.count if hasattr(result, 'count') else 0
            items = result.data if result.data else []

            # Enrich with user information
            enriched_items = await self._enrich_audit_logs(items)

            total_pages = (total + filters.page_size - 1) // filters.page_size

            return AuditLogListResponse(
                items=[AuditLogResponse(**item) for item in enriched_items],
                total=total,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=total_pages,
            )

        except Exception as e:
            print(f"Failed to fetch audit logs: {str(e)}")
            return AuditLogListResponse(
                items=[],
                total=0,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=0,
            )

    async def _enrich_audit_logs(self, logs: List[Dict]) -> List[Dict]:
        """
        Enrich audit logs with user and resource information

        Args:
            logs: List of audit log dicts

        Returns:
            Enriched audit logs
        """
        try:
            # Get unique user IDs
            user_ids = list(set(
                log.get('user_id') for log in logs
                if log.get('user_id')
            ))

            # Fetch user information
            users_map = {}
            if user_ids:
                users_result = self.supabase.table("users").select(
                    "id, full_name, email"
                ).in_("id", user_ids).execute()

                if users_result.data:
                    users_map = {
                        user['id']: user
                        for user in users_result.data
                    }

            # Enrich logs
            enriched = []
            for log in logs:
                enriched_log = log.copy()

                if log.get('user_id') and log['user_id'] in users_map:
                    user = users_map[log['user_id']]
                    enriched_log['user_name'] = user.get('full_name')
                    enriched_log['user_email'] = user.get('email')

                enriched.append(enriched_log)

            return enriched

        except Exception as e:
            print(f"Failed to enrich audit logs: {str(e)}")
            return logs

    async def get_audit_log_by_id(self, log_id: UUID) -> Optional[AuditLogResponse]:
        """Get single audit log by ID"""
        try:
            result = self.supabase.table(self.table_name).select(
                "*"
            ).eq("id", str(log_id)).execute()

            if result.data:
                enriched = await self._enrich_audit_logs(result.data)
                return AuditLogResponse(**enriched[0])

            return None

        except Exception as e:
            print(f"Failed to fetch audit log: {str(e)}")
            return None

    async def get_statistics(
        self,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> AuditStatistics:
        """
        Get audit statistics

        Args:
            from_date: Start date for statistics
            to_date: End date for statistics

        Returns:
            Audit statistics
        """
        try:
            now = datetime.utcnow()
            from_date = from_date or (now - timedelta(days=30))
            to_date = to_date or now

            # Get all logs in date range
            result = self.supabase.table(self.table_name).select(
                "action, resource_type, status, user_id, created_at"
            ).gte("created_at", from_date.isoformat()).lte(
                "created_at", to_date.isoformat()
            ).execute()

            logs = result.data if result.data else []

            # Calculate statistics
            total_events = len(logs)

            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            events_today = len([
                log for log in logs
                if datetime.fromisoformat(log['created_at']) >= today_start
            ])

            week_start = now - timedelta(days=7)
            events_this_week = len([
                log for log in logs
                if datetime.fromisoformat(log['created_at']) >= week_start
            ])

            month_start = now - timedelta(days=30)
            events_this_month = len([
                log for log in logs
                if datetime.fromisoformat(log['created_at']) >= month_start
            ])

            # By action
            by_action = {}
            for log in logs:
                action = log.get('action', 'unknown')
                by_action[action] = by_action.get(action, 0) + 1

            # By resource
            by_resource = {}
            for log in logs:
                resource = log.get('resource_type', 'unknown')
                by_resource[resource] = by_resource.get(resource, 0) + 1

            # By status
            by_status = {}
            for log in logs:
                status = log.get('status', 'unknown')
                by_status[status] = by_status.get(status, 0) + 1

            # Top users
            user_counts = {}
            for log in logs:
                if log.get('user_id'):
                    user_counts[log['user_id']] = user_counts.get(log['user_id'], 0) + 1

            top_user_ids = sorted(user_counts.items(), key=lambda x: x[1], reverse=True)[:10]

            # Get user details
            top_users = []
            if top_user_ids:
                user_ids = [uid for uid, _ in top_user_ids]
                users_result = self.supabase.table("users").select(
                    "id, full_name, email"
                ).in_("id", user_ids).execute()

                users_map = {
                    user['id']: user
                    for user in (users_result.data or [])
                }

                top_users = [
                    {
                        "user_id": uid,
                        "user_name": users_map.get(uid, {}).get('full_name', 'Unknown'),
                        "user_email": users_map.get(uid, {}).get('email', 'Unknown'),
                        "event_count": count
                    }
                    for uid, count in top_user_ids
                ]

            # Recent failures
            failed_logs = [
                log for log in logs
                if log.get('status') in ['failure', 'error']
            ]
            failed_logs_sorted = sorted(
                failed_logs,
                key=lambda x: x.get('created_at', ''),
                reverse=True
            )[:10]

            enriched_failures = await self._enrich_audit_logs(failed_logs_sorted)
            recent_failures = [
                AuditLogResponse(**log)
                for log in enriched_failures
            ]

            # Active sessions (logins in last 30 minutes without logout)
            session_threshold = now - timedelta(minutes=30)
            recent_logins = [
                log for log in logs
                if log.get('action') == 'login' and
                datetime.fromisoformat(log['created_at']) >= session_threshold
            ]
            active_sessions = len(recent_logins)

            total_sessions_today = len([
                log for log in logs
                if log.get('action') == 'login' and
                datetime.fromisoformat(log['created_at']) >= today_start
            ])

            return AuditStatistics(
                total_events=total_events,
                events_today=events_today,
                events_this_week=events_this_week,
                events_this_month=events_this_month,
                by_action=by_action,
                by_resource=by_resource,
                by_status=by_status,
                top_users=top_users,
                recent_failures=recent_failures,
                active_sessions=active_sessions,
                total_sessions_today=total_sessions_today,
            )

        except Exception as e:
            print(f"Failed to get audit statistics: {str(e)}")
            return AuditStatistics(
                total_events=0,
                events_today=0,
                events_this_week=0,
                events_this_month=0,
                by_action={},
                by_resource={},
                by_status={},
                top_users=[],
                recent_failures=[],
                active_sessions=0,
                total_sessions_today=0,
            )

    async def delete_old_logs(self, days: int = 90) -> int:
        """
        Delete audit logs older than specified days

        Args:
            days: Number of days to keep

        Returns:
            Number of deleted logs
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            result = self.supabase.table(self.table_name).delete().lt(
                "created_at", cutoff_date.isoformat()
            ).execute()

            return len(result.data) if result.data else 0

        except Exception as e:
            print(f"Failed to delete old audit logs: {str(e)}")
            return 0


# Create singleton instance
audit_service = AuditService()
