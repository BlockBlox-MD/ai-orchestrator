# AI Orchestrator - Build and Copy to Desktop
# This script builds the application and copies the installer to Desktop

param(
    [string]$DesktopPath = "$env:USERPROFILE\Desktop"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Orchestrator - Build to Desktop" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the AIOrchestrator directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "Expected: C:\Users\MarcoAniballi\AIOrchestrator" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "[1/7] Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "✓ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust not found!" -ForegroundColor Red
    Write-Host "Install from: https://rustup.rs" -ForegroundColor Yellow
    pause
    exit 1
}

# Check Cargo
try {
    $cargoVersion = cargo --version
    Write-Host "✓ Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Cargo not found!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[2/7] Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Gray
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✓ Root dependencies installed" -ForegroundColor Green

# Install plugin dependencies
$plugins = @(
    "plugins\core\oauth-manager",
    "plugins\core\project-manager",
    "plugins\document-generation\docx-generator",
    "plugins\ai-integrations\claude-integration"
)

foreach ($plugin in $plugins) {
    if (Test-Path $plugin) {
        Write-Host "Installing $plugin..." -ForegroundColor Gray
        Push-Location $plugin
        npm install --silent
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to install $plugin dependencies" -ForegroundColor Red
            Pop-Location
            pause
            exit 1
        }
        Pop-Location
        Write-Host "✓ $plugin dependencies installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[3/7] Cleaning previous builds..." -ForegroundColor Yellow

if (Test-Path "src-tauri\target\release") {
    Remove-Item -Recurse -Force "src-tauri\target\release" -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned release directory" -ForegroundColor Green
}

if (Test-Path "frontend\dist") {
    Remove-Item -Recurse -Force "frontend\dist" -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned frontend dist" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/7] Building frontend..." -ForegroundColor Yellow

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[5/7] Building Tauri application..." -ForegroundColor Yellow
Write-Host "This may take 10-20 minutes on first build..." -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Tauri build failed" -ForegroundColor Red
    pause
    exit 1
}
$buildEnd = Get-Date
$buildTime = ($buildEnd - $buildStart).TotalMinutes

Write-Host "✓ Build completed in $([math]::Round($buildTime, 1)) minutes" -ForegroundColor Green

Write-Host ""
Write-Host "[6/7] Locating and copying installer to Desktop..." -ForegroundColor Yellow

# Find the MSI installer
$msiPath = "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi"
$exePath = "src-tauri\target\release\ai-orchestrator.exe"

if (!(Test-Path $msiPath)) {
    Write-Host "✗ Installer not found at: $msiPath" -ForegroundColor Red
    Write-Host "Searching for installer..." -ForegroundColor Yellow

    $foundMsi = Get-ChildItem -Path "src-tauri\target\release\bundle\msi" -Filter "*.msi" -ErrorAction SilentlyContinue
    if ($foundMsi) {
        $msiPath = $foundMsi.FullName
        Write-Host "Found installer at: $msiPath" -ForegroundColor Yellow
    } else {
        Write-Host "✗ No installer found" -ForegroundColor Red
        pause
        exit 1
    }
}

# Ensure Desktop path exists
if (!(Test-Path $DesktopPath)) {
    Write-Host "✗ Desktop path not found: $DesktopPath" -ForegroundColor Red
    pause
    exit 1
}

# Copy installer to Desktop
$desktopInstallerPath = Join-Path $DesktopPath "AI-Orchestrator-v0.1.0-Windows.msi"
Copy-Item $msiPath $desktopInstallerPath -Force

if (Test-Path $desktopInstallerPath) {
    $installerSize = (Get-Item $desktopInstallerPath).Length / 1MB
    Write-Host "✓ Installer copied to Desktop" -ForegroundColor Green
    Write-Host "  Location: $desktopInstallerPath" -ForegroundColor Gray
    Write-Host "  Size: $([math]::Round($installerSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to copy installer to Desktop" -ForegroundColor Red
    pause
    exit 1
}

# Also copy standalone executable
if (Test-Path $exePath) {
    $desktopExePath = Join-Path $DesktopPath "AI-Orchestrator-v0.1.0-Portable.exe"
    Copy-Item $exePath $desktopExePath -Force

    if (Test-Path $desktopExePath) {
        $exeSize = (Get-Item $desktopExePath).Length / 1MB
        Write-Host "✓ Portable executable copied to Desktop" -ForegroundColor Green
        Write-Host "  Location: $desktopExePath" -ForegroundColor Gray
        Write-Host "  Size: $([math]::Round($exeSize, 2)) MB" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "[7/7] Creating README on Desktop..." -ForegroundColor Yellow

$readmeContent = @"
AI Orchestrator v0.1.0 - Installation Guide
===========================================

Two files have been created:

1. AI-Orchestrator-v0.1.0-Windows.msi
   - Full installer
   - Installs to Program Files
   - Creates Start Menu shortcut
   - Recommended for most users

2. AI-Orchestrator-v0.1.0-Portable.exe
   - Portable version
   - No installation needed
   - Run directly from any location
   - Good for testing

Installation Steps:
------------------
1. Double-click AI-Orchestrator-v0.1.0-Windows.msi
2. Follow the installation wizard
3. Launch from Start Menu: "AI Orchestrator"

What's Included:
---------------
- OAuth Manager - Multi-provider authentication
- Project Manager - Context & artifact management
- DOCX Generator - Professional document creation
- Claude Integration - AI API wrapper

System Requirements:
-------------------
- Windows 10/11 (64-bit)
- 4 GB RAM minimum
- 100 MB disk space

Documentation:
-------------
- Repository: https://github.com/BlockBlox-MD/ai-orchestrator
- Getting Started: See GETTING_STARTED.md in repository
- Support: Open an issue on GitHub

Build Information:
-----------------
Built: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Build time: $([math]::Round($buildTime, 1)) minutes
Version: 0.1.0
Platform: Windows x64

Enjoy!
"@

$readmePath = Join-Path $DesktopPath "AI-Orchestrator-README.txt"
$readmeContent | Out-File -FilePath $readmePath -Encoding UTF8

if (Test-Path $readmePath) {
    Write-Host "✓ README created on Desktop" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Files on Desktop:" -ForegroundColor Yellow
Write-Host ""
if (Test-Path $desktopInstallerPath) {
    Write-Host "  ✓ AI-Orchestrator-v0.1.0-Windows.msi" -ForegroundColor Green
    Write-Host "    Size: $([math]::Round((Get-Item $desktopInstallerPath).Length / 1MB, 2)) MB" -ForegroundColor Gray
}
if (Test-Path $desktopExePath) {
    Write-Host "  ✓ AI-Orchestrator-v0.1.0-Portable.exe" -ForegroundColor Green
    Write-Host "    Size: $([math]::Round((Get-Item $desktopExePath).Length / 1MB, 2)) MB" -ForegroundColor Gray
}
if (Test-Path $readmePath) {
    Write-Host "  ✓ AI-Orchestrator-README.txt" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Install: Double-click the .msi file on your Desktop" -ForegroundColor White
Write-Host "   2. Test: Launch AI Orchestrator from Start Menu" -ForegroundColor White
Write-Host "   3. Share: The installer is ready to distribute!" -ForegroundColor White
Write-Host ""

Write-Host "Build time: $([math]::Round($buildTime, 1)) minutes" -ForegroundColor Gray
Write-Host ""

# Open Desktop folder
Write-Host "Opening Desktop folder..." -ForegroundColor Gray
Start-Process explorer.exe $DesktopPath

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
