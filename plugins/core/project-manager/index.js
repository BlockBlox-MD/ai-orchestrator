#!/usr/bin/env node

import { createInterface } from 'readline';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Project storage directory
const PROJECT_DIR = join(homedir(), '.ai-orchestrator', 'projects');

// Ensure project directory exists
if (!existsSync(PROJECT_DIR)) {
  mkdirSync(PROJECT_DIR, { recursive: true });
}

// JSON-RPC server over stdio
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Helper functions
function generateId() {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getProjectPath(projectId) {
  return join(PROJECT_DIR, projectId);
}

function getProjectMetaPath(projectId) {
  return join(getProjectPath(projectId), 'project.json');
}

function getProjectContextPath(projectId) {
  return join(getProjectPath(projectId), 'context.json');
}

function getProjectArtifactsPath(projectId) {
  return join(getProjectPath(projectId), 'artifacts');
}

// Method handlers
async function handleCreateProject(params) {
  const { name, description = '' } = params;

  if (!name) {
    throw new Error('Project name is required');
  }

  const projectId = generateId();
  const projectPath = getProjectPath(projectId);
  const artifactsPath = getProjectArtifactsPath(projectId);

  // Create project directory structure
  mkdirSync(projectPath, { recursive: true });
  mkdirSync(artifactsPath, { recursive: true });

  // Create project metadata
  const project = {
    id: projectId,
    name,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    context: {},
    artifactCount: 0
  };

  // Save project metadata
  writeFileSync(
    getProjectMetaPath(projectId),
    JSON.stringify(project, null, 2),
    'utf8'
  );

  // Initialize empty context
  writeFileSync(
    getProjectContextPath(projectId),
    JSON.stringify({ messages: [], metadata: {} }, null, 2),
    'utf8'
  );

  return project;
}

async function handleListProjects() {
  if (!existsSync(PROJECT_DIR)) {
    return [];
  }

  const projectDirs = readdirSync(PROJECT_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const projects = [];

  for (const projectId of projectDirs) {
    const metaPath = getProjectMetaPath(projectId);
    if (existsSync(metaPath)) {
      try {
        const project = JSON.parse(readFileSync(metaPath, 'utf8'));
        projects.push(project);
      } catch (error) {
        console.error(`Failed to load project ${projectId}:`, error.message);
      }
    }
  }

  // Sort by updatedAt (most recent first)
  projects.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return projects;
}

async function handleLoadProject(params) {
  const { projectId } = params;

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const metaPath = getProjectMetaPath(projectId);

  if (!existsSync(metaPath)) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const project = JSON.parse(readFileSync(metaPath, 'utf8'));

  // Load context if exists
  const contextPath = getProjectContextPath(projectId);
  if (existsSync(contextPath)) {
    project.context = JSON.parse(readFileSync(contextPath, 'utf8'));
  }

  // Count artifacts
  const artifactsPath = getProjectArtifactsPath(projectId);
  if (existsSync(artifactsPath)) {
    const artifacts = readdirSync(artifactsPath);
    project.artifactCount = artifacts.length;
  }

  return project;
}

async function handleSaveContext(params) {
  const { projectId, context } = params;

  if (!projectId || !context) {
    throw new Error('Project ID and context are required');
  }

  const metaPath = getProjectMetaPath(projectId);

  if (!existsSync(metaPath)) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Save context
  writeFileSync(
    getProjectContextPath(projectId),
    JSON.stringify(context, null, 2),
    'utf8'
  );

  // Update project metadata
  const project = JSON.parse(readFileSync(metaPath, 'utf8'));
  project.updatedAt = new Date().toISOString();
  writeFileSync(metaPath, JSON.stringify(project, null, 2), 'utf8');

  return true;
}

async function handleAddArtifact(params) {
  const { projectId, artifact } = params;

  if (!projectId || !artifact) {
    throw new Error('Project ID and artifact are required');
  }

  const metaPath = getProjectMetaPath(projectId);

  if (!existsSync(metaPath)) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Generate artifact filename
  const artifactId = `artifact_${Date.now()}.json`;
  const artifactPath = join(getProjectArtifactsPath(projectId), artifactId);

  // Add metadata to artifact
  const artifactWithMeta = {
    ...artifact,
    id: artifactId,
    createdAt: new Date().toISOString()
  };

  // Save artifact
  writeFileSync(artifactPath, JSON.stringify(artifactWithMeta, null, 2), 'utf8');

  // Update project metadata
  const project = JSON.parse(readFileSync(metaPath, 'utf8'));
  project.updatedAt = new Date().toISOString();
  project.artifactCount = (project.artifactCount || 0) + 1;
  writeFileSync(metaPath, JSON.stringify(project, null, 2), 'utf8');

  return true;
}

async function handleGetArtifacts(params) {
  const { projectId } = params;

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const artifactsPath = getProjectArtifactsPath(projectId);

  if (!existsSync(artifactsPath)) {
    return [];
  }

  const artifactFiles = readdirSync(artifactsPath).filter(f => f.endsWith('.json'));
  const artifacts = [];

  for (const file of artifactFiles) {
    try {
      const artifact = JSON.parse(
        readFileSync(join(artifactsPath, file), 'utf8')
      );
      artifacts.push(artifact);
    } catch (error) {
      console.error(`Failed to load artifact ${file}:`, error.message);
    }
  }

  // Sort by createdAt (most recent first)
  artifacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return artifacts;
}

async function handleDeleteProject(params) {
  const { projectId } = params;

  if (!projectId) {
    throw new Error('Project ID is required');
  }

  const projectPath = getProjectPath(projectId);

  if (!existsSync(projectPath)) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Recursively delete project directory
  const rmrf = (path) => {
    if (existsSync(path)) {
      readdirSync(path).forEach((file) => {
        const curPath = join(path, file);
        if (readdirSync(curPath).length > 0) {
          rmrf(curPath);
        } else {
          unlinkSync(curPath);
        }
      });
      rmdirSync(path);
    }
  };

  try {
    // Simple approach: use fs.rm with recursive (Node 14.14+)
    const { rmSync } = await import('fs');
    rmSync(projectPath, { recursive: true, force: true });
    return true;
  } catch (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

// Method handlers map
const methods = {
  createProject: handleCreateProject,
  listProjects: handleListProjects,
  loadProject: handleLoadProject,
  saveContext: handleSaveContext,
  addArtifact: handleAddArtifact,
  getArtifacts: handleGetArtifacts,
  deleteProject: handleDeleteProject
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
console.error('Project Manager plugin started');
console.error(`Project directory: ${PROJECT_DIR}`);
