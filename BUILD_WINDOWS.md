# Building on Windows

## Why This Guide Exists

Tauri applications need to be built on the target platform. Since we're developing in WSL2, the Rust backend can't compile because it needs Windows GUI libraries. The plugins work fine (they're just Node.js), but the full app needs to be built on Windows.

## Option 1: Build in PowerShell/CMD (Recommended for Windows)

### Prerequisites

1. **Install Rust for Windows:**
   - Download from https://rustup.rs
   - Run the installer
   - Restart terminal

2. **Install Node.js for Windows:**
   - Download from https://nodejs.org
   - Install LTS version

3. **Install Visual Studio Build Tools:**
   - Download from https://visualstudio.microsoft.com/downloads/
   - Select "Desktop development with C++"

### Build Steps

```powershell
# Open PowerShell as Administrator
cd C:\Users\MarcoAniballi\AIOrchestrator

# Install dependencies
npm install

# Install plugin dependencies
cd plugins\core\oauth-manager
npm install
cd ..\..\..\

# Build the app
npm run tauri:build
```

## Option 2: Use GitHub Actions (CI/CD)

Create `.github/workflows/build.yml` to build on GitHub's Windows runners automatically.

## Option 3: Cross-Compilation (Advanced)

Not recommended for Tauri due to WebView requirements.

## Current Development Setup

**What Works in WSL2:**
- ✅ Plugin development (Node.js)
- ✅ Plugin testing
- ✅ Frontend development (React)
- ✅ Documentation

**What Requires Windows:**
- ❌ Rust backend compilation
- ❌ Full Tauri app build
- ❌ Running the GUI application

## Recommended Workflow

1. **Develop plugins in WSL2** (they're just Node.js scripts)
2. **Test plugins standalone** (works in WSL2)
3. **Build full app on Windows** when ready for integration testing

## Testing Without Building

You can test all plugin functionality without building the full Tauri app:

```bash
# In WSL2
cd /mnt/c/Users/MarcoAniballi/AIOrchestrator

# Test OAuth Manager
cd plugins/core/oauth-manager
echo '{"jsonrpc":"2.0","method":"listProviders","params":{},"id":1}' | node index.js

# Test Project Manager
cd ../project-manager
echo '{"jsonrpc":"2.0","method":"listProjects","params":{},"id":1}' | node index.js
```

All the core logic works - we just need Windows to build the GUI shell.

## Alternative: Use Windows Terminal with PowerShell

Install Windows Terminal and develop directly in PowerShell instead of WSL2. This gives you access to both Node.js plugins AND Rust compilation.
