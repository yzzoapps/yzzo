use crate::state::AppState;
use crate::{HOLD_BEHAVIOR, state::DbPool};
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Manager, State};

use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

#[cfg(target_os = "macos")]
pub const DEFAULT_HOTKEY: &str = "Cmd+`";

#[cfg(not(target_os = "macos"))]
pub const DEFAULT_HOTKEY: &str = "Alt+Q";

pub fn register_hotkey_handler(app: &AppHandle, shortcut: Shortcut) -> Result<(), String> {
    let app_clone = app.clone();

    println!("[I] Registering shortcut: {:?}", shortcut);

    app.global_shortcut()
        .on_shortcut(shortcut, move |_app, shortcut, event| {
            println!(
                "[DEBUG] Shortcut triggered: {:?}, state: {:?}",
                shortcut,
                event.state()
            );
            let hold_mode = crate::HOLD_BEHAVIOR.load(Ordering::Relaxed);

            if let Some(window) = app_clone.get_webview_window("main") {
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
        })
        .map_err(|e| format!("Failed to register shortcut: {}", e))
}

// Parse a hotkey string (like "Cmd+`") into a `Shortcut` instance.
pub fn parse_hotkey(hotkey: &str) -> Result<Shortcut, String> {
    let mut modifiers = Modifiers::empty();
    let mut key = Code::KeyA;

    let parts: Vec<&str> = hotkey.split('+').collect();

    for part in parts.iter() {
        let part_lower = part.trim().to_lowercase();

        // check if it's a modifier
        match part_lower.as_str() {
            "cmd" | "super" => modifiers.insert(Modifiers::SUPER),
            "ctrl" => modifiers.insert(Modifiers::CONTROL),
            "alt" => modifiers.insert(Modifiers::ALT),
            "shift" => modifiers.insert(Modifiers::SHIFT),
            _ => {
                // it's the actual key (last part)
                key = match part.trim() {
                    "`" => Code::Backquote,
                    "'" => Code::Quote,
                    "A" => Code::KeyA,
                    "B" => Code::KeyB,
                    "C" => Code::KeyC,
                    "D" => Code::KeyD,
                    "E" => Code::KeyE,
                    "F" => Code::KeyF,
                    "G" => Code::KeyG,
                    "H" => Code::KeyH,
                    "I" => Code::KeyI,
                    "J" => Code::KeyJ,
                    "K" => Code::KeyK,
                    "L" => Code::KeyL,
                    "M" => Code::KeyM,
                    "N" => Code::KeyN,
                    "O" => Code::KeyO,
                    "P" => Code::KeyP,
                    "Q" => Code::KeyQ,
                    "R" => Code::KeyR,
                    "S" => Code::KeyS,
                    "T" => Code::KeyT,
                    "U" => Code::KeyU,
                    "V" => Code::KeyV,
                    "W" => Code::KeyW,
                    "X" => Code::KeyX,
                    "Y" => Code::KeyY,
                    "Z" => Code::KeyZ,
                    "0" => Code::Digit0,
                    "1" => Code::Digit1,
                    "2" => Code::Digit2,
                    "3" => Code::Digit3,
                    "4" => Code::Digit4,
                    "5" => Code::Digit5,
                    "6" => Code::Digit6,
                    "7" => Code::Digit7,
                    "8" => Code::Digit8,
                    "9" => Code::Digit9,
                    _ => return Err(format!("Unsupported key: {}", part)),
                };
            }
        }
    }

    Ok(Shortcut::new(Some(modifiers), key))
}

#[tauri::command]
pub async fn get_hotkey(state: State<'_, AppState>) -> Result<String, String> {
    let result: Option<(String,)> =
        sqlx::query_as("SELECT value FROM settings WHERE key = 'hotkey' LIMIT 1")
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    match result {
        Some((value,)) => Ok(value),
        None => Ok(DEFAULT_HOTKEY.to_string()),
    }
}

#[tauri::command]
pub async fn set_hotkey(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    hotkey: String,
) -> Result<(), String> {
    let old_hotkey = get_hotkey(state.clone())
        .await
        .unwrap_or_else(|_| DEFAULT_HOTKEY.to_string());

    if let Ok(old_shortcut) = crate::parse_hotkey(&old_hotkey) {
        let _ = app.global_shortcut().unregister(old_shortcut);
    }

    let result = sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('hotkey', ?)")
        .bind(&hotkey)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Failed to update hotkey".to_string());
    }

    let new_shortcut =
        crate::parse_hotkey(&hotkey).map_err(|e| format!("Invalid hotkey: {}", e))?;

    let _ = app.global_shortcut().unregister_all();
    register_hotkey_handler(&app, new_shortcut)?;

    Ok(())
}

pub async fn load_hold_behavior_from_db(db: &DbPool) -> bool {
    sqlx::query_as::<_, (String,)>("SELECT value FROM settings WHERE key = 'hold_behavior'")
        .fetch_optional(db)
        .await
        .ok()
        .flatten()
        .map(|r| r.0 == "true")
        .unwrap_or(false)
}

#[tauri::command]
pub async fn get_hold_behavior(state: State<'_, AppState>) -> Result<bool, String> {
    let result =
        sqlx::query_as::<_, (String,)>("SELECT value FROM settings WHERE key = 'hold_behavior'")
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    Ok(result.map(|r| r.0 == "true").unwrap_or(false))
}

#[tauri::command]
pub async fn set_hold_behavior(
    state: State<'_, AppState>,
    hold_behavior: bool,
) -> Result<(), String> {
    let value = if hold_behavior { "true" } else { "false" };

    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('hold_behavior', ?)")
        .bind(value)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    HOLD_BEHAVIOR.store(hold_behavior, Ordering::Relaxed);

    Ok(())
}

#[cfg(test)]
#[path = "./tests/hotkeys_test.rs"]
mod hotkeys_test;
