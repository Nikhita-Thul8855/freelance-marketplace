@echo off
echo ===============================================
echo   FREELANCE MARKETPLACE - STATUS CHECK
echo ===============================================
echo.

echo Checking server (port 5001)...
netstat -ano | findstr :5001 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ✅ Server is RUNNING on port 5001
) else (
    echo ❌ Server is NOT running on port 5001
)

echo.
echo Checking client (port 3000)...
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ✅ Client is RUNNING on port 3000
) else (
    echo ❌ Client is NOT running on port 3000
)

echo.
echo Checking Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe >nul
if %errorlevel% == 0 (
    echo ✅ Node.js processes found:
    tasklist /FI "IMAGENAME eq node.exe" | findstr node.exe
) else (
    echo ❌ No Node.js processes running
)

echo.
echo ===============================================
echo   STATUS CHECK COMPLETE
echo ===============================================
echo.
echo If both server and client are running:
echo - Open: http://localhost:3000
echo - Login with your credentials
echo.
echo If services are NOT running:
echo - Use: start-marketplace.bat
echo.
pause
