"""
Script to run the user_settings table migration
"""
from app.db.supabase_client import get_supabase

def run_migration():
    """Run the user_settings table migration"""

    # Read the SQL migration file
    with open('migrations/create_user_settings_table.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    # Get Supabase client
    supabase = get_supabase()

    print("Running migration: create_user_settings_table.sql")
    print("-" * 60)

    try:
        # Execute the SQL using Supabase's RPC or direct SQL execution
        # Note: Supabase Python client doesn't support direct SQL execution
        # You need to run this via the Supabase dashboard SQL editor

        print("IMPORTANT:")
        print("The Supabase Python client doesn't support direct SQL execution.")
        print("Please run this migration manually:")
        print("")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy the contents of: backend/migrations/create_user_settings_table.sql")
        print("4. Paste and execute in the SQL editor")
        print("")
        print("Or use psql:")
        print('psql "YOUR_SUPABASE_CONNECTION_STRING" -f migrations/create_user_settings_table.sql')
        print("")

        # Alternative: Check if table exists
        result = supabase.table('user_settings').select('*').limit(1).execute()
        print("SUCCESS: user_settings table already exists!")
        print(f"Table columns: {result.data}")

    except Exception as e:
        error_str = str(e)
        if 'relation "user_settings" does not exist' in error_str or 'table "user_settings" does not exist' in error_str:
            print("Table does not exist yet. Please run the migration manually.")
            print("")
            print("SQL to execute:")
            print("-" * 60)
            print(sql[:500] + "...")
            print("-" * 60)
        else:
            print(f"Error: {e}")
            raise

if __name__ == "__main__":
    run_migration()
