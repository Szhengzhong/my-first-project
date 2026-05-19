$ErrorActionPreference = "Stop"

$projects = @("cockpit", "portal", "nvr", "kiosk", "image")

foreach ($project in $projects) {
    Write-Host "Installing dependencies for $project..."
    Push-Location $project
    try {
        npm install --no-audit --no-fund --cache .npm-cache --legacy-peer-deps --ignore-scripts
    } finally {
        if (Test-Path .npm-cache) {
            Remove-Item -Recurse -Force .npm-cache
        }
        Pop-Location
    }
}

Write-Host "Windows initialization complete."
