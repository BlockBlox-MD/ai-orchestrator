# Testing Checklist - Phase 1 Foundation

## Pre-Testing Setup

### Environment Verification

- [ ] Node.js version 18+ installed
  ```bash
  node --version  # Should be v18.x.x or higher
  ```

- [ ] Rust installed and up to date
  ```bash
  rustc --version  # Should be 1.70 or higher
  cargo --version
  ```

- [ ] Dependencies installed
  ```bash
  npm install  # Root project
  cd plugins/core/oauth-manager && npm install
  cd ../..
  ```

## Core System Tests

### 1. Rust Backend Compilation

- [ ] **Build succeeds without errors**
  ```bash
  cd src-tauri
  cargo build
  ```
  Expected: Clean build, no errors

- [ ] **Check for warnings**
  Review cargo output for unused variables or deprecated code

### 2. Frontend Build

- [ ] **TypeScript compilation succeeds**
  ```bash
  npm run build
  ```
  Expected: Builds to `frontend/dist/` without errors

- [ ] **No TypeScript errors**
  Check for type mismatches or missing imports

### 3. Development Server Launch

- [ ] **Dev server starts successfully**
  ```bash
  npm run tauri:dev
  ```
  Expected output:
  - Vite dev server starts on http://localhost:5173
  - Rust compilation completes
  - Tauri window opens
  - No crash or immediate errors

- [ ] **Window renders correctly**
  - Window opens at 1200x800
  - Dark theme visible
  - Header shows "AI Orchestrator"
  - Plugin Manager interface displays

- [ ] **Console is clean**
  - Open DevTools (F12)
  - Check Console tab for errors
  - Should see no red errors on load

## Plugin System Tests

### 4. Plugin Discovery

- [ ] **Plugins are discovered**
  - OAuth Manager appears in "CORE" category
  - Project Manager appears in "CORE" category
  - Both show correct metadata (name, version, description)

- [ ] **Plugin details are accurate**
  - Author shown correctly
  - Capabilities count displayed
  - Version numbers correct

- [ ] **UI renders plugin cards**
  - Cards have proper styling
  - Hover effects work
  - "Load Plugin" buttons visible

### 5. OAuth Manager Plugin

#### Loading

- [ ] **Plugin loads successfully**
  - Click "Load Plugin" on OAuth Manager
  - Button changes to "Loading..."
  - Then changes to "Loaded"
  - No errors in console

#### Testing via DevTools Console

Open DevTools (F12) and run these tests:

- [ ] **Test listProviders method**
  ```javascript
  const { invoke } = window.__TAURI__.core;

  const providers = await invoke('call_plugin_method', {
    pluginId: 'oauth-manager',
    method: 'listProviders',
    params: {}
  });
  console.log(providers);
  ```
  Expected output:
  ```json
  {
    "claude": { "name": "Anthropic Claude", "authenticated": false },
    "openai": { "name": "OpenAI", "authenticated": false },
    "google": { "name": "Google Gemini", "authenticated": false }
  }
  ```

