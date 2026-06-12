@echo off
:: Set PATH for this terminal session
set PATH=%PATH%;C:\Program Files\nodejs

:: Open Server in a new window
start "BuddyUps Backend Server" cmd /k "set PATH=%%PATH%%;C:\Program Files\nodejs && cd /d %~dp0 && npm run server"

:: Open Client in a new window
start "BuddyUps Client Server" cmd /k "set PATH=%%PATH%%;C:\Program Files\nodejs && cd /d %~dp0 && npm run client"
