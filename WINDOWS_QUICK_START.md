# Windows Quick Start - AI Orchestrator

## ⚡ Super Fast Build Instructions

### Prerequisites (One-Time Setup)

1. **Install Visual Studio Build Tools**
   - Download: https://visualstudio.microsoft.com/downloads/
   - Choose: "Build Tools for Visual Studio 2022"
   - Select: "Desktop development with C++"
   - Install (takes ~20 minutes)

2. **Install Rust**
   - Download: https://rustup.rs
   - Run `rustup-init.exe`
   - Choose default installation
   - **Restart your terminal**

3. **Install Node.js** (if not installed)
   - Download LTS: https://nodejs.org
   - Run installer with defaults
   - **Restart your terminal**

### Build the Application

**Option 1: PowerShell Script (Recommended)**

1. Open PowerShell
2. Navigate to project:
   ```powershell
   cd C:\Users\MarcoAniballi\AIOrchestrator
   ```
3. Run build script:
   ```powershell
   .\build-windows.ps1
   ```
4. Wait 10-20 minutes for first build
5. Done! Installer created at:
   ```
   src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi
   ```

**Option 2: Batch File (CMD)**

1. Open Command Prompt
2. Navigate to project:
   ```cmd
   cd C:\Users\MarcoAniballi\AIOrchestrator
   ```
3. Run:
   ```cmd
   build-windows.bat
   ```

**Option 3: Manual Commands**

```powershell
# Install dependencies
npm install
cd plugins\core\oauth-manager && npm install && cd ..\..\..
cd plugins\core\project-manager && npm install && cd ..\..\..
cd plugins\document-generation\docx-generator && npm install && cd ..\..\..
cd plugins\ai-integrations\claude-integration && npm install && cd ..\..\..

# Build release
npm run tauri:build
```

---

## Test the Application

### Run Development Mode

```powershell
npm run tauri:dev
```

Application window will open. Test:
- Load plugins
- Generate a document
- Verify functionality

### Test the Installer

```powershell
.\src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi
```

Follow installation wizard, then launch from Start Menu.

---

## Troubleshooting

### "PowerShell script not running"

PowerShell execution policy may be restricted:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again.

### "linker 'link.exe' not found"

Visual Studio Build Tools not installed or not in PATH.

**Fix:**
1. Install Visual Studio Build Tools
2. Restart terminal
3. Run as Administrator

### "WebView2 not found"

Download WebView2 Runtime:
https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Build is very slow

First build takes 10-20 minutes (compiling all dependencies).
Subsequent builds are much faster (1-2 minutes).

### Out of disk space

Rust builds can use 2-3 GB.
Clean old builds:

```powershell
Remove-Item -Recurse -Force src-tauri\target
```

---

## What Gets Created

**Installer (.msi):**
- Location: `src-tauri\target\release\bundle\msi\`
- Size: ~30-40 MB
- Installs to: `C:\Program Files\AI Orchestrator\`

**Standalone Executable:**
- Location: `src-tauri\target\release\ai-orchestrator.exe`
- Size: ~30-40 MB
- Can run without installation

---

## Distribution

### Upload to GitHub

```powershell
gh release create v0.1.0 `
  "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi" `
  --title "AI Orchestrator v0.1.0" `
  --notes "Initial release"
```

### Share with Others

Users can download and install the .msi file directly.

No dependencies needed - everything is bundled!

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run tauri:dev` | Run development mode |
| `npm run tauri:build` | Build release installer |
| `.\build-windows.ps1` | Automated build script |
| `cargo clean` | Clean build artifacts |

---

## Next Steps

After successful build:

1. ✅ Test the installer
2. ✅ Test all plugins work
3. ✅ Generate test documents
4. ✅ Create GitHub release
5. ✅ Share with users

---

**Build time:** 10-20 min (first time), 1-2 min (subsequent)
**Installer size:** ~30-40 MB
**No runtime dependencies:** Everything bundled!

🚀 **Ready to build!**
