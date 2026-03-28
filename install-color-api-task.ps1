param(
    [string]$TaskName = "AI-SmartUI-ColorAPI",
    [string]$ProjectDir = "C:\Users\frank\OneDrive\Documents\ai-smart-ui\final_year_project"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$runner = Join-Path $root "run-color-api.ps1"

if (!(Test-Path $runner)) {
    throw "Missing runner script: $runner"
}
if (!(Test-Path $ProjectDir)) {
    throw "Project directory not found: $ProjectDir"
}

$psExe = "$env:WINDIR\System32\WindowsPowerShell\v1.0\powershell.exe"
if (!(Test-Path $psExe)) {
    $psExe = "powershell.exe"
}

$arg = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$runner`" -ProjectDir `"$ProjectDir`""

$action = New-ScheduledTaskAction -Execute $psExe -Argument $arg
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1)

# Overwrite existing task if present
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction Stop
} catch {
    # ignore not-found
}

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Runs AI Smart UI color API in background on login" | Out-Null

Write-Host "Installed startup task: $TaskName"
Write-Host "Start now: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "Check state: Get-ScheduledTask -TaskName '$TaskName' | Get-ScheduledTaskInfo"
Write-Host "Current project dir: $ProjectDir"

