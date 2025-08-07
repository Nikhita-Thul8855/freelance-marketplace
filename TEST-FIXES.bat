@echo off
title TESTING FIXES

echo ==========================================
echo   TESTING HIRE FREELANCER & CHAT FIXES
echo ==========================================
echo.

echo [1] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2] Waiting for cleanup...
timeout /t 3 /nobreak >nul

echo [3] Starting server...
start "SERVER" /D "c:\Users\PC\freelance-marketplace\server" cmd /k "node index.js"

echo [4] Waiting for server...
timeout /t 8 /nobreak >nul

echo [5] Starting client...
start "CLIENT" /D "c:\Users\PC\freelance-marketplace\client" cmd /k "npm start"

echo.
echo ==========================================
echo   FIXES APPLIED!
echo ==========================================
echo.
echo Fixed issues:
echo - ✅ Socket service environment detection
echo - ✅ Better error handling for order creation
echo - ✅ Real-time chat connection status
echo - ✅ Improved logging for debugging
echo.
echo Test these features:
echo 1. Login as client (renu2@gmail.com / renu1234567)
echo 2. Go to a gig and click "Hire Freelancer"
echo 3. Try "Real-Time Chat" button
echo.
echo Open: http://localhost:3000
echo.
pause
