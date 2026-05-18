@echo off
cd /d %~dp0
node scripts\build-installers.js --all --local
pause
