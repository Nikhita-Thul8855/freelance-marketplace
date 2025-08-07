@echo off
color 0A
title FREELANCE MARKETPLACE - FINAL STARTUP

echo ==========================================
echo   FREELANCE MARKETPLACE STARTUP
echo ==========================================
echo.

echo [Step 1] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo   Done!

echo.
echo [Step 2] Waiting 5 seconds for cleanup...
timeout /t 5 /nobreak >nul
echo   Done!

echo.
echo [Step 3] Starting SERVER in new window...
start "FREELANCE SERVER" /D "c:\Users\PC\freelance-marketplace\server" cmd /k "echo Starting server... && node index.js"
echo   Server window opened!

echo.
echo [Step 4] Waiting 10 seconds for server...
timeout /t 10 /nobreak >nul
echo   Done!

echo.
echo [Step 5] Starting CLIENT in new window...
start "FREELANCE CLIENT" /D "c:\Users\PC\freelance-marketplace\client" cmd /k "echo Starting client... && npm start"
echo   Client window opened!

echo.
echo ==========================================
echo   STARTUP COMPLETE!
echo ==========================================
echo.
echo Your marketplace is starting in separate windows:
echo - Server: http://localhost:5001
echo - Client: http://localhost:3000
echo.
echo Login credentials:
echo - Freelancer: renu1@gmail.com / renu123456
echo - Client: renu2@gmail.com / renu1234567
echo - Admin: nikhita@gmail.com / nikhita123
echo.
echo Wait 1-2 minutes for everything to load completely.
echo.
pause
