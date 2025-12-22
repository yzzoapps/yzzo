use crate::state::AppState;
use tauri::State;

use crate::models::Item;

#[tauri::command]
pub async fn add_item(state: State<'_, AppState>, content: String) -> Result<(), String> {
    // check if an item with the same content already exists
    let existing: Option<Item> = sqlx::query_as::<_, Item>("SELECT * FROM items WHERE content = ?")
        .bind(&content)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    // if it exists, just bump it to the top
    if let Some(item) = existing {
        sqlx::query(
            "UPDATE items
             SET bumped_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?",
        )
        .bind(item.id)
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to bump existing item: {}", e))?;
        return Ok(());
    }

    // otherwise, create a new item
    let count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM items")
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if count.0 >= 100 {
        return Err("Maximum number of items (100) reached".into());
    }

    sqlx::query(
        "INSERT INTO items (content, created_at, updated_at, bumped_at)
         VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .bind(content)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_items(state: State<'_, AppState>) -> Result<Vec<Item>, String> {
    let items: Vec<Item> = sqlx::query_as::<_, Item>("SELECT * FROM items ORDER BY bumped_at DESC")
        .fetch_all(&state.db)
        .await
        .map_err(|e| format!("Failed to get items {}", e))?;

    Ok(items)
}

#[tauri::command]
pub async fn bump_item(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    sqlx::query(
        "UPDATE items
         SET bumped_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?",
    )
    .bind(id)
    .execute(&state.db)
    .await
    .map_err(|e| format!("Failed to bump item: {}", e))?;

    Ok(())
}
