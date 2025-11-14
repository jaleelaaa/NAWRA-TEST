"""
Audit Service
Business logic for audit logging and activity tracking
"""

from uuid import UUID
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, date
from supabase import Client
from fastapi import HTTPException, status

from ..models.audit import (
    AuditLogCreate,
    AuditLogResponse,
    AuditLogFilters,
    AuditLogListResponse,
    AuditStatistics,
    ActivitySummary,
    UserActivity,
    UserActivityReport,
    AuditAction,
    AuditEntityType,
    AuditStatus,
)


class AuditService:
    """Service class for audit log operations"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def log_activity(
        self,
        user_id: Optional[UUID],
        action: AuditAction,
        entity_type: AuditEntityType,
        entity_id: Optional[UUID],
        description: str,
        entity_name: Optional[str] = None,
        changes: Optional[Dict[str, Any]] = None,
        metadata: Dict[str, Any] = {},
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        request_method: Optional[str] = None,
        request_path: Optional[str] = None,
        status_value: AuditStatus = AuditStatus.SUCCESS,
        error_message: Optional[str] = None
    ) -> AuditLogResponse:
        """Log an activity to the audit trail"""
        try:
            # Get user details if user_id provided
            username = None
            user_role = None

            if user_id:
                user_response = self.supabase.table("users")\
                    .select("username, role")\
                    .eq("id", str(user_id))\
                    .single()\
                    .execute()

                if user_response.data:
                    username = user_response.data.get('username')
                    user_role = user_response.data.get('role')

            # Prepare audit log data
            log_data = {
                "user_id": str(user_id) if user_id else None,
                "username": username,
                "user_role": user_role,
                "action": action.value if hasattr(action, 'value') else action,
                "entity_type": entity_type.value if hasattr(entity_type, 'value') else entity_type,
                "entity_id": str(entity_id) if entity_id else None,
                "entity_name": entity_name,
                "description": description,
                "changes": changes or {},
                "metadata": metadata or {},
                "ip_address": ip_address,
                "user_agent": user_agent,
                "request_method": request_method,
                "request_path": request_path,
                "status": status_value.value if hasattr(status_value, 'value') else status_value,
                "error_message": error_message
            }

            # Insert audit log
            response = self.supabase.table("audit_logs").insert(log_data).execute()

            if response.data:
                return AuditLogResponse(**response.data[0])

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create audit log"
            )

        except HTTPException:
            raise
        except Exception as e:
            # Don't fail the main operation if audit logging fails
            print(f"Error logging audit activity: {str(e)}")
            raise

    async def get_audit_log(self, log_id: UUID) -> AuditLogResponse:
        """Get a specific audit log entry"""
        try:
            response = self.supabase.table("audit_logs")\
                .select("*")\
                .eq("id", str(log_id))\
                .single()\
                .execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Audit log not found"
                )

            return AuditLogResponse(**response.data)
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching audit log: {str(e)}"
            )

    async def list_audit_logs(self, filters: AuditLogFilters) -> AuditLogListResponse:
        """List audit logs with filters and pagination"""
        try:
            offset = (filters.page - 1) * filters.page_size

            # Build query
            query = self.supabase.table("audit_logs").select("*", count="exact")

            # Apply filters
            if filters.user_id:
                query = query.eq("user_id", str(filters.user_id))

            if filters.action:
                action_value = filters.action.value if hasattr(filters.action, 'value') else filters.action
                query = query.eq("action", action_value)

            if filters.entity_type:
                entity_value = filters.entity_type.value if hasattr(filters.entity_type, 'value') else filters.entity_type
                query = query.eq("entity_type", entity_value)

            if filters.entity_id:
                query = query.eq("entity_id", str(filters.entity_id))

            if filters.status:
                status_value = filters.status.value if hasattr(filters.status, 'value') else filters.status
                query = query.eq("status", status_value)

            if filters.start_date:
                query = query.gte("created_at", filters.start_date.isoformat())

            if filters.end_date:
                query = query.lte("created_at", filters.end_date.isoformat())

            # Execute query with pagination
            response = query.range(offset, offset + filters.page_size - 1)\
                .order("created_at", desc=True)\
                .execute()

            logs = [AuditLogResponse(**log) for log in response.data]
            total = response.count or 0
            total_pages = (total + filters.page_size - 1) // filters.page_size

            return AuditLogListResponse(
                data=logs,
                total=total,
                page=filters.page,
                page_size=filters.page_size,
                total_pages=total_pages
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error listing audit logs: {str(e)}"
            )

    async def get_audit_statistics(self, days: int = 7) -> AuditStatistics:
        """Get audit log statistics"""
        try:
            start_date = datetime.now() - timedelta(days=days)

            # Total activities
            total_response = self.supabase.table("audit_logs")\
                .select("*", count="exact")\
                .gte("created_at", start_date.isoformat())\
                .execute()
            total_activities = total_response.count or 0

            # Activities by action
            activities_by_action = {}
            for action in AuditAction:
                count_response = self.supabase.table("audit_logs")\
                    .select("*", count="exact")\
                    .eq("action", action.value)\
                    .gte("created_at", start_date.isoformat())\
                    .execute()
                activities_by_action[action.value] = count_response.count or 0

            # Activities by entity
            activities_by_entity = {}
            for entity in AuditEntityType:
                count_response = self.supabase.table("audit_logs")\
                    .select("*", count="exact")\
                    .eq("entity_type", entity.value)\
                    .gte("created_at", start_date.isoformat())\
                    .execute()
                activities_by_entity[entity.value] = count_response.count or 0

            # Top users by activity (limit to 10)
            user_response = self.supabase.table("audit_logs")\
                .select("user_id, username")\
                .gte("created_at", start_date.isoformat())\
                .limit(1000)\
                .execute()

            # Count activities per user
            user_counts = {}
            for log in user_response.data:
                user_id = log.get('user_id')
                username = log.get('username')
                if user_id:
                    if user_id not in user_counts:
                        user_counts[user_id] = {"user_id": user_id, "username": username or "Unknown", "count": 0}
                    user_counts[user_id]["count"] += 1

            activities_by_user = sorted(user_counts.values(), key=lambda x: x["count"], reverse=True)[:10]

            # Recent activities (last 10)
            recent_response = self.supabase.table("audit_logs")\
                .select("*")\
                .order("created_at", desc=True)\
                .limit(10)\
                .execute()
            recent_activities = [AuditLogResponse(**log) for log in recent_response.data]

            # Activity summary (using RPC if available)
            activity_summary = []
            try:
                summary_response = self.supabase.rpc('get_activity_summary', {'days': days}).execute()
                activity_summary = [
                    ActivitySummary(
                        action=row['action'],
                        entity_type=row['entity_type'],
                        count=row['count']
                    )
                    for row in summary_response.data
                ]
            except:
                pass  # RPC not available, skip summary

            return AuditStatistics(
                total_activities=total_activities,
                activities_by_action=activities_by_action,
                activities_by_entity=activities_by_entity,
                activities_by_user=activities_by_user,
                recent_activities=recent_activities,
                activity_summary=activity_summary
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error calculating audit statistics: {str(e)}"
            )

    async def get_user_activity_report(self, user_id: UUID, days: int = 30) -> UserActivityReport:
        """Get detailed activity report for a specific user"""
        try:
            start_date = datetime.now() - timedelta(days=days)

            # Get user details
            user_response = self.supabase.table("users")\
                .select("username")\
                .eq("id", str(user_id))\
                .single()\
                .execute()

            if not user_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            username = user_response.data.get('username', 'Unknown')

            # Total actions
            total_response = self.supabase.table("audit_logs")\
                .select("*", count="exact")\
                .eq("user_id", str(user_id))\
                .gte("created_at", start_date.isoformat())\
                .execute()
            total_actions = total_response.count or 0

            # Actions by type
            actions_by_type = {}
            for action in AuditAction:
                count_response = self.supabase.table("audit_logs")\
                    .select("*", count="exact")\
                    .eq("user_id", str(user_id))\
                    .eq("action", action.value)\
                    .gte("created_at", start_date.isoformat())\
                    .execute()
                count = count_response.count or 0
                if count > 0:
                    actions_by_type[action.value] = count

            # Daily activity (using RPC if available)
            daily_activity = []
            try:
                daily_response = self.supabase.rpc('get_user_activity', {
                    'p_user_id': str(user_id),
                    'days': days
                }).execute()
                daily_activity = [
                    UserActivity(date=row['date'], action_count=row['action_count'])
                    for row in daily_response.data
                ]
            except:
                pass  # RPC not available

            # Recent actions
            recent_response = self.supabase.table("audit_logs")\
                .select("*")\
                .eq("user_id", str(user_id))\
                .order("created_at", desc=True)\
                .limit(20)\
                .execute()
            recent_actions = [AuditLogResponse(**log) for log in recent_response.data]

            return UserActivityReport(
                user_id=user_id,
                username=username,
                total_actions=total_actions,
                actions_by_type=actions_by_type,
                daily_activity=daily_activity,
                recent_actions=recent_actions
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error generating user activity report: {str(e)}"
            )
