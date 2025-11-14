"""
Automated setup script for Settings page
"""
import os
import sys
import subprocess
import webbrowser
import time

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def print_step(step_num, text):
    """Print a step"""
    print(f"\n[Step {step_num}] {text}")
    print("-" * 70)

def check_supabase_table():
    """Check if user_settings table exists"""
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
        from app.db.supabase_client import get_supabase

        supabase = get_supabase()
        result = supabase.table('user_settings').select('*').limit(1).execute()
        return True
    except Exception as e:
        if 'user_settings' in str(e).lower() and 'not' in str(e).lower():
            return False
        raise

def open_supabase_sql_editor():
    """Open Supabase SQL Editor"""
    print("\nOpening Supabase SQL Editor in your browser...")
    print("Please paste and execute the migration SQL from:")
    print("  backend/migrations/create_user_settings_table.sql")

    migration_path = os.path.join(os.path.dirname(__file__), 'backend', 'migrations', 'create_user_settings_table.sql')

    # Try to open the SQL file for copying
    if os.path.exists(migration_path):
        print(f"\nMigration file located at: {migration_path}")

        # Read and display first few lines
        with open(migration_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()[:10]
            print("\nFirst few lines of migration:")
            print("..." + "".join(lines) + "...")

def main():
    """Main setup function"""
    print_header("NAWRA Settings Page - Automated Setup")

    # Step 1: Check Supabase connection
    print_step(1, "Checking Supabase Connection")
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
        from app.db.supabase_client import get_supabase

        supabase = get_supabase()
        print("[OK] Supabase connection successful!")
    except Exception as e:
        print(f"[ERROR] Failed to connect to Supabase: {e}")
        print("\nPlease check your Supabase credentials in backend/app/core/config.py")
        return

    # Step 2: Check if migration is needed
    print_step(2, "Checking Database Migration")
    table_exists = check_supabase_table()

    if table_exists:
        print("[OK] user_settings table already exists!")
    else:
        print("[REQUIRED] user_settings table needs to be created")
        print("\nPlease run the migration manually:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Copy the SQL from: backend/migrations/create_user_settings_table.sql")
        print("4. Paste and execute")
        print("\nPress Enter when done to continue...")
        input()

        # Re-check
        if not check_supabase_table():
            print("[ERROR] Table still doesn't exist. Please run the migration first.")
            return

        print("[OK] Migration completed successfully!")

    # Step 3: Start Backend
    print_step(3, "Starting Backend Server")
    print("Starting backend on http://localhost:8000...")

    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')

    # Start backend in background
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

    try:
        backend_process = subprocess.Popen(
            backend_cmd,
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print("[OK] Backend server starting...")
        print("     API Docs: http://localhost:8000/docs")
        time.sleep(3)  # Wait for server to start
    except Exception as e:
        print(f"[ERROR] Failed to start backend: {e}")
        return

    # Step 4: Start Frontend
    print_step(4, "Starting Frontend Server")
    print("Starting frontend on http://localhost:3000...")

    frontend_dir = os.path.join(os.path.dirname(__file__), 'frontend')

    # Start frontend in background
    frontend_cmd = ["npm", "run", "dev"]

    try:
        frontend_process = subprocess.Popen(
            frontend_cmd,
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=True
        )
        print("[OK] Frontend server starting...")
        print("     Settings Page: http://localhost:3000/en/admin/settings")
        time.sleep(5)  # Wait for server to start
    except Exception as e:
        print(f"[ERROR] Failed to start frontend: {e}")
        backend_process.terminate()
        return

    # Step 5: Open browser
    print_step(5, "Opening Settings Page")
    time.sleep(2)
    webbrowser.open('http://localhost:3000/en/admin/settings')

    print_header("Setup Complete!")
    print("Servers are running:")
    print("  - Backend:  http://localhost:8000")
    print("  - Frontend: http://localhost:3000")
    print("  - Settings: http://localhost:3000/en/admin/settings")
    print("\nPress Ctrl+C to stop all servers...")

    try:
        # Keep script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Servers stopped. Goodbye!")

if __name__ == "__main__":
    main()
