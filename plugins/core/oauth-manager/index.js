#!/usr/bin/env node

import { createInterface } from 'readline';
import { writeFileSync, readFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Try to import keytar, fallback to file-based storage if not available
let keytar = null;
let useFileStorage = false;

try {
  keytar = await import('keytar');
  keytar = keytar.default;
} catch (error) {
  console.error('Keytar not available, using file-based storage (insecure, for testing only)');
  useFileStorage = true;
}

const SERVICE_NAME = 'AIOrchestrator';
const STORAGE_DIR = join(homedir(), '.ai-orchestrator', 'credentials');

// File-based storage fallback (insecure, for testing only)
if (useFileStorage && !existsSync(STORAGE_DIR)) {
  mkdirSync(STORAGE_DIR, { recursive: true });
}

async function fileGetPassword(service, account) {
  const filePath = join(STORAGE_DIR, `${account}.json`);
  if (!existsSync(filePath)) return null;
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    return data.password;
  } catch {
    return null;
  }
}

async function fileSetPassword(service, account, password) {
  const filePath = join(STORAGE_DIR, `${account}.json`);
  writeFileSync(filePath, JSON.stringify({ password }), 'utf8');
}

async function fileDeletePassword(service, account) {
  const filePath = join(STORAGE_DIR, `${account}.json`);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
    return true;
  }
  return false;
}

// JSON-RPC server over stdio
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Provider configurations
const PROVIDERS = {
  claude: {
    name: 'Anthropic Claude',
    authUrl: 'https://console.anthropic.com/settings/keys',
    apiKeyFormat: /^sk-ant-api03-[A-Za-z0-9_-]+$/
  },
  openai: {
    name: 'OpenAI',
    authUrl: 'https://platform.openai.com/api-keys',
    apiKeyFormat: /^sk-[A-Za-z0-9]+$/
  },
  google: {
    name: 'Google Gemini',
    authUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyFormat: /^[A-Za-z0-9_-]+$/
  }
};

async function handleAuthenticate(params) {
  const { provider } = params;

  if (!PROVIDERS[provider]) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const config = PROVIDERS[provider];

  // For now, return auth URL for manual API key entry
  // In production, this would open browser and handle OAuth flow
  return {
    provider,
    authUrl: config.authUrl,
    instructions: `Please visit ${config.authUrl} to generate an API key, then use setToken to store it.`
  };
}

async function handleGetToken(params) {
  const { provider } = params;

  if (!PROVIDERS[provider]) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    const token = useFileStorage
      ? await fileGetPassword(SERVICE_NAME, provider)
      : await keytar.getPassword(SERVICE_NAME, provider);

    if (!token) {
      return {
        provider,
        authenticated: false,
        token: null
      };
    }

    return {
      provider,
      authenticated: true,
      token
    };
  } catch (error) {
    throw new Error(`Failed to retrieve token: ${error.message}`);
  }
}

async function handleSetToken(params) {
  const { provider, token } = params;

  if (!PROVIDERS[provider]) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  const config = PROVIDERS[provider];

  // Validate token format
  if (!config.apiKeyFormat.test(token)) {
    throw new Error(`Invalid token format for ${provider}`);
  }

  try {
    if (useFileStorage) {
      await fileSetPassword(SERVICE_NAME, provider, token);
    } else {
      await keytar.setPassword(SERVICE_NAME, provider, token);
    }
    return {
      provider,
      success: true
    };
  } catch (error) {
    throw new Error(`Failed to store token: ${error.message}`);
  }
}

async function handleRevokeToken(params) {
  const { provider } = params;

  if (!PROVIDERS[provider]) {
    throw new Error(`Unknown provider: ${provider}`);
  }

  try {
    const deleted = useFileStorage
      ? await fileDeletePassword(SERVICE_NAME, provider)
      : await keytar.deletePassword(SERVICE_NAME, provider);
    return {
      provider,
      success: deleted
    };
  } catch (error) {
    throw new Error(`Failed to revoke token: ${error.message}`);
  }
}

async function handleListProviders() {
  const results = {};

  for (const [id, config] of Object.entries(PROVIDERS)) {
    const token = useFileStorage
      ? await fileGetPassword(SERVICE_NAME, id)
      : await keytar.getPassword(SERVICE_NAME, id);
    results[id] = {
      name: config.name,
      authenticated: !!token
    };
  }

  return results;
}

// Method handlers
const methods = {
  authenticate: handleAuthenticate,
  getToken: handleGetToken,
  setToken: handleSetToken,
  revokeToken: handleRevokeToken,
  listProviders: handleListProviders
};

// Process JSON-RPC requests
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    const { jsonrpc, method, params, id } = request;

    if (jsonrpc !== '2.0') {
      throw new Error('Invalid JSON-RPC version');
    }

    if (!methods[method]) {
      throw new Error(`Unknown method: ${method}`);
    }

    const result = await methods[method](params || {});

    const response = {
      jsonrpc: '2.0',
      result,
      id
    };

    console.log(JSON.stringify(response));
  } catch (error) {
    const response = {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error.message
      },
      id: null
    };

    console.log(JSON.stringify(response));
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
});

// Signal ready
console.error('OAuth Manager plugin started');
