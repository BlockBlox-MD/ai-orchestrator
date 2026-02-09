# Development Guide

## Quick Start

### First Time Setup

1. **Install system dependencies:**
   - Node.js 18+ ([nodejs.org](https://nodejs.org))
   - Rust 1.70+ ([rustup.rs](https://rustup.rs))
   - Python 3.10+ (optional, for Python plugins)

2. **Clone and install:**
   ```bash
   cd /mnt/c/Users/MarcoAniballi/AIOrchestrator
   npm install
   cd plugins/core/oauth-manager
   npm install
   cd ../../..
   ```

3. **Run development server:**
   ```bash
   npm run tauri:dev
   ```

This will:
- Start Vite dev server on http://localhost:5173
- Compile Rust backend
- Launch Tauri application window
- Enable hot reload for frontend changes

### Development Workflow

**Frontend Development:**
- Edit files in `frontend/src/`
- Changes auto-reload in dev mode
- Use React DevTools for debugging

**Backend Development:**
- Edit files in `src-tauri/src/`
- Restart Tauri dev server to see changes
- Use `println!` or `dbg!` for logging

**Plugin Development:**
- Create plugin in `plugins/` directory
- Plugin auto-discovered on app restart
- Test via Plugin Manager UI or directly via JSON-RPC

## Testing Plugins

### Manual Testing via Node

Test a plugin directly from command line:

```bash
cd plugins/core/oauth-manager
echo '{"jsonrpc":"2.0","method":"listProviders","params":{},"id":1}' | node index.js
```

Expected output:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "claude": { "name": "Anthropic Claude", "authenticated": false },
    "openai": { "name": "OpenAI", "authenticated": false },
    "google": { "name": "Google Gemini", "authenticated": false }
  },
  "id": 1
}
```

### Testing OAuth Flow

1. **Launch app in dev mode:**
   ```bash
   npm run tauri:dev
   ```

2. **Open Plugin Manager** (shown by default)

3. **Load OAuth Manager plugin** (click "Load Plugin")

4. **Test authentication:**
   - Open browser DevTools Console (F12)
   - Call plugin method:
   ```javascript
   const { invoke } = window.__TAURI__.core;

   // List providers
   const providers = await invoke('call_plugin_method', {
     pluginId: 'oauth-manager',
     method: 'listProviders',
     params: {}
   });
   console.log(providers);

   // Set a test token (replace with real token)
   await invoke('call_plugin_method', {
     pluginId: 'oauth-manager',
     method: 'setToken',
     params: {
       provider: 'claude',
       token: 'sk-ant-api03-YOUR-TOKEN-HERE'
     }
   });

   // Retrieve token
   const token = await invoke('call_plugin_method', {
     pluginId: 'oauth-manager',
     method: 'getToken',
     params: { provider: 'claude' }
   });
   console.log(token);
   ```

## Project Structure Deep Dive

### Rust Backend (`src-tauri/`)

**main.rs:**
- Application entry point
- Initializes Tauri
- Sets up plugin directory
- Registers commands

**plugin_manager.rs:**
- Plugin discovery (scans plugin directories)
- Plugin loading (spawns subprocess)
- JSON-RPC communication
- Plugin lifecycle management

**commands.rs:**
- Tauri commands exposed to frontend
- `discover_plugins` - List all available plugins
- `load_plugin` - Start a plugin subprocess
- `call_plugin_method` - Send JSON-RPC request
- `get_plugin_status` - Check if plugin is running

### React Frontend (`frontend/`)

**App.tsx:**
- Main application component
- Manages global state
- Renders Plugin Manager

**components/PluginManager.tsx:**
- Displays discovered plugins
- Groups by category
- Load/unload functionality
- Status indicators

### Plugin System

**Plugin Discovery:**
1. Scan `plugins/{category}/` directories
2. Read `plugin.yaml` manifests
3. Parse and validate
4. Display in UI

**Plugin Loading:**
1. User clicks "Load Plugin"
2. Frontend calls `load_plugin(pluginId)`
3. Backend spawns subprocess (`node index.js`)
4. Plugin starts JSON-RPC server on stdin/stdout
5. Backend stores process handle

**Plugin Communication:**
1. Frontend calls `call_plugin_method(pluginId, method, params)`
2. Backend creates JSON-RPC request
3. Writes to plugin stdin
4. Reads response from plugin stdout
5. Returns result to frontend

## Debugging

### Frontend Debugging

Use browser DevTools:
- **Console:** View logs and errors
- **React DevTools:** Inspect component tree
- **Network:** Monitor Tauri IPC calls

### Backend Debugging

**Rust logs:**
```rust
println!("Debug: {}", variable);
dbg!(&variable);
```

View in terminal running `npm run tauri:dev`

**Plugin logs:**
```javascript
console.error("Plugin log:", data); // Goes to stderr, visible in terminal
```

### Common Issues

**Plugin not discovered:**
- Check `plugin.yaml` is valid YAML
- Verify file is in correct directory: `plugins/{category}/{plugin-id}/`
- Restart app to trigger discovery

**Plugin fails to load:**
- Check `index.js` has correct shebang: `#!/usr/bin/env node`
- Make sure dependencies installed: `cd plugins/.../; npm install`
- Check plugin logs in terminal

**JSON-RPC errors:**
- Verify request format matches spec
- Check method exists in plugin
- Validate parameter types

## Building for Production

### Development Build

```bash
npm run tauri:build
```

Creates debug build in `src-tauri/target/debug/bundle/`

### Release Build

```bash
npm run tauri:build -- --release
```

Creates optimized build in `src-tauri/target/release/bundle/`

**Output formats:**
- **Windows:** `.msi` installer, `.exe` executable
- **macOS:** `.app` bundle, `.dmg` installer
- **Linux:** `.AppImage`, `.deb`, `.rpm`

### Code Signing (Production)

**Windows:**
1. Obtain Authenticode certificate
2. Add to `tauri.conf.json`:
   ```json
   "bundle": {
     "windows": {
       "certificateThumbprint": "YOUR_THUMBPRINT"
     }
   }
   ```

**macOS:**
1. Enroll in Apple Developer Program
2. Create signing certificate
3. Add to `tauri.conf.json`:
   ```json
   "bundle": {
     "macOS": {
       "signingIdentity": "Developer ID Application: YOUR NAME"
     }
   }
   ```

## Performance Optimization

### Frontend

- Use `React.memo()` for expensive components
- Implement virtualization for long lists
- Lazy load plugin UI components
- Debounce user input

### Backend

- Cache plugin manifests (avoid re-parsing)
- Pool plugin processes (reuse instead of restart)
- Use async Rust for concurrent operations
- Implement request batching

### Plugin Communication

- Batch multiple requests
- Use streaming for large responses
- Implement timeout handling
- Add request cancellation

## Next Steps

### Immediate Priorities

1. **Create Project Manager plugin** - Context management
2. **Create Claude Code wrapper** - CLI integration
3. **Add error handling** - Graceful failures
4. **Implement logging** - Structured logs

### Phase 2 Preparation

1. **Document generation plugins** - DOCX, PDF
2. **Template system** - Reusable workflows
3. **Quality assessment** - Multi-dimensional scoring
4. **Iteration engine** - Automatic refinement

## Resources

- [Tauri Documentation](https://tauri.app/v2/guides/)
- [React Documentation](https://react.dev)
- [JSON-RPC 2.0 Spec](https://www.jsonrpc.org/specification)
- [Plugin Development Guide](./PLUGIN_DEVELOPMENT.md) (Coming soon)

## Getting Help

- Check existing plugins for examples
- Review Tauri API documentation
- Search GitHub issues
- Contact: marco@example.com (placeholder)
