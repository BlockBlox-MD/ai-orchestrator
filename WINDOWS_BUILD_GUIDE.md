# Windows Build Guide - AI Orchestrator

## Complete Step-by-Step Instructions for Windows

This guide will help you build the AI Orchestrator application on Windows and create a release installer.

---

## Part 1: Windows Development Environment Setup

### Prerequisites Installation

#### 1. Install Microsoft Visual Studio Build Tools

**Download:** https://visualstudio.microsoft.com/downloads/

**Option A: Visual Studio 2022 Community (Recommended)**
1. Download Visual Studio 2022 Community (free)
2. During installation, select:
   - ✅ **Desktop development with C++**
   - ✅ **Windows 10/11 SDK**
3. Click Install (this may take 15-30 minutes)

**Option B: Build Tools Only**
1. Download "Build Tools for Visual Studio 2022"
2. Select: **C++ build tools**
3. Install

#### 2. Install Rust

**Download:** https://rustup.rs

1. Click "Download rustup-init.exe"
2. Run the installer
3. Choose: **"1) Proceed with installation (default)"**
4. Wait for installation to complete
5. **Close and reopen** your terminal (PowerShell/CMD)

**Verify installation:**
```powershell
rustc --version
cargo --version
```

You should see version numbers (e.g., `rustc 1.75.0`)

#### 3. Install Node.js (if not already installed)

**Download:** https://nodejs.org

1. Download LTS version (currently 20.x)
2. Run installer with default options
3. Restart terminal

**Verify:**
```powershell
node --version
npm --version
```

#### 4. Install Git (if not already installed)

**Download:** https://git-scm.com/download/win

1. Download and install with default options
2. Restart terminal

---

## Part 2: Build the Application on Windows

### Step 1: Open PowerShell or Command Prompt

**Recommended:** Use PowerShell as Administrator

1. Press `Windows Key`
2. Type "PowerShell"
3. Right-click → "Run as Administrator"

### Step 2: Navigate to Project Directory

```powershell
cd C:\Users\MarcoAniballi\AIOrchestrator
```

### Step 3: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install plugin dependencies
cd plugins\core\oauth-manager
npm install
cd ..\..\..

cd plugins\core\project-manager
npm install
cd ..\..\..

cd plugins\document-generation\docx-generator
npm install
cd ..\..\..

cd plugins\ai-integrations\claude-integration
npm install
cd ..\..\..
```

### Step 4: Build Rust Backend

```powershell
cd src-tauri
cargo build
cd ..
```

**This may take 10-15 minutes on first build** (downloading and compiling dependencies)

**Expected output:**
- Many lines of "Compiling..."
- Ends with "Finished dev [unoptimized + debuginfo] target(s) in XXXs"

**If you get errors:**
- Make sure Visual Studio Build Tools are installed
- Restart your terminal
- Try running as Administrator

### Step 5: Run Development Build

```powershell
npm run tauri:dev
```

**What should happen:**
1. Vite dev server starts on http://localhost:5173
2. Rust compiles (if not already compiled)
3. Application window opens
4. You see the Plugin Manager interface

**Troubleshooting:**

**Error: "cannot find module..."**
```powershell
npm install
```

**Error: "WebView2 not found"**
- Windows 10/11 usually have it pre-installed
- If not, download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

**Port 5173 already in use:**
```powershell
# Kill the process using port 5173
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

### Step 6: Test the Application

Once the app opens:

#### Test 1: Plugin Discovery
- Look at the Plugin Manager
- Should show 4 plugins:
  - OAuth Manager (Core)
  - Project Manager (Core)
  - DOCX Generator (Document Generation)
  - Claude Integration (AI Integrations)

#### Test 2: Load a Plugin
1. Click "Load Plugin" on OAuth Manager
2. Status should change to "Loaded"
3. Check terminal for "OAuth Manager plugin started"

#### Test 3: Test Plugin Method (Browser Console)
1. Press `F12` to open DevTools
2. Go to Console tab
3. Paste and run:

