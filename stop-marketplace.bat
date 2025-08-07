@echo off
echo ===============================================
echo   STOPPING FREELANCE MARKETPLACE
echo ===============================================
echo.
echo Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Successfully stopped all Node.js processes
) else (
    echo ℹ️  No Node.js processes were running
)

echo.
echo Checking for processes on port 5001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5001...
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo ===============================================
echo   MARKETPLACE STOPPED
echo ===============================================
echo.
echo All processes have been terminated.
echo You can now restart the marketplace safely.
echo.
pause
