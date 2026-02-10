use crate::state::AppState;
use tauri::{Manager, State};

use crate::models::Item;

#[tauri::command]
pub async fn add_item(
    state: State<'_, AppState>,
    content: String,
    item_type: Option<String>,
    file_path: Option<String>,
    metadata: Option<String>,
) -> Result<(), String> {
    let item_type = item_type.unwrap_or_else(|| "text".to_string());

    // check if an item with the same content already exists
    let existing: Option<Item> = if item_type == "image" {
        // for images, check by hash in metadata (best deduplication)
        if let Some(ref meta) = metadata {
            if let Ok(meta_json) = serde_json::from_str::<serde_json::Value>(meta) {
                if let Some(hash) = meta_json.get("hash").and_then(|h| h.as_str()) {
                    // check all image items for matching hash in metadata
                    let all_images: Vec<Item> =
                        sqlx::query_as::<_, Item>("SELECT * FROM items WHERE item_type = 'image'")
                            .fetch_all(&state.db)
                            .await
                            .map_err(|e| e.to_string())?;

                    all_images.into_iter().find(|item| {
                        if let Some(ref item_meta) = item.metadata {
                            if let Ok(item_meta_json) =
                                serde_json::from_str::<serde_json::Value>(item_meta)
                            {
                                if let Some(item_hash) =
                                    item_meta_json.get("hash").and_then(|h| h.as_str())
                                {
                                    return item_hash == hash;
                                }
                            }
                        }
                        false
                    })
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    } else {
        sqlx::query_as::<_, Item>("SELECT * FROM items WHERE content = ? AND item_type = 'text'")
            .bind(&content)
            .fetch_optional(&state.db)
            .await
            .map_err(|e| e.to_string())?
    };

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

    // auto-cleanup: if we're at the limit, delete the oldest item
    const MAX_ITEMS: i64 = 100;
    if count.0 >= MAX_ITEMS {
        let oldest: Option<Item> =
            sqlx::query_as::<_, Item>("SELECT * FROM items ORDER BY bumped_at ASC LIMIT 1")
                .fetch_optional(&state.db)
                .await
                .map_err(|e| e.to_string())?;

        if let Some(old_item) = oldest {
            if old_item.item_type == "image" {
                if let Some(ref path) = old_item.file_path {
                    let _ = std::fs::remove_file(path);
                }
            }

            sqlx::query("DELETE FROM items WHERE id = ?")
                .bind(old_item.id)
                .execute(&state.db)
                .await
                .map_err(|e| format!("Failed to delete oldest item: {}", e))?;
        }
    }

    sqlx::query(
        "INSERT INTO items (content, item_type, file_path, metadata, created_at, updated_at, bumped_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
    )
    .bind(content)
    .bind(item_type)
    .bind(file_path)
    .bind(metadata)
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

#[tauri::command]
pub async fn delete_item(id: i64, state: State<'_, AppState>) -> Result<(), String> {
    // get the item first to check if it has a file_path
    let item: Option<Item> = sqlx::query_as::<_, Item>("SELECT * FROM items WHERE id = ?")
        .bind(id)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    if let Some(item) = item {
        // if it's an image, delete
        if item.item_type == "image" {
            if let Some(file_path) = item.file_path {
                let _ = std::fs::remove_file(file_path);
            }
        }

        sqlx::query("DELETE FROM items WHERE id = ?")
            .bind(id)
            .execute(&state.db)
            .await
            .map_err(|e| format!("Failed to delete item: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub async fn get_image_base64(file_path: String) -> Result<String, String> {
    let bytes =
        std::fs::read(&file_path).map_err(|e| format!("Failed to read image file: {}", e))?;

    let base64 = base64::Engine::encode(&base64::engine::general_purpose::STANDARD, &bytes);
    Ok(format!("data:image/png;base64,{}", base64))
}

#[tauri::command]
pub async fn write_image_to_clipboard(file_path: String) -> Result<(), String> {
    use arboard::Clipboard;
    use image::GenericImageView;

    let img = image::open(&file_path).map_err(|e| format!("Failed to open image: {}", e))?;

    let (width, height) = img.dimensions();
    let rgba = img.to_rgba8();

    let img_data = arboard::ImageData {
        width: width as usize,
        height: height as usize,
        bytes: rgba.into_raw().into(),
    };

    // Flatpak clipboard env is already set by clipboard_watcher::setup_flatpak_clipboard_env
    let mut clipboard =
        Clipboard::new().map_err(|e| format!("Failed to access clipboard: {}", e))?;

    clipboard
        .set_image(img_data)
        .map_err(|e| format!("Failed to set clipboard image: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn clear_all_items(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let images: Vec<Item> =
        sqlx::query_as::<_, Item>("SELECT * FROM items WHERE item_type = 'image'")
            .fetch_all(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    for item in images {
        if let Some(file_path) = item.file_path {
            let _ = std::fs::remove_file(file_path);
        }
    }

    if let Ok(app_data_dir) = app.path().app_data_dir() {
        let images_dir = app_data_dir.join("images");
        if images_dir.exists() {
            let _ = std::fs::remove_dir_all(&images_dir);
            let _ = std::fs::create_dir_all(&images_dir);
        }
    }

    sqlx::query("DELETE FROM items")
        .execute(&state.db)
        .await
        .map_err(|e| format!("Failed to clear items: {}", e))?;

    Ok(())
}

#[cfg(test)]
#[path = "./tests/items_test.rs"]
mod items_test;
