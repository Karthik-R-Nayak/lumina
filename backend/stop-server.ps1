# PowerShell script to stop any Node.js server running on port 5000

Write-Host "Checking for processes on port 5000..." -ForegroundColor Yellow

$port = 5000
$connections = netstat -ano | Select-String ":$port" | Select-String "LISTENING"

if ($connections) {
    $pids = $connections | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    } | Select-Object -Unique

    foreach ($pid in $pids) {
        Write-Host "Found process $pid using port $port" -ForegroundColor Yellow
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "✓ Stopped process $pid" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to stop process $pid: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No processes found on port $port" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Green

