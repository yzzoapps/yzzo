use arboard::Clipboard;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, Wry};

pub fn start_clipboard_watcher(app_handle: AppHandle<Wry>) {
    let last_text = Arc::new(Mutex::new(String::new()));
    let last_text_clone = last_text.clone();
    let last_image_hash = Arc::new(Mutex::new(0u64));
    let last_image_hash_clone = last_image_hash.clone();

    thread::spawn(move || {
        let mut clipboard = Clipboard::new().unwrap();

        loop {
            // try to get image first to avoid reading clipboard multiple times
            let image_result = clipboard.get_image();
            let text_result = clipboard.get_text();

            // prioritize image data over HTML text representing images
            if let Ok(image) = image_result {
                // calculate hash of image data to detect duplicates
                let mut hasher = DefaultHasher::new();
                image.bytes.hash(&mut hasher);
                image.width.hash(&mut hasher);
                image.height.hash(&mut hasher);
                let current_hash = hasher.finish();

                let mut last_hash = last_image_hash_clone.lock().unwrap();

                // only process if this is a new/different image
                if *last_hash != current_hash {
                    *last_hash = current_hash;
                    let app_data_dir = app_handle
                        .path()
                        .app_data_dir()
                        .expect("failed to get app data directory");

                    let images_dir = app_data_dir.join("images");
                    std::fs::create_dir_all(&images_dir)
                        .expect("failed to create images directory");

                    // generate unique filename using hash for consistent naming
                    let filename = format!("{}.png", current_hash);
                    let file_path = images_dir.join(&filename);

                    // convert ImageData to image crate format and save
                    let img_buffer = image::RgbaImage::from_raw(
                        image.width as u32,
                        image.height as u32,
                        image.bytes.into_owned(),
                    );

                    if let Some(img) = img_buffer {
                        // only save if file doesn't already exist (deduplication at file level)
                        if !file_path.exists() {
                            let _ = img.save(&file_path);
                        }

                        let metadata = serde_json::json!({
                            "width": image.width,
                            "height": image.height,
                            "format": "png",
                            "hash": current_hash.to_string(),
                            "size": std::fs::metadata(&file_path).map(|m| m.len()).unwrap_or(0)
                        });

                        let _ = app_handle.emit(
                            "clipboard-changed",
                            serde_json::json!({
                                "type": "image",
                                "content": filename,
                                "file_path": file_path.to_str().unwrap(),
                                "metadata": metadata.to_string()
                            }),
                        );

                        // clear last text so we don't emit duplicate on next text
                        let mut last = last_text_clone.lock().unwrap();
                        *last = String::new();
                    }
                }
            } else if let Ok(text) = text_result {
                // no image data, process text
                // but skip HTML content that represents images
                let is_html_image = text.trim().starts_with("<meta")
                    || text.trim().starts_with("<!DOCTYPE")
                    || (text.contains("<img") && text.contains("src="));

                if !is_html_image {
                    // clear image hash when text is detected
                    let mut last_hash = last_image_hash_clone.lock().unwrap();
                    *last_hash = 0;
                    let mut last = last_text_clone.lock().unwrap();
                    if *last != text {
                        *last = text.clone();
                        let _ = app_handle.emit(
                            "clipboard-changed",
                            serde_json::json!({
                                "type": "text",
                                "content": text
                            }),
                        );
                    }
                }
            }
            thread::sleep(Duration::from_millis(200));
        }
    });
}
