# Script to kill process using port 5000
Write-Host "Checking for processes using port 5000..." -ForegroundColor Yellow

$port = 5000
$processes = netstat -ano | findstr ":$port"

if ($processes) {
    Write-Host "Found processes using port $port:" -ForegroundColor Red
    $processes | ForEach-Object {
        $line = $_ -split '\s+'
        $pid = $line[-1]
        if ($pid -match '^\d+$') {
            Write-Host "Killing process PID: $pid" -ForegroundColor Yellow
            taskkill /F /PID $pid 2>$null
        }
    }
    Write-Host "Port $port is now free!" -ForegroundColor Green
} else {
    Write-Host "No processes found using port $port" -ForegroundColor Green
}

Write-Host "`nYou can now start your server with: npm start" -ForegroundColor Cyan

