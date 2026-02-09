#!/usr/bin/env node

import { createInterface } from 'readline';
import Anthropic from '@anthropic-ai/sdk';

// JSON-RPC server over stdio
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Global client (will be initialized with API key)
let anthropic = null;

/**
 * Initialize Anthropic client with API key
 */
async function ensureInitialized(apiKey) {
  if (!apiKey) {
    throw new Error('API key required. Use setApiKey method first.');
  }

  if (!anthropic) {
    anthropic = new Anthropic({
      apiKey: apiKey,
    });
  }
}

/**
 * Set API key
 */
async function handleSetApiKey(params) {
  const { apiKey } = params;

  if (!apiKey) {
    throw new Error('apiKey parameter required');
  }

  // Initialize client
  anthropic = new Anthropic({
    apiKey: apiKey,
  });

  return {
    success: true,
    message: 'API key set successfully'
  };
}

/**
 * Complete method - get Claude completion
 */
async function handleComplete(params) {
  const {
    apiKey,
    messages,
    model = 'claude-sonnet-4-5-20250929',
    maxTokens = 4096,
    temperature = 1.0
  } = params;

  if (!messages || !Array.isArray(messages)) {
    throw new Error('messages array is required');
  }

  await ensureInitialized(apiKey);

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages
    });

    return {
      content: response.content[0].text,
      model: response.model,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      stopReason: response.stop_reason,
    };
  } catch (error) {
    throw new Error(`Claude API error: ${error.message}`);
  }
}

/**
 * Analyze document method
 */
async function handleAnalyzeDocument(params) {
  const { apiKey, content, task } = params;

  if (!content || !task) {
    throw new Error('content and task parameters required');
  }

  await ensureInitialized(apiKey);

  const messages = [
    {
      role: 'user',
      content: `Task: ${task}\n\nDocument:\n${content}`
    }
  ];

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages
    });

    return {
      analysis: response.content[0].text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      }
    };
  } catch (error) {
    throw new Error(`Claude API error: ${error.message}`);
  }
}

// Method handlers
const methods = {
  setApiKey: handleSetApiKey,
  complete: handleComplete,
  analyzeDocument: handleAnalyzeDocument,
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
console.error('Claude Integration plugin started');
