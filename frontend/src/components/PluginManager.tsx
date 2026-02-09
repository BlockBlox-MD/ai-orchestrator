import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './PluginManager.css';

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

interface PluginManagerProps {
  plugins: PluginManifest[];
  onRefresh: () => void;
}

function PluginManager({ plugins, onRefresh }: PluginManagerProps) {
  const [loadedPlugins, setLoadedPlugins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const loadPlugin = async (pluginId: string) => {
    try {
      setLoading(pluginId);
      await invoke('load_plugin', { pluginId });
      setLoadedPlugins(prev => new Set([...prev, pluginId]));
    } catch (err) {
      console.error('Failed to load plugin:', err);
      alert(`Failed to load plugin: ${err}`);
    } finally {
      setLoading(null);
    }
  };

  const groupedPlugins = plugins.reduce((acc, plugin) => {
    const category = plugin.metadata.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(plugin);
    return acc;
  }, {} as Record<string, PluginManifest[]>);

  return (
    <div className="plugin-manager">
      <div className="plugin-manager-header">
        <h2>Plugin Manager</h2>
        <button onClick={onRefresh} className="btn-refresh">
          Refresh
        </button>
      </div>

      {plugins.length === 0 ? (
        <div className="no-plugins">
          <p>No plugins found.</p>
          <p>Add plugins to the plugins directory to get started.</p>
        </div>
      ) : (
        <div className="plugin-categories">
          {Object.entries(groupedPlugins).map(([category, categoryPlugins]) => (
            <div key={category} className="plugin-category">
              <h3>{category.replace(/-/g, ' ').toUpperCase()}</h3>
              <div className="plugin-grid">
                {categoryPlugins.map(plugin => (
                  <div key={plugin.metadata.id} className="plugin-card">
                    <div className="plugin-header">
                      <h4>{plugin.metadata.name}</h4>
                      <span className="plugin-version">v{plugin.metadata.version}</span>
                    </div>
                    <p className="plugin-description">{plugin.metadata.description}</p>
                    <div className="plugin-details">
                      <span className="plugin-author">by {plugin.metadata.author}</span>
                      <span className="plugin-capabilities">
                        {plugin.capabilities.length} capabilities
                      </span>
                    </div>
                    <div className="plugin-actions">
                      {loadedPlugins.has(plugin.metadata.id) ? (
                        <button className="btn-loaded" disabled>
                          Loaded
                        </button>
                      ) : (
                        <button
                          onClick={() => loadPlugin(plugin.metadata.id)}
                          disabled={loading === plugin.metadata.id}
                          className="btn-load"
                        >
                          {loading === plugin.metadata.id ? 'Loading...' : 'Load Plugin'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PluginManager;
