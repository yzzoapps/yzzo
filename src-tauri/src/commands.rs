use crate::state::AppState;
use futures::TryStreamExt;
use tauri::State;

use crate::models::Item;

#[tauri::command]
pub async fn add_item(state: State<'_, AppState>, content: String) -> Result<(), String> {
    sqlx::query("INSERT INTO items (content) VALUES (?)")
        .bind(content)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_items(state: State<'_, AppState>) -> Result<Vec<Item>, String> {
    let items: Vec<Item> = sqlx::query_as::<_, Item>("SELECT * FROM items")
        .fetch(&state.db)
        .try_collect()
        .await
        .map_err(|e| format!("Failed to get items {}", e))?;

    Ok(items)
}
