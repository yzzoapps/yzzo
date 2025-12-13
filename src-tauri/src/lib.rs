use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_clipboard_manager;
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_global_shortcut::ShortcutState;
use tauri_plugin_positioner::{self, Position, WindowExt};

mod clipboard_watcher;
mod commands;
mod db;
mod models;
mod state;

use commands::hotkeys::{get_hotkey, parse_hotkey};
use commands::{hotkeys, items};
use db::setup_db;
use state::AppState;

#[cfg(target_os = "macos")]
const DEFAULT_HOTKEY: &str = "Cmd+`";

#[cfg(not(target_os = "macos"))]
const DEFAULT_HOTKEY: &str = "Alt+`";

pub static HOLD_BEHAVIOR: AtomicBool = AtomicBool::new(false);

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
            hotkeys::get_hotkey,
            hotkeys::get_hold_behavior,
            hotkeys::set_hold_behavior
        ])
        .setup(move |app| {
            #[cfg(desktop)]
            {
                let handle = app.handle().clone();

                tauri::async_runtime::block_on(async {
                    let db = setup_db(&handle).await;

                    let hold_behavior = sqlx::query_as::<_, (String,)>(
                        "SELECT value FROM settings WHERE key = 'hold_behavior'",
                    )
                    .fetch_optional(&db)
                    .await
                    .ok()
                    .flatten()
                    .map(|r| r.0 == "true")
                    .unwrap_or(false);
                    HOLD_BEHAVIOR.store(hold_behavior, Ordering::Relaxed);

                    handle.manage(AppState { db });
                });

                clipboard_watcher::start_clipboard_watcher(handle.clone());

                // Register global hotkey after state is managed
                let state = handle.state::<AppState>();
                let hotkey = tauri::async_runtime::block_on(async {
                    get_hotkey(state.clone()).await.unwrap_or_else(|e| {
                        eprintln!("[X] Failed to get hotkey from DB: {}, using default", e);
                        DEFAULT_HOTKEY.to_string()
                    })
                });

                match parse_hotkey(&hotkey) {
                    Ok(shortcut) => {
                        let handle_clone = handle.clone();
                        match handle.global_shortcut().on_shortcut(
                            shortcut,
                            move |_app, _shortcut, event| {
                                let hold_mode = HOLD_BEHAVIOR.load(Ordering::Relaxed);

                                if let Some(window) = handle_clone.get_webview_window("main") {
                                    if hold_mode {
                                        match event.state() {
                                            ShortcutState::Pressed => {
                                                let _ = window.unminimize();
                                                let _ = window.show();
                                                let _ = window.set_focus();
                                            }
                                            ShortcutState::Released => {
                                                let _ = window.hide();
                                            }
                                        }
                                    } else {
                                        if let ShortcutState::Pressed = event.state() {
                                            if let Ok(visible) = window.is_visible() {
                                                if visible {
                                                    let _ = window.hide();
                                                } else {
                                                    let _ = window.unminimize();
                                                    let _ = window.show();
                                                    let _ = window.set_focus();
                                                }
                                            }
                                        }
                                    }
                                }
                            },
                        ) {
                            Ok(_) => {
                                println!("[V] Global shortcut registered successfully: {}", hotkey)
                            }
                            Err(e) => eprintln!("[X] Failed to register global shortcut: {}", e),
                        }
                    }
                    Err(e) => eprintln!("[X] Failed to parse hotkey '{}': {}", hotkey, e),
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
                                                let _ =
                                                    window.move_window(Position::TrayCenter).ok();
                                                let _ = window.set_focus();
                                            }
                                        }
                                    }
                                }
                                _ => {}
                            }
                        })
                        .build(app)
                    {
                        eprintln!("[X] Failed to build tray icon: {}", e);
                    }
                } else {
                    eprintln!("[X] No default window icon available for tray");
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
