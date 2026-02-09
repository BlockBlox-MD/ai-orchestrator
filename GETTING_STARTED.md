# Getting Started with AI Orchestrator

## Welcome! 🎉

You now have the foundation of a **Multi-Model AI Orchestration Platform** - a modular, plugin-based system that will eventually coordinate multiple AI models to create professional business documents.

## What Has Been Built

### Core System (Phase 1 - Week 1: 70% Complete)

**Tauri + React Application:**
- ✅ Rust backend with plugin management
- ✅ React frontend with modern UI
- ✅ JSON-RPC communication protocol
- ✅ Plugin discovery and loading system

**Two Core Plugins:**
1. ✅ **OAuth Manager** - Securely store API keys for Claude, OpenAI, Gemini
2. ✅ **Project Manager** - Manage project context, conversation history, artifacts

## Quick Start

### 1. Install Prerequisites

**Required:**
- **Node.js 18+** - [Download](https://nodejs.org)
- **Rust 1.70+** - [Install via rustup](https://rustup.rs)

**Optional:**
- **Python 3.10+** - For Python plugins (later phases)

### 2. Install Dependencies

```bash
cd /mnt/c/Users/MarcoAniballi/AIOrchestrator

# Install main project dependencies
npm install

# Install OAuth Manager dependencies
cd plugins/core/oauth-manager
npm install
cd ../../..

# Note: Project Manager has no dependencies
```

### 3. Run Development Server

```bash
npm run tauri:dev
```

This will:
1. Start Vite dev server (http://localhost:5173)
2. Compile Rust backend
3. Launch the application window
4. Auto-reload on changes

### 4. First Run Experience

When the app launches:

1. **Plugin Manager will be displayed**
   - Shows discovered plugins by category
   - OAuth Manager and Project Manager should appear

2. **Load a plugin:**
   - Click "Load Plugin" on OAuth Manager
   - Plugin process starts in background
   - Status changes to "Loaded"

3. **Test the OAuth Manager:**
   - Open browser DevTools (F12)
   - Run in console:
   ```javascript
   const { invoke } = window.__TAURI__.core;

   // List providers
   const providers = await invoke('call_plugin_method', {
     pluginId: 'oauth-manager',
     method: 'listProviders',
     params: {}
   });
   console.log(providers);
   ```

## Project Structure

```
AIOrchestrator/
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── main.rs         # App entry point
│   │   ├── plugin_manager.rs  # Plugin system
│   │   └── commands.rs     # Tauri commands
│   └── Cargo.toml
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main component
│   │   └── components/
│   │       └── PluginManager.tsx
│   └── index.html
│
├── plugins/                # Plugin directory
│   └── core/
│       ├── oauth-manager/  # OAuth plugin
│       │   ├── plugin.yaml
│       │   ├── index.js
│       │   └── package.json
│       └── project-manager/  # Project plugin
│           ├── plugin.yaml
│           ├── index.js
│           └── package.json
│
├── package.json
├── README.md               # Project overview
├── DEVELOPMENT.md          # Development guide
└── GETTING_STARTED.md      # This file
```

## Understanding the Plugin System

### How It Works

1. **Plugin Discovery**
   - App scans `plugins/` directory on startup
   - Reads `plugin.yaml` manifests
   - Displays in UI grouped by category

2. **Plugin Loading**
   - User clicks "Load Plugin"
   - Backend spawns plugin process (e.g., `node index.js`)
   - Plugin starts JSON-RPC server on stdin/stdout
   - Backend stores process handle

3. **Plugin Communication**
   - Frontend calls `call_plugin_method(pluginId, method, params)`
   - Backend sends JSON-RPC request to plugin
   - Plugin processes and responds
   - Result returned to frontend

### Plugin Categories

- **core/** - Essential system plugins (OAuth, Project Manager)
- **document-generation/** - DOCX, PDF, PPTX generators (coming soon)
- **ai-integrations/** - AI provider integrations (coming soon)
- **custom/** - Your own plugins

## Next Steps

### Immediate (Complete Phase 1)

1. **Test the system thoroughly**
   - Run dev server
   - Load both plugins
   - Test all methods
   - Fix any bugs

2. **Create Claude Code wrapper plugin**
   - Wraps Claude Code CLI
   - Enables CLI features in GUI

3. **Add error handling**
   - Graceful plugin failures
   - User-friendly error messages
   - Logging system

### Phase 2 (Weeks 4-6): Document Generation

Once Phase 1 is solid:

1. **DOCX Generator Plugin**
   - Create professional Word documents
   - Template-based generation
   - Export functionality

2. **PDF Generator Plugin**
   - Convert documents to PDF
   - Professional styling
   - Multi-format support

3. **Template System**
   - Pre-built document templates
   - Business plan, pitch deck, etc.
   - Visual template editor

### Phase 3 (Weeks 7-9): Multi-Model Orchestration

The exciting part:

1. **AI Provider Plugins**
   - Claude integration
   - OpenAI integration
   - Google Gemini integration

2. **Expert System Builder**
   - Define multi-model workflows
   - Claude coordinates responses
   - Automatic synthesis

3. **Quality Assessment**
   - Multi-dimensional scoring
   - Iterative refinement
   - Quality gates

## Useful Commands

```bash
# Development
npm run tauri:dev          # Start dev server
npm run dev                # Frontend only
npm run build              # Build frontend

# Production
npm run tauri:build        # Build app for production

# Plugin Testing
cd plugins/core/oauth-manager
echo '{"jsonrpc":"2.0","method":"listProviders","params":{},"id":1}' | node index.js

cd ../project-manager
echo '{"jsonrpc":"2.0","method":"listProjects","params":{},"id":1}' | node index.js
```

## Debugging

### Frontend

- Open DevTools: F12 or Ctrl+Shift+I
- Console tab: View logs, errors
- React DevTools: Inspect components

### Backend

- Logs appear in terminal running `npm run tauri:dev`
- Add `println!("Debug: {:?}", variable);` in Rust
- Add `console.error("Log:", data);` in plugins

### Common Issues

**Plugin not discovered:**
- Check `plugin.yaml` is valid YAML
- Verify in `plugins/{category}/{plugin-id}/` directory
- Restart app

**Plugin fails to load:**
- Check dependencies installed (`npm install`)
- Verify entry point exists (`index.js`)
- Check terminal for error messages

**JSON-RPC errors:**
- Verify method exists in plugin
- Check parameter types
- Review plugin logs

## Creating Your First Plugin

1. **Create directory:**
   ```bash
   mkdir -p plugins/custom/my-plugin
   ```

2. **Create `plugin.yaml`:**
   ```yaml
   metadata:
     id: my-plugin
     name: "My Plugin"
     version: 1.0.0
     author: "Your Name"
     description: "What it does"
     category: custom

   capabilities:
     - do-something

   api:
     protocol: jsonrpc
     methods:
       - name: doSomething
         params:
           - name: input
             type: string
             required: true
         returns: object
   ```

3. **Create `index.js`:**
   ```javascript
   #!/usr/bin/env node
   import { createInterface } from 'readline';

   const rl = createInterface({
     input: process.stdin,
     output: process.stdout,
     terminal: false
   });

   const methods = {
     async doSomething(params) {
       return { result: `You said: ${params.input}` };
     }
   };

   rl.on('line', async (line) => {
     const request = JSON.parse(line);
     const result = await methods[request.method](request.params);
     console.log(JSON.stringify({
       jsonrpc: '2.0',
       result,
       id: request.id
     }));
   });
   ```

4. **Restart app** - Plugin auto-discovered!

## Resources

- **README.md** - Project overview and architecture
- **DEVELOPMENT.md** - Detailed development guide
- **IMPLEMENTATION_STATUS.md** - Current progress
- [Tauri Docs](https://tauri.app/v2/guides/) - Framework documentation
- [React Docs](https://react.dev) - UI framework
- [JSON-RPC Spec](https://www.jsonrpc.org/specification) - Protocol

## Getting Help

### Documentation

1. Start with README.md for overview
2. Check DEVELOPMENT.md for technical details
3. Review existing plugins for examples

### Troubleshooting

1. Check terminal output for errors
2. Verify dependencies installed
3. Test plugins standalone (see DEVELOPMENT.md)
4. Review plugin manifests for typos

## What Makes This Special

This isn't just another Electron app. It's:

1. **Lightweight** - Tauri makes ~30MB apps (vs ~150MB Electron)
2. **Modular** - Plugins can be added/removed without touching core
3. **Language Agnostic** - Write plugins in JS, Python, Rust, etc.
4. **Self-Expanding** - System will discover and propose improvements
5. **Multi-Model** - Coordinate Claude, GPT, Gemini, and more

## The Vision

By the end of Phase 6 (Week 18), you'll have a platform that:

- Authenticates with multiple AI providers
- Creates professional business documents automatically
- Uses multiple AI models in expert systems
- Iteratively refines outputs to meet quality thresholds
- Learns and improves from successful generations
- Discovers and integrates new capabilities autonomously

**Current Status:** Foundation is solid. The hard infrastructure work is done. Now we build the features!

---

**Ready to get started?**

```bash
npm run tauri:dev
```

Let's build something amazing! 🚀
