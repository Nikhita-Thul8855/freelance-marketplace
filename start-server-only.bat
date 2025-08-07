@echo off
title Freelance Marketplace Server
echo ========================================
echo   STARTING SERVER ON PORT 5002
echo ========================================
echo.

echo Killing any Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul

echo Starting server...
cd /d "c:\Users\PC\freelance-marketplace\server"
node index.js

pause
