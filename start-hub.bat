@echo off
title Student Productivity Hub Launcher
echo ======================================================
echo    Starting Student Productivity Hub Server...
echo ======================================================

cd /d "%~dp0backend"

:: Start the Express server
start "" cmd /k "node server.js"

:: Wait 2 seconds for server to initialize
timeout /t 2 /nobreak >nul

:: Automatically open default browser at localhost:5000
start http://localhost:5000

echo.
echo Application is running at http://localhost:5000
echo You can close this launcher window.
exit
