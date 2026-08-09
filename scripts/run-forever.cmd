@echo off
REM Runs the OrderPilot server and automatically restarts it after an applied
REM system update. The server exits with code 87 when an admin uploads and
REM applies an update package (see POST /api/admin/system/update); any other
REM exit code (crash, manual close) stops the loop instead of looping forever.
cd /d "%~dp0.."

:loop
node server.js
if %ERRORLEVEL%==87 (
  echo [OrderPilot] Update applied, restarting server...
  goto loop
)
echo [OrderPilot] Server stopped (exit code %ERRORLEVEL%).
pause
