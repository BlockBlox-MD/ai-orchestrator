# Simple Build Script - Minimal version
# If build-to-desktop.ps1 doesn't work, try this

Write-Host "AI Orchestrator - Simple Build" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "[1/3] Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Build
Write-Host "[2/3] Building application (this takes 10-20 minutes)..." -ForegroundColor Yellow
npm run tauri:build

# Step 3: Copy to desktop
Write-Host "[3/3] Copying to Desktop..." -ForegroundColor Yellow
$msi = "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi"
if (Test-Path $msi) {
    Copy-Item $msi "$env:USERPROFILE\Desktop\AI-Orchestrator.msi"
    Write-Host "Done! Check your Desktop for AI-Orchestrator.msi" -ForegroundColor Green
} else {
    Write-Host "Build failed - installer not found" -ForegroundColor Red
}

pause
