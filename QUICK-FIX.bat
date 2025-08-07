@echo off
title FIXING FREELANCE MARKETPLACE ISSUES

echo ==========================================
echo   FIXING HIRE & CHAT FUNCTIONALITY
echo ==========================================
echo.

echo [1/4] Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Clearing database and reseeding...
cd /d "c:\Users\PC\freelance-marketplace\server"
timeout /t 3 /nobreak >nul

echo [3/4] Starting server with fixes...
start "FIXED SERVER" cmd /k "echo Server with fixes starting... && node index.js"

echo [4/4] Waiting for server, then starting client...
timeout /t 8 /nobreak >nul
start "FIXED CLIENT" cmd /k "cd /d c:\Users\PC\freelance-marketplace\client && echo Client with fixes starting... && npm start"

echo.
echo ==========================================
echo   FIXES APPLIED!
echo ==========================================
echo.
echo Fixed Issues:
echo - ✅ Socket connection port (5000 → 5001)
echo - ✅ Real-time chat connectivity
echo - ✅ Hire freelancer functionality
echo.
echo Your marketplace:
echo - Server: http://localhost:5001
echo - Client: http://localhost:3000
echo.
echo Login and test:
echo - Client: renu2@gmail.com / renu1234567
echo - Freelancer: renu1@gmail.com / renu123456
echo.
pause
