"""
User service - Business logic for user management
"""
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from uuid import UUID
from ..db import get_supabase
from ..core.security import get_password_hash
import math


class UserService:
    """User service for CRUD operations"""

    def __init__(self):
        self.supabase = get_supabase()

    async def get_users(
        self,
        page: int = 1,
        page_size: int = 12,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> Dict:
        """
        Get paginated list of users with filtering and sorting
        """
        try:
            # Build query
            query = self.supabase.table('users').select(
                "id, email, full_name, arabic_name, user_type, is_active, phone, address, last_login, created_at, updated_at, roles(name)",
                count="exact"
            )

            # Apply search filter
            if search:
                query = query.or_(f"full_name.ilike.%{search}%,email.ilike.%{search}%,arabic_name.ilike.%{search}%")

            # Apply role filter
            if role:
                # Get role ID from role name
                role_response = self.supabase.table('roles').select('id').eq('name', role).single().execute()
                if role_response.data:
                    role_id = role_response.data['id']
                    query = query.eq('role_id', role_id)

            # Apply active status filter
            if is_active is not None:
                query = query.eq('is_active', is_active)

            # Apply sorting
            ascending = sort_order.lower() == "asc"
            query = query.order(sort_by, desc=not ascending)

            # Apply pagination
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)

            # Execute query
            response = query.execute()

            # Get total count
            total = response.count if hasattr(response, 'count') else len(response.data)

            # Transform data
            users = []
            for user in response.data:
                users.append({
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'arabic_name': user.get('arabic_name'),
                    'user_type': user['user_type'],
                    'role': user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
                    'is_active': user['is_active'],
                    'phone': user.get('phone'),
                    'address': user.get('address'),
                    'last_login': user.get('last_login'),
                    'created_at': user['created_at'],
                    'updated_at': user['updated_at']
                })

            # Calculate pagination
            total_pages = math.ceil(total / page_size) if total > 0 else 0

            return {
                'items': users,
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': total_pages
            }

        except Exception as e:
            print(f"Error fetching users: {str(e)}")
            raise Exception(f"Failed to fetch users: {str(e)}")

    async def get_user(self, user_id: str) -> Optional[Dict]:
        """
        Get single user by ID
        """
        try:
            response = self.supabase.table('users').select(
                "id, email, full_name, arabic_name, user_type, is_active, phone, address, last_login, created_at, updated_at, roles(name)"
            ).eq('id', user_id).single().execute()

            if not response.data:
                return None

            user = response.data
            return {
                'id': user['id'],
                'email': user['email'],
                'full_name': user['full_name'],
                'arabic_name': user.get('arabic_name'),
                'user_type': user['user_type'],
                'role': user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron',
                'is_active': user['is_active'],
                'phone': user.get('phone'),
                'address': user.get('address'),
                'last_login': user.get('last_login'),
                'created_at': user['created_at'],
                'updated_at': user['updated_at']
            }

        except Exception as e:
            print(f"Error fetching user: {str(e)}")
            return None

    async def create_user(self, user_data: Dict) -> Dict:
        """
        Create new user
        """
        try:
            # Get role_id if role is provided
            role_id = None
            if user_data.get('role_id'):
                role_id = user_data['role_id']
            else:
                # Default to Patron role
                role_response = self.supabase.table('roles').select('id').eq('name', 'Patron').single().execute()
                if role_response.data:
                    role_id = role_response.data['id']

            # Hash password
            password_hash = get_password_hash(user_data['password'])

            # Prepare user data
            new_user = {
                'email': user_data['email'],
                'full_name': user_data['full_name'],
                'arabic_name': user_data.get('arabic_name'),
                'user_type': user_data['user_type'],
                'password_hash': password_hash,
                'role_id': role_id,
                'is_active': user_data.get('is_active', True),
                'phone': user_data.get('phone'),
                'address': user_data.get('address'),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }

            # Insert user
            response = self.supabase.table('users').insert(new_user).execute()

            if not response.data:
                raise Exception("Failed to create user")

            # Fetch created user with role
            return await self.get_user(response.data[0]['id'])

        except Exception as e:
            print(f"Error creating user: {str(e)}")
            raise Exception(f"Failed to create user: {str(e)}")

    async def update_user(self, user_id: str, user_data: Dict) -> Dict:
        """
        Update existing user
        """
        try:
            # Prepare update data
            update_data = {'updated_at': datetime.utcnow().isoformat()}

            # Add fields if provided
            if 'email' in user_data:
                update_data['email'] = user_data['email']
            if 'full_name' in user_data:
                update_data['full_name'] = user_data['full_name']
            if 'arabic_name' in user_data:
                update_data['arabic_name'] = user_data['arabic_name']
            if 'user_type' in user_data:
                update_data['user_type'] = user_data['user_type']
            if 'phone' in user_data:
                update_data['phone'] = user_data['phone']
            if 'address' in user_data:
                update_data['address'] = user_data['address']
            if 'is_active' in user_data:
                update_data['is_active'] = user_data['is_active']
            if 'role_id' in user_data:
                update_data['role_id'] = user_data['role_id']

            # Hash password if provided
            if 'password' in user_data and user_data['password']:
                update_data['password_hash'] = get_password_hash(user_data['password'])

            # Update user
            response = self.supabase.table('users').update(update_data).eq('id', user_id).execute()

            if not response.data:
                raise Exception("User not found or update failed")

            # Fetch updated user with role
            return await self.get_user(user_id)

        except Exception as e:
            print(f"Error updating user: {str(e)}")
            raise Exception(f"Failed to update user: {str(e)}")

    async def delete_user(self, user_id: str) -> bool:
        """
        Delete user
        """
        try:
            response = self.supabase.table('users').delete().eq('id', user_id).execute()
            return True

        except Exception as e:
            print(f"Error deleting user: {str(e)}")
            raise Exception(f"Failed to delete user: {str(e)}")

    async def get_user_stats(self) -> Dict:
        """
        Get user statistics
        """
        try:
            # Get all users
            all_users = self.supabase.table('users').select(
                "id, is_active, user_type, created_at, roles(name)"
            ).execute()

            users = all_users.data

            # Calculate stats
            total_users = len(users)
            active_users = sum(1 for u in users if u['is_active'])
            inactive_users = total_users - active_users

            # Users by role
            users_by_role = {}
            for user in users:
                role = user.get('roles', {}).get('name', 'Patron') if user.get('roles') else 'Patron'
                users_by_role[role] = users_by_role.get(role, 0) + 1

            # Users by type
            users_by_type = {}
            for user in users:
                user_type = user.get('user_type', 'Patron')
                users_by_type[user_type] = users_by_type.get(user_type, 0) + 1

            # Recent signups (last 30 days)
            thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            recent_signups = sum(1 for u in users if u.get('created_at', '') >= thirty_days_ago)

            return {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': inactive_users,
                'users_by_role': users_by_role,
                'users_by_type': users_by_type,
                'recent_signups': recent_signups
            }

        except Exception as e:
            print(f"Error getting user stats: {str(e)}")
            raise Exception(f"Failed to get user stats: {str(e)}")
