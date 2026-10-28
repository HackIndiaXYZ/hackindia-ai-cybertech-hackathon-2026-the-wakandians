# Helper to start backend and serve frontend build (PowerShell)
# Opens two new PowerShell windows and keeps them open.

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Start backend in new window
$backendCmd = "cd `"$repoRoot\src\backend`"; (Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; & `"$repoRoot\src\backend\.venv\Scripts\Activate.ps1`"; python run.py"
Start-Process powershell -ArgumentList "-NoExit","-Command",$backendCmd

# Start frontend static server in new window
$frontendCmd = "cd `"$repoRoot`"; python -m http.server 3000 --directory src/frontend/build"
Start-Process powershell -ArgumentList "-NoExit","-Command",$frontendCmd

Write-Host "Started backend and frontend servers in new windows." -ForegroundColor Green
