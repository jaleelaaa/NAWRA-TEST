"""
Script to insert mock dev user into the database
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.db.supabase_client import get_supabase

def run_migration():
    """Insert mock dev user into database"""

    print("=" * 70)
    print("  Mock Dev User Migration")
    print("=" * 70)
    print()

    # Read the SQL migration file
    migration_file = os.path.join(os.path.dirname(__file__), 'migrations', 'insert_dev_user.sql')

    if not os.path.exists(migration_file):
        print(f"ERROR: Migration file not found: {migration_file}")
        return False

    print(f"Reading migration: {migration_file}")

    with open(migration_file, 'r', encoding='utf-8') as f:
        sql = f.read()

    print()
    print("IMPORTANT:")
    print("The Supabase Python client doesn't support direct SQL execution.")
    print("You need to run this migration manually via Supabase Dashboard.")
    print()
    print("Follow these steps:")
    print()
    print("1. Go to your Supabase Dashboard")
    print("2. Navigate to SQL Editor")
    print("3. Create a new query")
    print("4. Copy and paste the SQL below")
    print("5. Click 'Run' to execute")
    print()
    print("=" * 70)
    print("SQL TO EXECUTE:")
    print("=" * 70)
    print()
    print(sql)
    print()
    print("=" * 70)
    print()

    # Try to verify if user already exists
    try:
        supabase = get_supabase()
        result = supabase.table('users').select('*').eq('id', '00000000-0000-0000-0000-000000000001').execute()

        if result.data and len(result.data) > 0:
            print("SUCCESS: Mock dev user already exists in database!")
            print()
            user = result.data[0]
            print(f"  ID:        {user.get('id')}")
            print(f"  Email:     {user.get('email')}")
            print(f"  Name:      {user.get('full_name')}")
            print(f"  Role:      {user.get('role')}")
            print(f"  Active:    {user.get('is_active')}")
            print()
            print("You can now use dev-login.html to access the Settings page!")
            return True
        else:
            print("User does not exist yet. Please run the SQL above in Supabase Dashboard.")
            return False

    except Exception as e:
        print(f"Could not verify user: {e}")
        print()
        print("Please run the SQL migration manually in Supabase Dashboard.")
        return False

if __name__ == "__main__":
    run_migration()
