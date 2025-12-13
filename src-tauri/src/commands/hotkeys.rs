use crate::HOLD_BEHAVIOR;
use crate::state::AppState;
use std::sync::atomic::Ordering;
use tauri::{Manager, State};

use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

/// Parse a hotkey string (like "Cmd+`") into a `Shortcut` instance.
pub fn parse_hotkey(hotkey: &str) -> Result<Shortcut, String> {
    let mut modifiers = Modifiers::empty();
    let mut key = Code::KeyA;

    let parts: Vec<&str> = hotkey.split('+').collect();

    for part in parts {
        match part.trim().to_lowercase().as_str() {
            "cmd" | "super" => modifiers.insert(Modifiers::SUPER),
            "ctrl" => modifiers.insert(Modifiers::CONTROL),
            "alt" => modifiers.insert(Modifiers::ALT),
            "`" => key = Code::Backquote,
            "a" => key = Code::KeyA,
            "b" => key = Code::KeyB,
            _ => return Err(format!("Unknown key or modifier: {}", part)),
        }
    }

    Ok(Shortcut::new(Some(modifiers), key))
}

#[tauri::command]
pub async fn get_hotkey(state: State<'_, AppState>) -> Result<String, String> {
    let result: Option<(String,)> =
        sqlx::query_as("SELECT value FROM settings WHERE key = 'global_shortcut' LIMIT 1")
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    match result {
        Some((value,)) => Ok(value),
        None => {
            #[cfg(target_os = "macos")]
            return Ok("Cmd+`".to_string());

            #[cfg(not(target_os = "macos"))]
            return Ok("Alt+`".to_string());
        }
    }
}

#[tauri::command]
pub async fn set_hotkey(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    hotkey: String,
) -> Result<(), String> {
    // Get the old hotkey to unregister it
    let old_hotkey = get_hotkey(state.clone()).await.unwrap_or_else(|_| {
        #[cfg(target_os = "macos")]
        return "Cmd+`".to_string();
        #[cfg(not(target_os = "macos"))]
        return "Alt+`".to_string();
    });

    // Parse and unregister old shortcut
    if let Ok(old_shortcut) = crate::parse_hotkey(&old_hotkey) {
        let _ = app.global_shortcut().unregister(old_shortcut);
    }

    // Save new hotkey to database
    let result = sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('hotkey', ?)")
        .bind(&hotkey)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if result.rows_affected() == 0 {
        return Err("Failed to update hotkey".to_string());
    }

    // Parse and register new shortcut
    let new_shortcut =
        crate::parse_hotkey(&hotkey).map_err(|e| format!("Invalid hotkey: {}", e))?;

    let app_clone = app.clone();
    app.global_shortcut()
        .on_shortcut(new_shortcut, move |_app, _shortcut, _event| {
            println!("Shortcut pressed!");
            if let Some(window) = app_clone.get_webview_window("main") {
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
        })
        .map_err(|e| format!("Failed to register shortcut: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn get_hold_behavior(state: State<'_, AppState>) -> Result<bool, String> {
    // Read from database (for when frontend needs current setting)
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

    // Save to database
    sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('hold_behavior', ?)")
        .bind(value)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    // Update the atomic cache immediately
    HOLD_BEHAVIOR.store(hold_behavior, Ordering::Relaxed);

    Ok(())
}
