@echo off
title Stop Sports Graphics Server
echo.
echo ================================================================
echo   Stopping Sports Graphics Server on port 3000...
echo ================================================================
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set FOUND=1
    taskkill /f /pid %%a >nul 2>nul
    echo [OK] Stopped server process (PID %%a)
)

if %FOUND% equ 0 (
    echo [INFO] No server was running on port 3000.
) else (
    echo [OK] Server successfully stopped.
)

echo.
timeout /t 2 >nul
