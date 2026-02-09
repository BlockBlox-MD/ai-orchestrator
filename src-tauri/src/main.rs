// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::sync::Mutex;

mod plugin_manager;
mod commands;

use plugin_manager::PluginManager;
use commands::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::discover_plugins,
            commands::load_plugin,
            commands::call_plugin_method,
            commands::get_plugin_status,
        ])
        .setup(|app| {
            // Initialize plugin manager
            let plugin_dir = app.path().app_data_dir()
                .expect("Failed to get app data dir")
                .join("plugins");

            std::fs::create_dir_all(&plugin_dir)
                .expect("Failed to create plugins directory");

            println!("Plugin directory: {:?}", plugin_dir);

            // Create plugin manager
            let plugin_manager = PluginManager::new(plugin_dir);

            // Register app state
            app.manage(AppState {
                plugin_manager: Mutex::new(plugin_manager),
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
