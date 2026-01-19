use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_clipboard_manager;
use tauri_plugin_positioner::{self};

mod clipboard_watcher;
mod commands;
mod db;
mod models;
mod state;

use commands::hotkeys::{DEFAULT_HOTKEY, get_hotkey, move_to_tray_or_center, parse_hotkey};
use commands::{hotkeys, items};
use db::setup_db;
use state::AppState;

pub static HOLD_BEHAVIOR: AtomicBool = AtomicBool::new(false);

pub fn run() {
    let mut app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // when a second instance is launched, focus the existing window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--tray-only"]),
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            items::get_items,
            items::add_item,
            items::bump_item,
            items::delete_item,
            items::get_image_base64,
            items::write_image_to_clipboard,
            items::clear_all_items,
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

                    let hold_behavior = hotkeys::load_hold_behavior_from_db(&db).await;
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
                    Ok(shortcut) => match hotkeys::register_hotkey_handler(&handle, shortcut) {
                        Ok(_) => println!("[V] Global shortcut registered: {}", hotkey),
                        Err(e) => eprintln!("Failed to register: {}", e),
                    },
                    Err(e) => eprintln!("Failed to parse hotkey: {}", e),
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
                                                let _ = move_to_tray_or_center(&window);
                                                let _ = window.show();
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

                #[cfg(target_os = "macos")]
                {
                    // on macOS, keep window hidden - only show via tray icon click
                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                            width: 340.0,
                            height: 560.0,
                        }));
                        let _ = window.set_title("YZZO - Clipboard Manager");
                        let _ = window.set_minimizable(true);
                        let _ = window.hide();
                    }
                }

                #[cfg(target_os = "linux")]
                {
                    // on Linux, show the window by default since tray behavior is unreliable
                    if let Some(window) = handle.get_webview_window("main") {
                        let _ = window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                            width: 800,
                            height: 600,
                        }));
                        let _ = window.skip_taskbar(true);
                        let _ = window.set_resizable(true);
                        move_to_tray_or_center(&window);
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error building the tauri application");

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    app.run(|app_handle, event| {
        #[cfg(target_os = "macos")]
        if let tauri::RunEvent::Reopen { .. } = event {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.unminimize();
                move_to_tray_or_center(&window);
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    });
}
