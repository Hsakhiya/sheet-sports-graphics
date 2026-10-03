@echo off
title Sports Graphics Control Desk
cd /d "%~dp0"

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo ================================================================
    echo   [ERROR] Node.js is not found in your system PATH!
    echo   Please install Node.js from https://nodejs.org to run locally.
    echo ================================================================
    echo.
    pause
    exit /b 1
)

:: 2. Check if server is already running on port 3000
netstat -ano | findstr /R ":3000 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo   [OK] Sports Graphics Server is already active on port 3000!
    echo ================================================================
    echo Opening Control Desk in your default browser...
    start "" "http://localhost:3000"
    echo.
    echo Press any key to close this launcher (server will remain running)...
    pause >nul
    exit /b 0
)

:: 3. Launch browser automatically after 2 seconds
start "" /min cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: 4. Start local broadcast server in console
node server.js
