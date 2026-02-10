# Step-by-Step Build Guide - AI Orchestrator

Follow these exact steps. Don't skip any!

---

## Part 1: Check Prerequisites (10 minutes)

### Step 1: Check if Node.js is Installed

1. Press `Windows Key` on your keyboard
2. Type: `cmd`
3. Press `Enter`
4. In the black window that opens, type:
   ```
   node --version
   ```
5. Press `Enter`

**What you should see:**
- Something like `v20.11.0` or `v18.x.x`

**If you see an error** ("not recognized"):
- You need to install Node.js
- Go to: https://nodejs.org
- Click the big green button "Download Node.js (LTS)"
- Run the downloaded file
- Click Next, Next, Next, Install
- **Restart your computer**
- Then repeat Step 1

---

### Step 2: Check if Rust is Installed

1. In the same black window (CMD), type:
   ```
   rustc --version
   ```
2. Press `Enter`

**What you should see:**
- Something like `rustc 1.75.0` or similar

**If you see an error** ("not recognized"):
- You need to install Rust
- Go to: https://rustup.rs
- Click "Download rustup-init.exe (64-bit)"
- Run the downloaded file
- When it asks, press `1` then `Enter` (for default installation)
- Wait for it to finish (2-3 minutes)
- **Close and reopen CMD**
- Then repeat Step 2

---

### Step 3: Check if Visual Studio Build Tools are Installed

This is the trickiest one.

1. Press `Windows Key`
2. Type: `Visual Studio`
3. Look for "Visual Studio Installer"

**If you see "Visual Studio Installer":**
- Open it
- Check if "Build Tools" or "Community" is installed
- If yes, you're good! Skip to Part 2
- If no, continue below

**If you DON'T see "Visual Studio Installer":**
You need to install it:

