Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Ensure script stops on errors
$ErrorActionPreference = "Stop"

# Start frontend
$frontendProcess = Start-Process -FilePath "npm" `
    -ArgumentList "run dev" `
    -WorkingDirectory "frontend" `
    -PassThru

# Start backend
$backendProcess = Start-Process -FilePath "python" `
    -ArgumentList "manage.py runserver" `
    -WorkingDirectory "backend" `
    -PassThru

# Cleanup function
function Cleanup {
    Write-Host "Shutting down..."

    if ($frontendProcess -and !$frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force
    }

    if ($backendProcess -and !$backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force
    }

    exit
}

# Handle Ctrl+C and termination
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }
$null = Register-ObjectEvent -InputObject ([Console]::CancelKeyPress) `
    -EventName CancelKeyPress `
    -Action {
        Cleanup
    }

# Block forever
while ($true) {
    Start-Sleep -Seconds 1
}

