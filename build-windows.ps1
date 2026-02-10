# AI Orchestrator - Windows Build Script
# Run this script in PowerShell to build the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI Orchestrator - Windows Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running in correct directory
if (!(Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the AIOrchestrator directory" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found! Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Rust
try {
    $rustVersion = rustc --version
    Write-Host "✓ Rust: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust not found! Please install from https://rustup.rs" -ForegroundColor Red
    exit 1
}

# Check Cargo
try {
    $cargoVersion = cargo --version
    Write-Host "✓ Cargo: $cargoVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Cargo not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow

# Install root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install root dependencies" -ForegroundColor Red
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
        Write-Host "Installing $plugin dependencies..." -ForegroundColor Gray
        Push-Location $plugin
        npm install --silent
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to install $plugin dependencies" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        Pop-Location
        Write-Host "✓ $plugin dependencies installed" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[3/6] Cleaning previous builds..." -ForegroundColor Yellow

if (Test-Path "src-tauri\target\release") {
    Remove-Item -Recurse -Force "src-tauri\target\release" -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned release directory" -ForegroundColor Green
}

if (Test-Path "frontend\dist") {
    Remove-Item -Recurse -Force "frontend\dist" -ErrorAction SilentlyContinue
    Write-Host "✓ Cleaned frontend dist" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/6] Building frontend..." -ForegroundColor Yellow

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Building Rust backend and creating installer..." -ForegroundColor Yellow
Write-Host "This may take 10-20 minutes on first build..." -ForegroundColor Gray

npm run tauri:build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Tauri build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "[6/6] Locating installer..." -ForegroundColor Yellow

$msiPath = "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi"
$exePath = "src-tauri\target\release\ai-orchestrator.exe"

if (Test-Path $msiPath) {
    $msiSize = (Get-Item $msiPath).Length / 1MB
    Write-Host "✓ Installer created: $msiPath" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($msiSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "⚠ Installer not found at expected location" -ForegroundColor Yellow
}

if (Test-Path $exePath) {
    $exeSize = (Get-Item $exePath).Length / 1MB
    Write-Host "✓ Executable created: $exePath" -ForegroundColor Green
    Write-Host "  Size: $([math]::Round($exeSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "⚠ Executable not found at expected location" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $msiPath) {
    Write-Host "📦 Installer Location:" -ForegroundColor Yellow
    Write-Host "   $msiPath" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Test the installer:" -ForegroundColor White
    Write-Host "      .\$msiPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   2. Or run standalone executable:" -ForegroundColor White
    Write-Host "      .\$exePath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   3. Create GitHub release:" -ForegroundColor White
    Write-Host "      gh release create v0.1.0 '$msiPath'" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
