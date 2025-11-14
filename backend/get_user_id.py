"""
Find the user ID for admin@nawra.om
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.supabase_client import get_supabase

supabase = get_supabase()

result = supabase.table('users').select('*').eq('email', 'admin@nawra.om').execute()

if result.data and len(result.data) > 0:
    user = result.data[0]
    print("Found user:")
    print(f"  ID:              {user.get('id')}")
    print(f"  Email:           {user.get('email')}")
    print(f"  Name:            {user.get('full_name')}")
    print(f"  Role ID:         {user.get('role_id')}")
    print(f"  User Type:       {user.get('user_type')}")
    print(f"  Active:          {user.get('is_active')}")
    print(f"  Email Verified:  {user.get('email_verified')}")
else:
    print("User not found")
