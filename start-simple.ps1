Write-Host "==========================================" -ForegroundColor Green
Write-Host "  FREELANCE MARKETPLACE SIMPLE STARTUP" -ForegroundColor Green  
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

Write-Host "Step 2: Starting server on port 5002..." -ForegroundColor Yellow
Set-Location "c:\Users\PC\freelance-marketplace\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'SERVER STARTING...' -ForegroundColor Green; node index.js"

Write-Host "Step 3: Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "Step 4: Starting client on port 3000..." -ForegroundColor Yellow
Set-Location "c:\Users\PC\freelance-marketplace\client"  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'CLIENT STARTING...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your marketplace:" -ForegroundColor Cyan
Write-Host "- Server: http://localhost:5002" -ForegroundColor White
Write-Host "- Client: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Your credentials:" -ForegroundColor Cyan
Write-Host "- Freelancer: renu1@gmail.com / renu123456" -ForegroundColor White
Write-Host "- Client: renu2@gmail.com / renu1234567" -ForegroundColor White
Write-Host "- Admin: nikhita@gmail.com / nikhita123" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
