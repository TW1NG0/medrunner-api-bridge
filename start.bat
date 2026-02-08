@echo off
setlocal
cd /d %~dp0

:: Check if node_modules exists
if not exist "node_modules\" (
    echo Initial Setup: Installing required components...
    echo This may take a moment depending on your internet connection...
    call npm install
    if %errorlevel% neq 0 (
        echo Error: Installation failed! 
        echo Please ensure that Node.js is installed on your system.
        pause
        exit
    )
    echo Installation complete!
)

:: Start the main application in a new window
start "Medrunner API Bridge" cmd /k "npm start"

:: Close this starter window
exit