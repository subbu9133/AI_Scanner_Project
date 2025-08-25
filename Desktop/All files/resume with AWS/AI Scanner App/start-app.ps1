Write-Host "Starting AI Scanner Pro with Gemini AI..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend (Spring Boot) on port 8054..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run"

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "Starting Frontend (React)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "AI Scanner Pro is starting up!" -ForegroundColor Green
Write-Host "Backend will be available at: http://localhost:8054" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Gemini AI is configured and ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