- [ ] **Test setToken method** (use fake token for testing)
  ```javascript
  await invoke('call_plugin_method', {
    pluginId: 'oauth-manager',
    method: 'setToken',
    params: {
      provider: 'claude',
      token: 'sk-ant-api03-test123-FAKE-TOKEN'
    }
  });
  ```
  Expected: No errors (token validation may fail, that's expected)

- [ ] **Test getToken method**
  ```javascript
  const token = await invoke('call_plugin_method', {
    pluginId: 'oauth-manager',
    method: 'getToken',
    params: { provider: 'claude' }
  });
  console.log(token);
  ```
  Expected: Returns stored token or null

- [ ] **Test revokeToken method**
  ```javascript
  const result = await invoke('call_plugin_method', {
    pluginId: 'oauth-manager',
    method: 'revokeToken',
    params: { provider: 'claude' }
  });
  console.log(result);
  ```
  Expected: `{ provider: 'claude', success: true }`

#### Standalone Testing

- [ ] **Test plugin directly from CLI**
  ```bash
  cd plugins/core/oauth-manager
  echo '{"jsonrpc":"2.0","method":"listProviders","params":{},"id":1}' | node index.js
  ```
  Expected: JSON-RPC response with provider list

### 6. Project Manager Plugin

#### Loading

- [ ] **Plugin loads successfully**
  - Click "Load Plugin" on Project Manager
  - Status changes to "Loaded"
  - No errors

#### Testing via DevTools Console

- [ ] **Test createProject method**
  ```javascript
  const { invoke } = window.__TAURI__.core;

  const project = await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'createProject',
    params: {
      name: 'Test Project',
      description: 'Testing project creation'
    }
  });
  console.log(project);
  ```
  Expected: Returns project object with ID

- [ ] **Test listProjects method**
  ```javascript
  const projects = await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'listProjects',
    params: {}
  });
  console.log(projects);
  ```
  Expected: Array with created project

- [ ] **Test loadProject method**
  ```javascript
  // Use project ID from previous test
  const loaded = await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'loadProject',
    params: { projectId: 'proj_xxx' }  // Replace with actual ID
  });
  console.log(loaded);
  ```
  Expected: Full project details

- [ ] **Test saveContext method**
  ```javascript
  await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'saveContext',
    params: {
      projectId: 'proj_xxx',
      context: {
        messages: [
          { role: 'user', content: 'Test message' }
        ],
        metadata: { test: true }
      }
    }
  });
  ```
  Expected: Returns true

- [ ] **Test addArtifact method**
  ```javascript
  await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'addArtifact',
    params: {
      projectId: 'proj_xxx',
      artifact: {
        type: 'document',
        name: 'Test Document',
        content: 'Test content'
      }
    }
  });
  ```
  Expected: Returns true

- [ ] **Test getArtifacts method**
  ```javascript
  const artifacts = await invoke('call_plugin_method', {
    pluginId: 'project-manager',
    method: 'getArtifacts',
    params: { projectId: 'proj_xxx' }
  });
  console.log(artifacts);
  ```
  Expected: Array with added artifact

- [ ] **Verify file system structure**
  ```bash
  ls -la ~/.ai-orchestrator/projects/
  ```
  Expected: Project directories created
  Check: `~/.ai-orchestrator/projects/proj_xxx/`
  - `project.json` exists
  - `context.json` exists
  - `artifacts/` directory exists

#### Standalone Testing

- [ ] **Test plugin directly from CLI**
  ```bash
  cd plugins/core/project-manager
  echo '{"jsonrpc":"2.0","method":"listProjects","params":{},"id":1}' | node index.js
  ```
  Expected: JSON-RPC response with projects

## Error Handling Tests

### 7. Graceful Failures

- [ ] **Unknown plugin ID**
  ```javascript
  try {
    await invoke('call_plugin_method', {
      pluginId: 'nonexistent',
      method: 'test',
      params: {}
    });
  } catch (error) {
    console.log('Expected error:', error);
  }
  ```
  Expected: Error message about plugin not loaded

- [ ] **Unknown method**
  ```javascript
  try {
    await invoke('call_plugin_method', {
      pluginId: 'oauth-manager',
      method: 'nonexistentMethod',
      params: {}
    });
  } catch (error) {
    console.log('Expected error:', error);
  }
  ```
  Expected: Error about unknown method

- [ ] **Invalid parameters**
  ```javascript
  try {
    await invoke('call_plugin_method', {
      pluginId: 'project-manager',
      method: 'createProject',
      params: {}  // Missing required 'name'
    });
  } catch (error) {
    console.log('Expected error:', error);
  }
  ```
  Expected: Error about missing parameters

- [ ] **Plugin crash recovery**
  - Kill plugin process manually
  - Try to call method
  - Verify graceful error, not app crash

## UI/UX Tests

### 8. Visual and Interaction Tests

- [ ] **Responsive layout**
  - Resize window to 800x600 (minimum)
  - Verify UI adapts correctly
  - No overflow or clipping

- [ ] **Dark theme consistency**
  - All text readable
  - Consistent colors throughout
  - Proper contrast

- [ ] **Button interactions**
  - Hover states work
  - Click feedback visible
  - Disabled state shows correctly

- [ ] **Loading states**
  - "Loading..." shows when plugin loading
  - Spinner or indicator visible
  - UI doesn't freeze

### 9. Plugin Categories

- [ ] **Categories display correctly**
  - CORE category shown
  - Headers styled properly
  - Plugins grouped correctly

- [ ] **Empty categories**
  - Create empty category directory
  - Verify no crash
  - Should show no plugins for that category

## Performance Tests

### 10. Performance Metrics

- [ ] **Startup time**
  - App opens in < 5 seconds
  - Window renders immediately
  - No long freeze

- [ ] **Plugin loading time**
  - Plugin loads in < 2 seconds
  - UI responsive during load

- [ ] **Memory usage**
  - Check Task Manager / Activity Monitor
  - App uses < 500MB RAM initially
  - No memory leaks after multiple operations

## Cross-Platform Tests (if applicable)

### 11. Windows-Specific

- [ ] App compiles on Windows
- [ ] Window decorations correct
- [ ] Keychain integration works (Windows Credential Manager)
- [ ] File paths handle Windows format (C:\Users\...)

### 12. macOS-Specific (if testing on Mac)

- [ ] App compiles on macOS
- [ ] Native window controls work
- [ ] Keychain integration works (macOS Keychain)
- [ ] File paths handle Unix format

### 13. Linux-Specific (if testing on Linux/WSL)

- [ ] App compiles on Linux
- [ ] Window manager integration works
- [ ] Keychain integration works (Secret Service)
- [ ] File paths correct

## Documentation Tests

### 14. Documentation Accuracy

- [ ] **README.md**
  - Installation steps work
  - Commands execute correctly
  - Examples accurate

- [ ] **DEVELOPMENT.md**
  - Development workflow described correctly
  - Debug instructions work
  - Testing examples accurate

- [ ] **GETTING_STARTED.md**
  - Quick start works for new user
  - Commands correct
  - Examples runnable

## Final Checklist

### Ready for Phase 2 if:

- [ ] All core system tests pass
- [ ] Both plugins load and work correctly
- [ ] No critical bugs found
- [ ] Documentation is accurate
- [ ] Development environment stable
- [ ] Can create, load, and test plugins reliably

### Known Issues to Document

List any issues found during testing:

1. _Issue description_
   - Severity: Critical / High / Medium / Low
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Workaround (if any):

2. _..._

## Post-Testing Actions

- [ ] **Update IMPLEMENTATION_STATUS.md** with test results
- [ ] **Fix critical bugs** before proceeding
- [ ] **Document known issues** for future reference
- [ ] **Create GitHub issues** for non-critical bugs
- [ ] **Plan Phase 2** based on learnings

---

**Testing Date:** ___________
**Tester:** ___________
**Platform:** Windows / macOS / Linux
**Result:** ☐ PASS  ☐ FAIL  ☐ PARTIAL

**Notes:**
