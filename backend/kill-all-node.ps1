# Script to kill all Node.js processes
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "Killing Node process PID: $($_.Id)" -ForegroundColor Yellow
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "All Node.js processes have been terminated!" -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

Write-Host "`nYou can now start your server with: npm start" -ForegroundColor Cyan

