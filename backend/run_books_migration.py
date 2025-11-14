"""
Script to run the books and categories tables migration via Supabase
"""
import os
import sys
from dotenv import load_dotenv

# Force UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Load environment variables
load_dotenv()

def run_migration():
    """Run the books and categories tables migration"""

    # Get Supabase credentials
    supabase_url = os.getenv('SUPABASE_URL')
    service_key = os.getenv('SUPABASE_SERVICE_KEY')

    if not supabase_url or not service_key:
        print("[ERROR] SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env file")
        return False

    # Read the SQL migration file
    sql_file = 'migrations/002_create_books_tables.sql'
    print(f"[INFO] Reading migration file: {sql_file}")

    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql = f.read()
    except FileNotFoundError:
        print(f"[ERROR] Migration file not found: {sql_file}")
        return False

    print("-" * 70)
    print("Running Books & Categories Migration")
    print("-" * 70)
    print(f"Supabase URL: {supabase_url}")
    print(f"SQL file size: {len(sql)} characters")
    print()

    # Supabase doesn't provide a direct SQL execution endpoint via REST API
    # We need to use the Supabase dashboard SQL editor

    print("[INFO] Supabase Python/REST API doesn't support direct SQL execution.")
    print()
    print("Please run this migration using ONE of these methods:")
    print()
    print("=" * 70)
    print("METHOD 1: Supabase Dashboard SQL Editor (RECOMMENDED)")
    print("=" * 70)
    print()
    print("1. Open your browser and go to:")
    print(f"   {supabase_url.replace('https://', 'https://supabase.com/dashboard/project/')}/editor")
    print()
    print("2. Click 'SQL Editor' in the left sidebar")
    print("3. Click 'New Query'")
    print("4. Copy the contents of: backend/migrations/002_create_books_tables.sql")
    print("5. Paste into the SQL editor")
    print("6. Click 'Run' (or press Ctrl+Enter / Cmd+Enter)")
    print()
    print("=" * 70)
    print("METHOD 2: Quick Copy (Use this SQL)")
    print("=" * 70)
    print()
    print("Copy this SQL and paste it in Supabase SQL Editor:")
    print()
    print("-" * 70)
    # Print first 1000 characters of SQL as a sample
    print(sql[:1000] + "\n... (file continues)")
    print("-" * 70)
    print()
    print("Direct link to SQL Editor:")
    project_id = supabase_url.split('//')[1].split('.')[0]
    print(f"   https://supabase.com/dashboard/project/{project_id}/sql/new")
    print()

    return True

if __name__ == "__main__":
    print()
    success = run_migration()
    print()

    if success:
        print("[NEXT STEPS]")
        print("   1. Run the SQL in Supabase Dashboard (see instructions above)")
        print("   2. Come back here and press Enter to verify the migration")
        print()
        input("Press Enter after you've run the SQL in Supabase Dashboard...")
        print()

        # Verify the tables exist
        print("[INFO] Verifying migration...")
        from app.db.supabase_client import get_supabase

        try:
            supabase = get_supabase()

            # Check categories table
            categories = supabase.table('categories').select('id').limit(1).execute()
            print("[SUCCESS] Categories table exists")

            # Count categories
            all_categories = supabase.table('categories').select('*').execute()
            print(f"[SUCCESS] Found {len(all_categories.data)} default categories")

            # Check books table
            books = supabase.table('books').select('id').limit(1).execute()
            print("[SUCCESS] Books table exists")

            print()
            print("[COMPLETE] Migration completed successfully!")
            print()
            print("You can now test the Books CRUD operations:")
            print("   - Frontend: http://localhost:3000/admin/catalog")
            print("   - Backend API: http://localhost:8000/api/v1/books")
            print()

        except Exception as e:
            error_str = str(e)
            if 'does not exist' in error_str or 'PGRST205' in error_str:
                print()
                print("[ERROR] Tables still don't exist. Please make sure you ran the SQL in Supabase Dashboard.")
                print()
            else:
                print(f"[ERROR] Error verifying migration: {e}")
