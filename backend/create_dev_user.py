"""
Script to create mock dev user directly using Supabase client
"""
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.db.supabase_client import get_supabase

def create_dev_user():
    """Create mock dev user in the database"""

    print("=" * 70)
    print("  Creating Mock Dev User")
    print("=" * 70)
    print()

    try:
        supabase = get_supabase()

        # Check if user already exists
        print("Checking if user already exists...")
        result = supabase.table('users').select('*').eq('id', '00000000-0000-0000-0000-000000000001').execute()

        if result.data and len(result.data) > 0:
            print("[OK] Mock dev user already exists!")
            print()
            user = result.data[0]
            print(f"  ID:        {user.get('id')}")
            print(f"  Email:     {user.get('email')}")
            print(f"  Name:      {user.get('full_name')}")
            print(f"  Role ID:   {user.get('role_id')}")
            print(f"  Active:    {user.get('is_active')}")
            print()
            print("You're all set! Use dev-login.html to access the Settings page.")
            return True

        print("User doesn't exist. Creating now...")
        print()

        # First, get the Administrator role ID
        print("Looking up Administrator role...")
        role_result = supabase.table('roles').select('id').eq('name', 'Administrator').execute()

        if not role_result.data or len(role_result.data) == 0:
            print("ERROR: Administrator role not found in database!")
            print("You need to run the initial schema migration first.")
            print("File: backend/sql/001_initial_schema.sql")
            return False

        admin_role_id = role_result.data[0]['id']
        print(f"Found Administrator role: {admin_role_id}")
        print()

        # Create the user
        user_data = {
            'id': '00000000-0000-0000-0000-000000000001',
            'email': 'admin@nawra.om',
            'full_name': 'Test Admin',
            'role_id': admin_role_id,
            'user_type': 'staff',
            'password_hash': '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7TzH3XluDq',  # password123
            'is_active': True,
            'email_verified': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        print("Inserting user into database...")
        result = supabase.table('users').insert(user_data).execute()

        if result.data and len(result.data) > 0:
            print("[SUCCESS] Mock dev user created!")
            print()
            user = result.data[0]
            print(f"  ID:        {user.get('id')}")
            print(f"  Email:     {user.get('email')}")
            print(f"  Name:      {user.get('full_name')}")
            print(f"  Role ID:   {user.get('role_id')}")
            print(f"  Password:  password123")
            print()
            print("=" * 70)
            print()
            print("[SUCCESS] You can now use dev-login.html to access the Settings page!")
            print()
            return True
        else:
            print("[FAILED] Failed to create user - no data returned")
            return False

    except Exception as e:
        error_msg = str(e)
        print(f"[ERROR] {error_msg}")
        print()

        # Check for specific error types
        if 'foreign key' in error_msg.lower():
            print("This error means the 'users' table doesn't exist yet.")
            print("You need to run the initial database schema first.")
            print()
            print("Check if backend/sql/001_initial_schema.sql has been executed.")
        elif 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
            print("User already exists! You're good to go.")
            return True
        elif 'permission' in error_msg.lower() or 'auth' in error_msg.lower():
            print("This error means you don't have permission to insert into the users table.")
            print("You may need to use the Supabase service key instead of anon key.")
            print()
            print("Please run the SQL migration manually in Supabase Dashboard:")
            print("See RUN_DEV_USER_MIGRATION.md for instructions.")

        return False

if __name__ == "__main__":
    success = create_dev_user()
    sys.exit(0 if success else 1)
