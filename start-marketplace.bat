@echo off
echo ===============================================
echo   FREELANCE MARKETPLACE - LOCAL STARTUP
echo ===============================================
echo.
echo [1/6] Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/6] Clearing specific processes on port 5001...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :5001 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5001...
    taskkill /PID %%a /F >nul 2>&1
)

echo [3/6] Waiting for ports to clear completely...
timeout /t 5 /nobreak >nul

echo [4/6] Verifying port 5001 is free...
netstat -ano | findstr :5001 | findstr LISTENING >nul
if %errorlevel% == 0 (
    echo WARNING: Port 5001 still in use. Waiting longer...
    timeout /t 10 /nobreak >nul
)

echo [5/6] Starting server...
start "Freelance Server" powershell -NoExit -Command "cd 'c:\Users\PC\freelance-marketplace\server'; Write-Host 'Server starting with your credentials:' -ForegroundColor Green; Write-Host 'Freelancer: renu1@gmail.com / renu123456' -ForegroundColor Yellow; Write-Host 'Client: renu2@gmail.com / renu1234567' -ForegroundColor Yellow; Write-Host 'Admin: nikhita@gmail.com / nikhita123' -ForegroundColor Yellow; Write-Host ''; node index.js"

echo [6/6] Waiting for server to initialize, then starting client...
timeout /t 8 /nobreak >nul

start "Freelance Client" powershell -NoExit -Command "cd 'c:\Users\PC\freelance-marketplace\client'; Write-Host 'Client starting with original Tailwind interface...' -ForegroundColor Green; Write-Host 'Open: http://localhost:3000' -ForegroundColor Cyan; Write-Host ''; npm start"

echo.
echo ===============================================
echo   STARTUP COMPLETE!
echo ===============================================
echo.
echo Your freelance marketplace is starting:
echo - Server: http://localhost:5001
echo - Client: http://localhost:3000
echo.
echo Your credentials:
echo - Freelancer: renu1@gmail.com / renu123456
echo - Client: renu2@gmail.com / renu1234567
echo - Admin: nikhita@gmail.com / nikhita123
echo.
echo Press any key to exit this window...
pause >nul
