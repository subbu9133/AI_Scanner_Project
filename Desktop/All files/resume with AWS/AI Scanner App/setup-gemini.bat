@echo off
echo ========================================
echo    AI Scanner Pro - Gemini AI Setup
echo ========================================
echo.

echo This script will help you configure Gemini AI for the application.
echo.

echo Step 1: Get your Gemini AI API Key
echo -----------------------------------
echo 1. Visit: https://makersuite.google.com/app/apikey
echo 2. Sign in with your Google account
echo 3. Create a new API key
echo 4. Copy the API key
echo.

echo Step 2: Configure the application
echo ---------------------------------
echo.

if not exist "backend\.env" (
    echo Creating .env file from template...
    copy "backend\env.example" "backend\.env"
    echo.
    echo Please edit backend\.env and add your Gemini API key
    echo.
    notepad "backend\.env"
) else (
    echo .env file already exists.
    echo.
    echo Current .env file contents:
    echo ----------------------------------------
    type "backend\.env"
    echo ----------------------------------------
    echo.
    echo To edit the file, run: notepad backend\.env
)

echo.
echo Step 3: Start the application
echo ------------------------------
echo Run start-app.bat to start both backend and frontend
echo.

echo ========================================
echo Setup complete! 
echo ========================================
pause
