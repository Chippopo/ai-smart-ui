param(
    [string]$ProjectDir = "C:\Users\frank\OneDrive\Documents\ai-smart-ui\final_year_project",
    [string]$Host = "127.0.0.1",
    [int]$Port = 8000,
    [string]$LogFile = "C:\Users\frank\OneDrive\Documents\ai-smart-ui\color-api.log"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message)
    $ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "$ts | $Message" | Add-Content -Path $LogFile
}

if (!(Test-Path $ProjectDir)) {
    Write-Log "ERROR Project directory not found: $ProjectDir"
    throw "Project directory not found: $ProjectDir"
}

$apiServer = Join-Path $ProjectDir "api_server.py"
if (!(Test-Path $apiServer)) {
    Write-Log "ERROR api_server.py missing at: $apiServer"
    throw "api_server.py missing at: $apiServer"
}

function Get-PythonExe {
    param([string]$ProjectDir)

    $venvPy = Join-Path $ProjectDir ".venv\Scripts\python.exe"
    $candidates = @(
        $venvPy,
        "py",
        "python",
        "python3",
        "C:\\Windows\\py.exe",
        "$env:LOCALAPPDATA\\Programs\\Python\\Python314\\python.exe",
        "$env:LOCALAPPDATA\\Programs\\Python\\Python313\\python.exe",
        "$env:LOCALAPPDATA\\Programs\\Python\\Python312\\python.exe",
        "$env:LOCALAPPDATA\\Programs\\Python\\Python311\\python.exe",
        "$env:LOCALAPPDATA\\Programs\\Python\\Python310\\python.exe"
    )

    foreach ($c in $candidates) {
        try {
            if ($c -match "\\.exe$") {
                if (Test-Path $c) { return $c }
            } else {
                $cmd = Get-Command $c -ErrorAction SilentlyContinue
                if ($cmd) { return $cmd.Source }
            }
        } catch {}
    }

    return $null
}

$pythonExe = Get-PythonExe -ProjectDir $ProjectDir
if (-not $pythonExe) {
    Write-Log "ERROR No Python executable found."
    throw "No Python executable found."
}

Write-Log "Using Python: $pythonExe"

while ($true) {
    try {
        Push-Location $ProjectDir

        $args = @("-E", "-s", "-m", "uvicorn", "api_server:app", "--host", $Host, "--port", "$Port")
        Write-Log "Starting uvicorn in $ProjectDir"
        & $pythonExe @args *>> "$LogFile"

        Pop-Location
        Write-Log "Uvicorn process exited. Restarting in 5s."
    }
    catch {
        try { Pop-Location } catch {}
        Write-Log "ERROR $($_.Exception.Message)"
    }

    Start-Sleep -Seconds 5
}
