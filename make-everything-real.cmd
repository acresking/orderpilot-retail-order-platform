@echo off
cd /d %~dp0
set /p API_URL=Enter server URL, for example https://api.your-domain.co.il: 
node scripts\build-installers.js --all --api=%API_URL%
pause
