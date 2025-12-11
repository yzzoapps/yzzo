// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::{
    Manager,
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_clipboard_manager;
use tauri_plugin_global_shortcut::{
    Builder, Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
};
use tauri_plugin_positioner::{self, Position, WindowExt};

mod clipboard_watcher;
mod commands;
mod db;
mod models;
mod state;

use commands::{hotkeys, items};
use db::setup_db;
use state::AppState;

fn main() {
    // create the shortcut
    let ctrl_n = Shortcut::new(Some(Modifiers::CONTROL), Code::KeyN);

    // move it into the setup closure
    let ctrl_n_for_setup = ctrl_n.clone();

    let shortcut_plugin = Builder::new()
        .with_handler({
            let ctrl_n = ctrl_n.clone();
            move |_app, shortcut, event| {
                if shortcut == &ctrl_n {
                    match event.state() {
                        ShortcutState::Pressed => println!("Ctrl-N Pressed!"),
                        ShortcutState::Released => println!("Ctrl-N Released!"),
                    }
                }
            }
        })
        .build();

    let mut app = tauri::Builder::default()
        .plugin(shortcut_plugin)
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--tray-only"]),
        ))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            items::get_items,
            items::add_item,
            items::bump_item
        ])
        .setup(move |app| {
            #[cfg(desktop)]
            {
                // global shortcut
                app.global_shortcut().register(ctrl_n_for_setup.clone())?;

                let handle = app.handle().clone();

                // database setup
                tauri::async_runtime::spawn({
                    let db_handle = handle.clone();
                    async move {
                        let db = setup_db(&db_handle).await;
                        db_handle.manage(AppState { db });
                    }
                });

                // clipboard watcher
                clipboard_watcher::start_clipboard_watcher(handle.clone());

                // autostart logic
                if !cfg!(debug_assertions) {
                    let autostart_manager = app.autolaunch();
                    let _ = autostart_manager.enable();
                }

                // tray icon setup
                TrayIconBuilder::new()
                    .icon(app.default_window_icon().unwrap().clone())
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
                    .build(app)?;
            }

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error building the tauri application");

    #[cfg(target_os = "macos")]
    app.set_activation_policy(tauri::ActivationPolicy::Accessory);

    app.run(|_app_handle, _event| {});
}
