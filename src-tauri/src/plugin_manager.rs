use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::io::{BufRead, BufReader, Write};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub metadata: PluginMetadata,
    pub capabilities: Vec<String>,
    pub dependencies: PluginDependencies,
    pub api: PluginApi,
    pub ui: Option<PluginUI>,
    pub auto_update: Option<AutoUpdate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub description: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginDependencies {
    pub plugins: Vec<String>,
    #[serde(default)]
    pub npm_packages: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginApi {
    pub protocol: String, // jsonrpc, http, grpc
    pub port: Option<u16>,
    pub methods: Vec<PluginMethod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginMethod {
    pub name: String,
    pub description: String,
    pub params: Vec<MethodParam>,
    pub returns: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MethodParam {
    pub name: String,
    #[serde(rename = "type")]
    pub param_type: String,
    pub required: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginUI {
    pub menu_items: Option<Vec<MenuItem>>,
    pub settings_page: Option<SettingsPage>,
    pub toolbar_buttons: Option<Vec<ToolbarButton>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MenuItem {
    pub label: String,
    pub action: String,
    pub shortcut: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SettingsPage {
    pub title: String,
    pub component: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolbarButton {
    pub icon: String,
    pub tooltip: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoUpdate {
    pub enabled: bool,
    pub channel: String,
    pub source: String,
    pub package: Option<String>,
}

#[derive(Debug)]
pub struct Plugin {
    pub manifest: PluginManifest,
    pub path: PathBuf,
    pub process: Option<Child>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub method: String,
    pub params: serde_json::Value,
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub result: Option<serde_json::Value>,
    pub error: Option<JsonRpcError>,
    pub id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    pub data: Option<serde_json::Value>,
}

pub struct PluginManager {
    plugins: HashMap<String, Plugin>,
    plugin_dir: PathBuf,
}

impl PluginManager {
    pub fn new(plugin_dir: PathBuf) -> Self {
        Self {
            plugins: HashMap::new(),
            plugin_dir,
        }
    }

    pub fn discover_plugins(&self) -> Result<Vec<PluginManifest>, String> {
        let mut manifests = Vec::new();

        let categories = vec!["core", "document-generation", "ai-integrations", "custom"];

        for category in categories {
            let category_path = self.plugin_dir.join(category);
            if !category_path.exists() {
                continue;
            }

            let entries = std::fs::read_dir(&category_path)
                .map_err(|e| format!("Failed to read category dir: {}", e))?;

            for entry in entries {
                let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
                let plugin_path = entry.path();

                if !plugin_path.is_dir() {
                    continue;
                }

                let manifest_path = plugin_path.join("plugin.yaml");
                if !manifest_path.exists() {
                    continue;
                }

                let manifest_content = std::fs::read_to_string(&manifest_path)
                    .map_err(|e| format!("Failed to read manifest: {}", e))?;

                let manifest: PluginManifest = serde_yaml::from_str(&manifest_content)
                    .map_err(|e| format!("Failed to parse manifest: {}", e))?;

                manifests.push(manifest);
            }
        }

        Ok(manifests)
    }

    pub fn load_plugin(&mut self, plugin_id: &str) -> Result<(), String> {
        // Find plugin manifest
        let manifest = self
            .discover_plugins()?
            .into_iter()
            .find(|m| m.metadata.id == plugin_id)
            .ok_or_else(|| format!("Plugin not found: {}", plugin_id))?;

        // Find plugin path
        let plugin_path = self.find_plugin_path(&manifest.metadata.id)?;

        // Start plugin process based on entry point
        let entry_point = plugin_path.join("index.js");

        if !entry_point.exists() {
            return Err(format!("Entry point not found: {:?}", entry_point));
        }

        // Start Node.js process
        let mut child = Command::new("node")
            .arg(&entry_point)
            .current_dir(&plugin_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start plugin: {}", e))?;

        println!("Plugin {} started with PID: {:?}", plugin_id, child.id());

        let plugin = Plugin {
            manifest,
            path: plugin_path,
            process: Some(child),
        };

        self.plugins.insert(plugin_id.to_string(), plugin);

        Ok(())
    }

    pub fn call_plugin_method(
        &mut self,
        plugin_id: &str,
        method: &str,
        params: serde_json::Value,
    ) -> Result<serde_json::Value, String> {
        let plugin = self
            .plugins
            .get_mut(plugin_id)
            .ok_or_else(|| format!("Plugin not loaded: {}", plugin_id))?;

        let process = plugin
            .process
            .as_mut()
            .ok_or_else(|| "Plugin process not running".to_string())?;

        // Create JSON-RPC request
        let request = JsonRpcRequest {
            jsonrpc: "2.0".to_string(),
            method: method.to_string(),
            params,
            id: 1,
        };

        let request_json = serde_json::to_string(&request)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        // Send request to plugin via stdin
        let stdin = process
            .stdin
            .as_mut()
            .ok_or_else(|| "Failed to get stdin".to_string())?;

        writeln!(stdin, "{}", request_json)
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;

        stdin
            .flush()
            .map_err(|e| format!("Failed to flush stdin: {}", e))?;

        // Read response from stdout
        let stdout = process
            .stdout
            .as_mut()
            .ok_or_else(|| "Failed to get stdout".to_string())?;

        let mut reader = BufReader::new(stdout);
        let mut response_line = String::new();
        reader
            .read_line(&mut response_line)
            .map_err(|e| format!("Failed to read response: {}", e))?;

        // Parse JSON-RPC response
        let response: JsonRpcResponse = serde_json::from_str(&response_line)
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if let Some(error) = response.error {
            return Err(format!("Plugin error: {}", error.message));
        }

        response
            .result
            .ok_or_else(|| "No result in response".to_string())
    }

    fn find_plugin_path(&self, plugin_id: &str) -> Result<PathBuf, String> {
        let categories = vec!["core", "document-generation", "ai-integrations", "custom"];

        for category in categories {
            let plugin_path = self.plugin_dir.join(category).join(plugin_id);
            if plugin_path.exists() {
                return Ok(plugin_path);
            }
        }

        Err(format!("Plugin path not found: {}", plugin_id))
    }

    pub fn get_plugin_status(&self, plugin_id: &str) -> Result<String, String> {
        if let Some(plugin) = self.plugins.get(plugin_id) {
            if plugin.process.is_some() {
                Ok("running".to_string())
            } else {
                Ok("loaded".to_string())
            }
        } else {
            Ok("not_loaded".to_string())
        }
    }
}

impl Drop for PluginManager {
    fn drop(&mut self) {
        // Clean up all plugin processes
        for (_, plugin) in self.plugins.iter_mut() {
            if let Some(mut process) = plugin.process.take() {
                let _ = process.kill();
            }
        }
    }
}
