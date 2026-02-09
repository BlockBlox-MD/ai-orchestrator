use crate::plugin_manager::{PluginManifest, PluginManager};
use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    pub plugin_manager: Mutex<PluginManager>,
}

#[tauri::command]
pub fn discover_plugins(
    state: State<'_, AppState>,
) -> Result<Vec<PluginManifest>, String> {
    let manager = state.plugin_manager.lock().unwrap();
    manager.discover_plugins()
}

#[tauri::command]
pub fn load_plugin(
    plugin_id: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut manager = state.plugin_manager.lock().unwrap();
    manager.load_plugin(&plugin_id)
}

#[tauri::command]
pub fn call_plugin_method(
    plugin_id: String,
    method: String,
    params: serde_json::Value,
    state: State<'_, AppState>,
) -> Result<serde_json::Value, String> {
    let mut manager = state.plugin_manager.lock().unwrap();
    manager.call_plugin_method(&plugin_id, &method, params)
}

#[tauri::command]
pub fn get_plugin_status(
    plugin_id: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let manager = state.plugin_manager.lock().unwrap();
    manager.get_plugin_status(&plugin_id)
}
