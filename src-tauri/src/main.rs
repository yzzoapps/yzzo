// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::tray::TrayIconBuilder;
use tauri_plugin_clipboard_manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
