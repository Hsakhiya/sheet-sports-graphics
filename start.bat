@echo off
title Sports Graphics Control Desk
cd /d "%~dp0"

REM 1. Check if Node.js is installed
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

REM 2. Check if server is already running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo ================================================================
    echo   [OK] Sports Graphics Server is already active on port 3000!
    echo ================================================================
    echo Opening Control Desk in your default browser...
    start "" "http://localhost:3000"
    echo.
    echo Server is running. Press any key to exit this window.
    pause >nul
    exit /b 0
)

REM 3. Launch browser automatically
start "" "http://localhost:3000"

REM 4. Start local broadcast server in console
node server.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo ================================================================
    echo   Server stopped. Press any key to close this window.
    echo ================================================================
    pause
)
