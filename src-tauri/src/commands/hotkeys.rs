use crate::state::AppState;
use tauri::State;

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
pub async fn set_hotkey(state: State<'_, AppState>, hotkey: String) -> Result<(), String> {
    let result = sqlx::query("INSERT OR REPLACE INTO settings (key, value) VALUES ('hotkey', ?)")
        .bind(hotkey)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if result.rows_affected() > 0 {
        Ok(())
    } else {
        Err("Failed to update hotkey".to_string())
    }
}
