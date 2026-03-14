@echo off
echo Checking for processes on port 5000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Found process %%a using port 5000
    taskkill /F /PID %%a
    echo Stopped process %%a
)

echo Done!
pause

