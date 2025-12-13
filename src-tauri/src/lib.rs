// lib.rs
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_clipboard_manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};
use tauri_plugin_positioner::{self, Position, WindowExt};

mod clipboard_watcher;
mod commands;
mod db;
mod models;
mod state;

use commands::hotkeys::{get_hotkey};
use commands::{hotkeys, items};
use db::setup_db;
use state::AppState;

#[cfg(target_os = "macos")]
const DEFAULT_HOTKEY: &str = "Cmd+`";

#[cfg(not(target_os = "macos"))]
const DEFAULT_HOTKEY: &str = "Alt+`";

/// Parse a hotkey string (like "Cmd+`") into a `Shortcut` instance.
fn parse_hotkey(hotkey: &str) -> Result<Shortcut, String> {
    let mut modifiers = Modifiers::empty();
    let mut key = Code::KeyA; // Default key (to be replaced)

    let parts: Vec<&str> = hotkey.split('+').collect();

    for part in parts {
        match part.trim().to_lowercase().as_str() {
            "cmd" | "super" => modifiers.insert(Modifiers::SUPER),
            "ctrl" => modifiers.insert(Modifiers::CONTROL),
            "alt" => modifiers.insert(Modifiers::ALT),
            "`" => key = Code::Backquote,
            "a" => key = Code::KeyA,
            "b" => key = Code::KeyB,
            // Add more cases for other keys as needed
            _ => return Err(format!("Unknown key or modifier: {}", part)),
        }
    }

    Ok(Shortcut::new(Some(modifiers), key))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--tray-only"]),
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            items::get_items,
            items::add_item,
            items::bump_item,
            hotkeys::set_hotkey,
            hotkeys::get_hotkey
        ])
        .setup(move |app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();

                tauri::async_runtime::block_on(async {
                    let db = setup_db(&handle).await;
                    handle.manage(AppState { db });
                });

                clipboard_watcher::start_clipboard_watcher(handle.clone());

                // Register global hotkey after state is managed
                let state = handle.state::<AppState>();
                let hotkey = tauri::async_runtime::block_on(async {
                    get_hotkey(state.clone())
                        .await
                        .unwrap_or_else(|_| DEFAULT_HOTKEY.to_string())
                });

                match parse_hotkey(&hotkey) {
                    Ok(shortcut) => {
                        match handle.global_shortcut().register(shortcut) {
                            Ok(_) => println!("Global shortcut registered: {}", hotkey),
                            Err(e) => eprintln!("Failed to register global shortcut: {}", e),
                        }
                    }
                    Err(e) => eprintln!("Failed to parse hotkey '{}': {}", hotkey, e),
                }

                // tray icon setup
                if let Some(icon) = app.default_window_icon() {
                    if let Err(e) = TrayIconBuilder::new()
                        .icon(icon.clone())
                        .on_tray_icon_event(|tray, event| {
                            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

                            match event {
                                TrayIconEvent::Click {
                                    button: MouseButton::Left,
                                    button_state: MouseButtonState::Up,
                                    ..
                                } => {
                                    let app = tray.app_handle();
                                    if let Some(window) = app.get_webview_window("main") {
                                        if let Ok(visible) = window.is_visible() {
                                            if visible {
                                                let _ = window.hide();
                                            } else {
                                                let _ = window.unminimize();
                                                let _ = window.show();
                                                let _ = window.move_window(Position::TrayCenter).ok();
                                                let _ = window.set_focus();
                                            }
                                        }
                                    }
                                }
                                _ => {
                                    println!("unhandled event {event:?}");
                                }
                            }
                        })
                        .build(app)
                    {
                        eprintln!("Failed to build tray icon: {}", e);
                    }
                } else {
                    eprintln!("No default window icon available for tray");
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error building the tauri application");

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    app.run(|_app_handle, _event| {});
}
