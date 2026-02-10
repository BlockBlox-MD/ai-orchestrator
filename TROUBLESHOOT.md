# Troubleshooting - Can't Run Build

## Common Issues and Solutions

### Issue 1: "Cannot run script - Execution Policy"

**Error message:**
```
build-to-desktop.ps1 cannot be loaded because running scripts is disabled on this system
```

**Solution:**
Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again in regular PowerShell:
```powershell
cd C:\Users\MarcoAniballi\AIOrchestrator
.\build-to-desktop.ps1
```

---

### Issue 2: "Script not found"

**Error message:**
```
The term 'build-to-desktop.ps1' is not recognized
```

**Possible causes:**
- Not in the right directory
- Script doesn't exist

**Solution:**
```powershell
# Check where you are
pwd

# Should show: C:\Users\MarcoAniballi\AIOrchestrator
# If not, navigate there:
cd C:\Users\MarcoAniballi\AIOrchestrator

# Check if script exists
dir build-to-desktop.ps1

# If it exists, run with full path:
.\build-to-desktop.ps1
```

---

### Issue 3: Prerequisites Missing

**Error message:**
```
Node.js not found
# or
Rust not found
# or
linker 'link.exe' not found
```

**Solution:**

**A. Install Node.js:**
1. Download: https://nodejs.org
2. Install LTS version
3. Restart PowerShell

**B. Install Rust:**
1. Download: https://rustup.rs
2. Run `rustup-init.exe`
3. Choose option 1 (default)
4. Restart PowerShell

**C. Install Visual Studio Build Tools:**
1. Download: https://visualstudio.microsoft.com/downloads/
2. Choose "Build Tools for Visual Studio 2022"
3. Select "Desktop development with C++"
4. Install (takes 20-30 minutes)
5. Restart computer

**Verify installations:**
```powershell
node --version    # Should show v20.x.x or similar
npm --version     # Should show 10.x.x or similar
rustc --version   # Should show rustc 1.x.x
cargo --version   # Should show cargo 1.x.x
```

---

### Issue 4: In WSL Instead of Windows

**How to tell:**
- Prompt shows `/mnt/c/` paths
- Running in WSL terminal

**Solution:**
- Don't use WSL!
- Open Windows PowerShell instead
- Press Windows Key → type "PowerShell" → click Windows PowerShell

---

### Issue 5: Permission Denied

**Error message:**
```
Access denied
Permission denied
```

**Solution:**
Run PowerShell as Administrator:
1. Press Windows Key
2. Type "PowerShell"
3. Right-click "Windows PowerShell"
4. Choose "Run as Administrator"
5. Navigate and run script

---

## Alternative: Step-by-Step Manual Build

If the script still doesn't work, do it manually:

### Step 1: Check Prerequisites
```powershell
node --version
npm --version
rustc --version
cargo --version
```

All should return version numbers. If not, install missing items above.

### Step 2: Navigate to Project
```powershell
cd C:\Users\MarcoAniballi\AIOrchestrator
```

### Step 3: Install Dependencies
```powershell
npm install
```

### Step 4: Install Plugin Dependencies
```powershell
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

### Step 5: Build
```powershell
npm run tauri:build
```

This will take 10-20 minutes.

### Step 6: Find Installer
```powershell
dir src-tauri\target\release\bundle\msi\
```

Look for: `AI Orchestrator_0.1.0_x64_en-US.msi`

### Step 7: Copy to Desktop
```powershell
Copy-Item "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi" "$env:USERPROFILE\Desktop\AI-Orchestrator-v0.1.0.msi"
```

---

## Still Having Issues?

### Share Error Details

Please provide:
1. **Exact error message** (copy and paste)
2. **What command you ran**
3. **Where you ran it** (PowerShell, CMD, WSL?)
4. **Output of these commands:**
   ```powershell
   pwd
   node --version
   rustc --version
   dir build-to-desktop.ps1
   ```

### Try the Batch File Instead

If PowerShell is problematic, try the batch file:

```cmd
# Open Command Prompt (not PowerShell)
cd C:\Users\MarcoAniballi\AIOrchestrator
build-windows.bat
```

---

## Quick Diagnosis

Run this diagnostic script:

```powershell
# Copy and paste this entire block

Write-Host "=== AI Orchestrator Build Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Check current directory
Write-Host "Current Directory:" -ForegroundColor Yellow
Get-Location
Write-Host ""

# Check if files exist
Write-Host "Checking files:" -ForegroundColor Yellow
if (Test-Path "package.json") { Write-Host "  ✓ package.json" -ForegroundColor Green } else { Write-Host "  ✗ package.json" -ForegroundColor Red }
if (Test-Path "build-to-desktop.ps1") { Write-Host "  ✓ build-to-desktop.ps1" -ForegroundColor Green } else { Write-Host "  ✗ build-to-desktop.ps1" -ForegroundColor Red }
if (Test-Path "src-tauri\Cargo.toml") { Write-Host "  ✓ src-tauri\Cargo.toml" -ForegroundColor Green } else { Write-Host "  ✗ src-tauri\Cargo.toml" -ForegroundColor Red }
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites:" -ForegroundColor Yellow
try {
    $nodeVer = node --version
    Write-Host "  ✓ Node.js: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
}

try {
    $rustVer = rustc --version
    Write-Host "  ✓ Rust: $rustVer" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Rust not found" -ForegroundColor Red
}

try {
    $cargoVer = cargo --version
    Write-Host "  ✓ Cargo: $cargoVer" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Cargo not found" -ForegroundColor Red
}
Write-Host ""

# Check execution policy
Write-Host "PowerShell Execution Policy:" -ForegroundColor Yellow
Get-ExecutionPolicy -Scope CurrentUser
Write-Host ""

Write-Host "=== End Diagnostics ===" -ForegroundColor Cyan
```

Copy the entire block above, paste into PowerShell, and press Enter.
This will show what's wrong.

---

## Contact for Help

If you're still stuck:
1. Run the diagnostic above
2. Take a screenshot of the error
3. Share the exact error message

Then I can help you debug specifically!