```javascript
const { invoke } = window.__TAURI__.core;

// Test OAuth Manager
const providers = await invoke('call_plugin_method', {
  pluginId: 'oauth-manager',
  method: 'listProviders',
  params: {}
});
console.log('Providers:', providers);
```

**Expected output:**
```json
{
  "claude": {"name": "Anthropic Claude", "authenticated": false},
  "openai": {"name": "OpenAI", "authenticated": false},
  "google": {"name": "Google Gemini", "authenticated": false}
}
```

#### Test 4: Generate a Document
```javascript
// Load DOCX Generator plugin first from UI

// Then in console:
const doc = await invoke('call_plugin_method', {
  pluginId: 'docx-generator',
  method: 'generateSimple',
  params: {
    title: 'Test from Windows',
    body: 'This document was generated on Windows!',
    outputPath: 'C:\\Users\\MarcoAniballi\\Documents\\test-windows.docx'
  }
});
console.log('Document:', doc);
```

**Check:** File created at `C:\Users\MarcoAniballi\Documents\test-windows.docx`

---

## Part 3: Build Release Installer

### Step 1: Clean Previous Builds

```powershell
cd C:\Users\MarcoAniballi\AIOrchestrator

# Remove previous builds
Remove-Item -Recurse -Force src-tauri\target\release -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force frontend\dist -ErrorAction SilentlyContinue
```

### Step 2: Build Production Release

```powershell
npm run tauri:build
```

**This will:**
1. Build optimized React frontend
2. Compile Rust in release mode (optimized)
3. Create Windows installer (.msi)
4. Create standalone executable

**Time:** 10-20 minutes (first time)

**Expected output:**
```
✓ Built frontend
✓ Compiled Rust release build
✓ Created installer
```

### Step 3: Find Your Installer

**Location:**
```
src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi
```

**Also created:**
- `src-tauri\target\release\ai-orchestrator.exe` - Standalone executable
- `src-tauri\target\release\bundle\nsis\` - NSIS installer (if configured)

### Step 4: Test the Installer

#### Option A: Install Locally

1. **Run the installer:**
```powershell
.\src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi
```

2. **Follow installation wizard:**
   - Accept license
   - Choose install location (default: `C:\Program Files\AI Orchestrator\`)
   - Click Install

3. **Launch the app:**
   - Start Menu → AI Orchestrator
   - Or desktop shortcut (if created)

4. **Test functionality:**
   - Load plugins
   - Generate a document
   - Verify everything works

#### Option B: Test Without Installing

```powershell
.\src-tauri\target\release\ai-orchestrator.exe
```

This runs the standalone executable without installation.

---

## Part 4: Code Signing (Optional but Recommended)

### Why Sign Your App?

- **Windows SmartScreen:** Won't warn users
- **Trust:** Shows verified publisher
- **Professional:** Required for distribution

### Get a Code Signing Certificate

**Option A: Purchase Certificate**
- **DigiCert:** ~$400/year
- **Sectigo:** ~$200/year
- **GlobalSign:** ~$300/year

**Option B: Free for Open Source**
- **SignPath:** Free for OSS projects
- Apply at: https://signpath.org

### Sign the Installer

**Using signtool (after obtaining certificate):**

```powershell
# Sign the MSI
& "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe" sign `
  /f "C:\path\to\certificate.pfx" `
  /p "certificate_password" `
  /t http://timestamp.digicert.com `
  /fd SHA256 `
  "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi"
```

**For automated signing, add to `tauri.conf.json`:**

```json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERTIFICATE_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

---

## Part 5: Distribution

### Upload to GitHub Releases

```powershell
# Using GitHub CLI (if authenticated)
gh release create v0.1.0 `
  "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi" `
  --title "AI Orchestrator v0.1.0" `
  --notes "Initial release with 4 working plugins"
```

### Manual Upload

1. Go to: https://github.com/BlockBlox-MD/ai-orchestrator/releases/new
2. Tag: `v0.1.0`
3. Title: `AI Orchestrator v0.1.0 - Initial Release`
4. Description: Copy from release notes below
5. Upload: Drag the .msi file
6. Click "Publish release"

