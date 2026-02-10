@echo off
REM AI Orchestrator - Windows Build Script (Batch File)
REM Alternative to PowerShell script for users who prefer CMD

echo ========================================
echo AI Orchestrator - Windows Build Script
echo ========================================
echo.

REM Check if in correct directory
if not exist package.json (
    echo Error: Please run this script from the AIOrchestrator directory
    pause
    exit /b 1
)

echo [1/5] Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found! Install from https://nodejs.org
    pause
    exit /b 1
)
echo Node.js: OK

REM Check Rust
where rustc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Rust not found! Install from https://rustup.rs
    pause
    exit /b 1
)
echo Rust: OK
echo.

echo [2/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

cd plugins\core\oauth-manager
call npm install
cd ..\..\..

cd plugins\core\project-manager
call npm install
cd ..\..\..

cd plugins\document-generation\docx-generator
call npm install
cd ..\..\..

cd plugins\ai-integrations\claude-integration
call npm install
cd ..\..\..

echo.
echo [3/5] Building frontend...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Frontend build failed
    pause
    exit /b 1
)

echo.
echo [4/5] Building Tauri application...
echo This may take 10-20 minutes on first build...
call npm run tauri:build
if %ERRORLEVEL% NEQ 0 (
    echo Error: Tauri build failed
    pause
    exit /b 1
)

echo.
echo [5/5] Build complete!
echo.
echo ========================================
echo Installer Location:
echo src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi
echo.
echo Executable Location:
echo src-tauri\target\release\ai-orchestrator.exe
echo ========================================
echo.
pause
