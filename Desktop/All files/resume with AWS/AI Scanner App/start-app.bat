@echo off
echo Starting AI Scanner Pro with Gemini AI...
echo.

echo Starting Backend (Spring Boot) on port 8054...
start "Backend" cmd /k "cd backend && mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 15 /nobreak >nul

echo Starting Frontend (React)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo AI Scanner Pro is starting up!
echo Backend will be available at: http://localhost:8054
echo Frontend will be available at: http://localhost:3000
echo.
echo Your Gemini AI is configured and ready!
echo.
echo Press any key to close this window...
pause >nul
