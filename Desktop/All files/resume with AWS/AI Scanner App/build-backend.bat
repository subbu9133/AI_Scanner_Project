@echo off
echo ========================================
echo    Building AI Scanner Pro Backend
echo ========================================
echo.

echo Cleaning previous build...
call mvn clean

echo.
echo Installing dependencies...
call mvn dependency:resolve

echo.
echo Building project...
call mvn compile

echo.
echo Build complete!
echo.
echo If successful, you can now run:
echo   mvn spring-boot:run
echo.
pause
