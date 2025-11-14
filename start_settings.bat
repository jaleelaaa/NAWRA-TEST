@echo off
echo ========================================
echo NAWRA Settings Page - Quick Start
echo ========================================
echo.

echo [Step 1] Opening migration SQL file...
start notepad backend\migrations\create_user_settings_table.sql
echo.
echo Please:
echo 1. Copy the SQL from the opened file
echo 2. Go to your Supabase Dashboard ^> SQL Editor
echo 3. Paste and execute the SQL
echo 4. Come back here
echo.
pause

echo.
echo [Step 2] Starting Backend Server...
echo Backend will run on http://localhost:8000
echo.
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 5

echo.
echo [Step 3] Starting Frontend Server...
echo Frontend will run on http://localhost:3000
echo.
start cmd /k "cd frontend && npm run dev"
timeout /t 8

echo.
echo [Step 4] Opening Settings Page...
echo.
start http://localhost:3000/en/admin/settings

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Servers are running in separate windows.
echo.
echo Access points:
echo   - Backend API: http://localhost:8000/docs
echo   - Frontend:    http://localhost:3000
echo   - Settings:    http://localhost:3000/en/admin/settings
echo   - Arabic:      http://localhost:3000/ar/admin/settings
echo.
echo Close those command windows to stop the servers.
echo.
pause
