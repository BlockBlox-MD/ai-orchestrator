import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import PluginManager from './components/PluginManager';
import './App.css';

interface PluginManifest {
  metadata: {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    category: string;
  };
  capabilities: string[];
}

function App() {
  const [plugins, setPlugins] = useState<PluginManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    discoverPlugins();
  }, []);

  const discoverPlugins = async () => {
    try {
      setLoading(true);
      const discoveredPlugins = await invoke<PluginManifest[]>('discover_plugins');
      setPlugins(discoveredPlugins);
      setError(null);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI Orchestrator</h1>
        <p>Multi-Model AI Orchestration Platform</p>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading plugins...</div>}
        {error && <div className="error">Error: {error}</div>}
        {!loading && !error && (
          <PluginManager plugins={plugins} onRefresh={discoverPlugins} />
        )}
      </main>
    </div>
  );
}

export default App;