1. Go to: https://visualstudio.microsoft.com/downloads/
2. Scroll down to "All Downloads"
3. Find "Tools for Visual Studio 2022"
4. Click "Build Tools for Visual Studio 2022"
5. Download and run the installer
6. When it opens:
   - Check the box: **"Desktop development with C++"**
   - Click "Install" button (bottom right)
   - Wait 20-30 minutes (it's a big download)
7. **Restart your computer** when done

---

## Part 2: Open PowerShell (2 minutes)

### Step 4: Open PowerShell

1. Press `Windows Key`
2. Type: `PowerShell` (just those letters)
3. You'll see "Windows PowerShell" in the results
4. **Right-click** on it
5. Click "Run as administrator"
6. Click "Yes" when Windows asks for permission

**You should now see a blue window with white text.**

The prompt should look something like:
```
PS C:\Windows\system32>
```

---

### Step 5: Allow Scripts to Run

In the blue PowerShell window, type this EXACTLY (copy and paste):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Press `Enter`

**It will ask:** "Do you want to change the execution policy?"

Type: `Y` (just the letter Y)

Press `Enter`

**You should see the prompt again with no errors.**

---

## Part 3: Navigate to Your Project (1 minute)

### Step 6: Go to the AIOrchestrator Folder

In the same PowerShell window, type:

```powershell
cd C:\Users\MarcoAniballi\AIOrchestrator
```

Press `Enter`

**Your prompt should now look like:**
```
PS C:\Users\MarcoAniballi\AIOrchestrator>
```

---

### Step 7: Verify You're in the Right Place

Type:

```powershell
dir package.json
```

Press `Enter`

**You should see:**
- A file called `package.json` with a size
- The date it was created

**If you see "cannot find":**
- You're in the wrong folder
- Type `dir` and press Enter to see what's in the current folder
- Make sure you typed the path correctly in Step 6

---

## Part 4: Run the Build (15-20 minutes)

### Step 8: Check Which Scripts You Have

Type:

```powershell
dir *.ps1
```

Press `Enter`

**You should see several files:**
- `build-to-desktop.ps1`
- `build-windows.ps1`
- `simple-build.ps1`

**If you don't see these files:**
- The files might not be synced from WSL
- Pull from GitHub: `git pull origin main`

---

### Step 9: Run the Simple Build Script

We'll use the simplest script first. Type:

```powershell
.\simple-build.ps1
```

Press `Enter`

**What will happen:**
1. It will say "Installing dependencies..."
2. You'll see lots of text scrolling (this is normal)
3. It will say "Building application..."
4. You'll see even MORE text scrolling (this is normal)
5. This takes 10-20 minutes on first build
6. **Do NOT close the window!**

**Signs it's working:**
- You see: "Compiling..."
- You see: "Finished release [optimized]"
- Lots of package names scrolling by

**Signs something is wrong:**
- Red error messages
- "command not found"
- Window closes immediately

---

### Step 10: Wait for Build to Complete

**Be patient!** This takes time. You'll see:

1. First minute: Installing packages
2. Next 15-20 minutes: Compiling Rust (lots of "Compiling xyz" messages)
3. Final: "Creating installer..."

**When it's done, you'll see:**
```
Done! Check your Desktop for AI-Orchestrator.msi
Press any key to continue...
```

Press any key to close the window.

---

## Part 5: Find Your Installer (1 minute)

### Step 11: Go to Your Desktop

1. Minimize PowerShell (don't close it yet)
2. Go to your Desktop
3. Look for a file called: **`AI-Orchestrator.msi`**

**File size should be:** ~30-40 MB

**If you see it:** Congratulations! You successfully built it! 🎉

**If you DON'T see it:**
- Go back to PowerShell
- Look for error messages (red text)
- Tell me what the error says

---

## Part 6: Test the Installer (5 minutes)

### Step 12: Install the Application

1. Double-click `AI-Orchestrator.msi` on your Desktop
2. You might see a Windows security warning
   - Click "More info"
   - Click "Run anyway"
3. The installer wizard opens
4. Click "Next"
5. Click "Next" again (or choose install location)
6. Click "Install"
7. Click "Finish"

---

### Step 13: Launch the Application

1. Press `Windows Key`
2. Type: `AI Orchestrator`
3. Click on "AI Orchestrator" to launch

**What you should see:**
- A window opens
- Dark theme interface
- "AI Orchestrator" at the top
- "Plugin Manager" section
- 4 plugins listed:
  - OAuth Manager
  - Project Manager
  - DOCX Generator
  - Claude Integration

**If the window doesn't open:**
- Check Task Manager (Ctrl+Shift+Esc)
- Look for "ai-orchestrator.exe"
- If it's running but no window, try restarting

---

## Part 7: Test a Plugin (2 minutes)

### Step 14: Load a Plugin

1. In the AI Orchestrator window
2. Find "OAuth Manager" (should be the first one)
3. Click the "Load Plugin" button
4. The button should change to "Loaded"

**What should happen:**
- Button changes from blue to green
- Text changes to "Loaded"

**If it doesn't work:**
- Check the PowerShell window for error messages

---

### Step 15: Test Plugin Functionality

1. Press `F12` on your keyboard (opens Developer Tools)
2. Click the "Console" tab at the top
3. Copy this entire code block:

```javascript
const { invoke } = window.__TAURI__.core;

const providers = await invoke('call_plugin_method', {
  pluginId: 'oauth-manager',
  method: 'listProviders',
  params: {}
});

console.log('Providers:', providers);
```

4. Paste it into the console (at the `>` prompt)
5. Press `Enter`

**What you should see:**
```
Providers: {
  claude: { name: "Anthropic Claude", authenticated: false },
  openai: { name: "OpenAI", authenticated: false },
  google: { name: "Google Gemini", authenticated: false }
}
```

**If you see that:** Everything is working perfectly! 🎉

---

## Troubleshooting Each Step

### If Step 1 (Node.js) Fails:
- Make sure you downloaded from nodejs.org
- Restart computer after installing
- Try opening a NEW CMD window

### If Step 2 (Rust) Fails:
- Make sure you ran rustup-init.exe
- Close and reopen CMD
- Type: `rustup --version` to verify

### If Step 3 (Build Tools) Fails:
- This is the most common issue
- Make sure you selected "Desktop development with C++"
- Restart computer after installing
- Try reinstalling if needed

### If Step 9 (Build) Fails:

**Error: "cannot be loaded"**
- Go back to Step 5 (execution policy)
- Make sure you ran PowerShell as Administrator

**Error: "npm not found"**
- Node.js not properly installed
- Go back to Step 1

**Error: "rustc not found"**
- Rust not properly installed
- Go back to Step 2

**Error: "linker link.exe not found"**
- Visual Studio Build Tools not installed
- Go back to Step 3

**Build stops with red errors:**
- Copy the error message
- Tell me what it says
- Don't close PowerShell!

### If Installer Doesn't Appear on Desktop:

Check manually:
```powershell
dir "src-tauri\target\release\bundle\msi\"
```

If you see the .msi file there:
```powershell
Copy-Item "src-tauri\target\release\bundle\msi\AI Orchestrator_0.1.0_x64_en-US.msi" "$env:USERPROFILE\Desktop\AI-Orchestrator.msi"
```

---

## What to Do If Stuck

**At any step, if you're stuck:**

1. **Don't close PowerShell** - I need to see the errors
2. Take a screenshot
3. Tell me:
   - Which step number you're on
   - What you typed
   - What error you see (exact message)

Then I can help you fix it specifically!

---

## Quick Reference

**Commands you'll use:**

```powershell
# Check Node.js
node --version

# Check Rust
rustc --version

# Allow scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Navigate to project
cd C:\Users\MarcoAniballi\AIOrchestrator

# Build
.\simple-build.ps1
```

---

## Expected Timeline

- Step 1-3 (Prerequisites): 10 min (or 45 min if installing everything)
- Step 4-7 (Setup PowerShell): 5 min
- Step 8-10 (Build): 15-20 min
- Step 11-15 (Test): 10 min

**Total: 40-50 minutes** (including installations)

**Subsequent builds: 2-5 minutes** (much faster!)

---

## You're Ready!

Start with **Step 1** and go in order. Don't skip any steps!

Let me know which step you're on and I'll help if you get stuck! 🚀
