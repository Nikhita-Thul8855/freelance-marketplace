@echo off
color 0A
title MARKETPLACE STATUS

echo ==========================================
echo   FREELANCE MARKETPLACE STATUS
echo ==========================================
echo.

echo Checking ports...

netstat -ano | findstr :5001 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ✅ SERVER: Running on http://localhost:5001
) else (
    echo ❌ SERVER: Not running
)

netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo ✅ CLIENT: Running on http://localhost:3000
) else (
    echo ❌ CLIENT: Not running
)

echo.
echo ==========================================

netstat -ano | findstr :5001 | findstr LISTENING >nul
if %errorlevel% == 0 (
    netstat -ano | findstr :3000 | findstr LISTENING >nul
    if !errorlevel! == 0 (
        echo   🎉 MARKETPLACE IS RUNNING!
        echo   👉 Open: http://localhost:3000
        echo   👤 Login: renu1@gmail.com / renu123456
        echo.
        echo   ⚠️  DON'T START IT AGAIN!
        echo   💡 Just use the browser link above
    ) else (
        echo   ⚠️  Only server running. Start client.
    )
) else (
    echo   ❌ Nothing running. Use START-FINAL.bat
)

echo ==========================================
echo.
pause