---

## Part 6: Auto-Update Setup (Future)

### Configure Tauri Updater

**In `tauri.conf.json`:**

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/BlockBlox-MD/ai-orchestrator/releases/latest/download/latest.json"
      ],
      "dialog": true,
      "pubkey": "YOUR_PUBLIC_KEY"
    }
  }
}
```

### Generate Update Keys

```powershell
npm run tauri signer generate -- -w ~/.tauri/myapp.key
```

This creates:
- Private key: `~/.tauri/myapp.key` (keep secret!)
- Public key: Add to `tauri.conf.json`

---

## Troubleshooting

### Build Errors

**Error: "linker 'link.exe' not found"**
- Install Visual Studio Build Tools
- Restart terminal
- Run as Administrator

**Error: "failed to run custom build command"**
- Check Rust installation: `rustc --version`
- Update Rust: `rustup update`
- Clean and rebuild: `cargo clean && cargo build`

**Error: "WebView2 not available"**
- Download from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
- Install WebView2 Runtime

### Runtime Errors

**Plugins not loading:**
- Check plugin dependencies installed: `npm install` in each plugin folder
- Verify plugin.yaml is valid YAML
- Check terminal for error messages

**App won't start:**
- Check Windows Event Viewer for errors
- Run from command line to see error messages
- Verify all dependencies installed

---

## Performance Optimization

### Reduce Build Time

**Use incremental compilation:**
```toml
# In src-tauri/Cargo.toml
[profile.dev]
incremental = true
```

**Use faster linker (optional):**
```toml
[profile.dev]
incremental = true

[target.x86_64-pc-windows-msvc]
linker = "rust-lld"
```

### Reduce App Size

**Strip debug symbols:**
```toml
[profile.release]
strip = true
opt-level = "z"
lto = true
codegen-units = 1
```

**Current size:** ~30-40 MB (with optimizations)

---

## Next Steps After Building

1. ✅ **Test installer** on clean Windows machine
2. ✅ **Create GitHub release** with installer
3. ✅ **Update documentation** with download instructions
4. ✅ **Share with users** for feedback
5. ✅ **Iterate** based on feedback

---

## Release Checklist

- [ ] All tests passing
- [ ] Version number updated in `tauri.conf.json`
- [ ] Version number updated in `package.json`
- [ ] CHANGELOG.md updated
- [ ] Documentation updated
- [ ] Build succeeds on Windows
- [ ] Installer tested
- [ ] Code signed (if available)
- [ ] GitHub release created
- [ ] Release notes published

---

## Release Notes Template

```markdown
# AI Orchestrator v0.1.0 - Initial Release

## 🎉 First Release!

Multi-Model AI Orchestration Platform for business document generation.

### ✨ Features

**Core Platform:**
- Tauri + React application shell
- Plugin system with JSON-RPC communication
- Dark theme modern UI

**Plugins (4):**
- OAuth Manager - Multi-provider authentication
- Project Manager - Context & artifact management
- DOCX Generator - Professional document creation
- Claude Integration - Anthropic API wrapper

**Tests:** 7/7 passing (100%)

### 📦 Installation

**Windows:**
Download and run: `AI Orchestrator_0.1.0_x64_en-US.msi`

### 📚 Documentation

- [Getting Started](./GETTING_STARTED.md)
- [Development Guide](./DEVELOPMENT.md)
- [Plugin Development](./CONTRIBUTING.md)

### 🐛 Known Issues

- GUI build requires Windows (WSL2 not supported)
- Keytar library requires system keychain

### 🙏 Credits

Built with Tauri, React, and Rust.

---

**Full Changelog:** https://github.com/BlockBlox-MD/ai-orchestrator/commits/v0.1.0
```

---

## Summary Commands

```powershell
# Complete build workflow
cd C:\Users\MarcoAniballi\AIOrchestrator
npm install
npm run tauri:build

# Test installer
.\src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi

# Create GitHub release
gh release create v0.1.0 `
  "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi"
```

---

**Ready to build on Windows!** Follow these steps and you'll have a working installer. 🚀
