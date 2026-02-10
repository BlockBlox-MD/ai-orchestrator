# Contributing to AI Orchestrator

First off, thank you for considering contributing to AI Orchestrator! 🎉

## Development Status

**Current Phase:** Phase 1 (Foundation) - 85% complete

We're actively developing the core platform and welcome contributions!

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Description:** Clear description of the bug
- **Steps to Reproduce:** Step-by-step instructions
- **Expected Behavior:** What should happen
- **Actual Behavior:** What actually happens
- **Environment:** OS, Node.js version, Rust version
- **Logs:** Relevant error messages or logs

### Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear use case
- Explain how it fits into the platform's goals
- Consider implementation complexity

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly** (see Testing section below)
5. **Commit with clear messages:** `git commit -m "Add amazing feature"`
6. **Push to your fork:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **Rust** 1.70+ ([rustup.rs](https://rustup.rs))
- **Git** ([git-scm.com](https://git-scm.com))

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/ai-orchestrator.git
cd ai-orchestrator

# Install dependencies
npm install

# Install plugin dependencies
cd plugins/core/oauth-manager && npm install
cd ../project-manager && npm install
cd ../../document-generation/docx-generator && npm install
cd ../../ai-integrations/claude-integration && npm install
cd ../../..

# Run development server (Windows only - not WSL)
npm run tauri:dev
```

## Code Style

### Rust

- Follow standard Rust conventions
- Run `cargo fmt` before committing
- Run `cargo clippy` to check for issues
- Add documentation comments for public APIs

### TypeScript/React

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Add JSDoc comments for complex functions

### Plugin Development

- Follow the plugin template structure
- Include `plugin.yaml` manifest
- Document all JSON-RPC methods
- Provide usage examples

## Testing

### Plugin Tests

Test plugins standalone before integration:

```bash
# OAuth Manager
cd plugins/core/oauth-manager
echo '{"jsonrpc":"2.0","method":"listProviders","params":{},"id":1}' | node index.js

# Project Manager
cd plugins/core/project-manager
echo '{"jsonrpc":"2.0","method":"listProjects","params":{},"id":1}' | node index.js

# DOCX Generator
cd plugins/document-generation/docx-generator
echo '{"jsonrpc":"2.0","method":"generateSimple","params":{"title":"Test","body":"Content","outputPath":"/tmp/test.docx"},"id":1}' | node index.js
```

### Integration Tests

After making changes:

1. Run the full application
2. Test plugin loading
3. Test plugin method calls
4. Verify no regressions

## Creating a New Plugin

### 1. Create Plugin Directory

```bash
mkdir -p plugins/custom/my-plugin
```

### 2. Create plugin.yaml

```yaml
metadata:
  id: my-plugin
  name: "My Plugin"
  version: 1.0.0
  author: "Your Name"
  description: "What it does"
  category: custom

capabilities:
  - capability-1

api:
  protocol: jsonrpc
  methods:
    - name: myMethod
      description: "Method description"
      params:
        - name: param1
          type: string
          required: true
      returns: object
```

### 3. Create index.js

See existing plugins for examples.

### 4. Test Standalone

```bash
echo '{"jsonrpc":"2.0","method":"myMethod","params":{"param1":"test"},"id":1}' | node index.js
```

### 5. Submit PR

Open a pull request with your new plugin!

## Documentation

- Update README.md if adding major features
- Add comments to complex code
- Update SYSTEM_SUMMARY.md for architectural changes
- Create guides in /docs for new features

## Git Commit Messages

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues: "Fix #123: Description"

**Examples:**

```
Add PDF generator plugin

- Implement PDF generation using pdf-lib
- Support text, images, and formatting
- Add unit tests
- Update documentation

Fixes #42
```

## Code Review Process

1. **Automated Checks:** All tests must pass
2. **Code Review:** At least one maintainer approval
3. **Documentation:** Must include docs if needed
4. **Testing:** Must include tests for new features

## Project Structure

```
AIOrchestrator/
├── src-tauri/              # Rust backend
├── frontend/               # React frontend
├── plugins/                # Plugin directory
│   ├── core/              # Core plugins
│   ├── document-generation/
│   ├── ai-integrations/
│   └── custom/            # Community plugins
└── docs/                  # Documentation
```

## Plugin Categories

- **core:** Essential system functionality
- **document-generation:** Output creation
- **ai-integrations:** LLM providers
- **custom:** Community-contributed plugins

## Getting Help

- **Documentation:** Check `/docs` directory
- **Examples:** Review existing plugins
- **Issues:** Search existing issues
- **Discussions:** Start a discussion for questions

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Credited in release notes
- Mentioned in documentation

## Thank You! 🙏

Every contribution helps make AI Orchestrator better for everyone!

---

**Questions?** Open an issue or start a discussion!
