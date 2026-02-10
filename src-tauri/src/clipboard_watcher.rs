use arboard::Clipboard;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager, Wry};

/// Check if we're running inside a Flatpak sandbox
fn is_flatpak() -> bool {
    Path::new("/.flatpak-info").exists()
}

/// Force X11 clipboard backend when running inside Flatpak.
/// Flatpak's Wayland portal filters out the wlr-data-control protocol
/// needed for clipboard monitoring, so we fall back to X11 via XWayland.
fn setup_flatpak_clipboard_env() {
    if is_flatpak() {
        // SAFETY: called once at startup before spawning clipboard thread
        unsafe {
            std::env::set_var("GDK_BACKEND", "x11");
        }
        eprintln!("[i] Flatpak detected: using X11 clipboard backend via XWayland");
    }
}

#[derive(Debug)]
pub enum ClipboardWatcherError {
    ClipboardInit(String),
    AppDataDir(String),
    CreateImagesDir(String),
}

impl std::fmt::Display for ClipboardWatcherError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ClipboardWatcherError::ClipboardInit(e) => {
                write!(f, "Failed to initialize clipboard: {}", e)
            }
            ClipboardWatcherError::AppDataDir(e) => {
                write!(f, "Failed to get app data directory: {}", e)
            }
            ClipboardWatcherError::CreateImagesDir(e) => {
                write!(f, "Failed to create images directory: {}", e)
            }
        }
    }
}

pub fn start_clipboard_watcher(app_handle: AppHandle<Wry>) -> Result<(), ClipboardWatcherError> {
    setup_flatpak_clipboard_env();

    // Validate we can get the app data directory before starting the thread
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| ClipboardWatcherError::AppDataDir(e.to_string()))?;

    let images_dir = app_data_dir.join("images");
    std::fs::create_dir_all(&images_dir).map_err(|e| {
        ClipboardWatcherError::CreateImagesDir(format!("{}: {}", images_dir.display(), e))
    })?;

    // Verify we can actually write to the images directory
    let test_file = images_dir.join(".write_test");
    std::fs::write(&test_file, b"").map_err(|e| {
        ClipboardWatcherError::CreateImagesDir(format!(
            "Cannot write to {}: {}",
            images_dir.display(),
            e
        ))
    })?;
    let _ = std::fs::remove_file(&test_file);

    let last_text = Arc::new(Mutex::new(String::new()));
    let last_text_clone = last_text.clone();
    let last_image_hash = Arc::new(Mutex::new(0u64));
    let last_image_hash_clone = last_image_hash.clone();

    thread::spawn(move || {
        let mut clipboard = match Clipboard::new() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[X] Failed to initialize clipboard: {}", e);
                return;
            }
        };

        // Initialize with current clipboard content to avoid treating
        // pre-existing content as a new copy on first iteration
        if let Ok(current_text) = clipboard.get_text() {
            let mut last = last_text_clone.lock().unwrap();
            *last = current_text;
        }
        if let Ok(current_image) = clipboard.get_image() {
            let mut hasher = DefaultHasher::new();
            current_image.bytes.hash(&mut hasher);
            current_image.width.hash(&mut hasher);
            current_image.height.hash(&mut hasher);
            let mut last_hash = last_image_hash_clone.lock().unwrap();
            *last_hash = hasher.finish();
        }

        // Wait for frontend to mount and set up event listeners
        thread::sleep(Duration::from_millis(500));

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
                    let app_data_dir = match app_handle.path().app_data_dir() {
                        Ok(dir) => dir,
                        Err(e) => {
                            eprintln!("[X] Failed to get app data directory: {}", e);
                            continue;
                        }
                    };

                    let images_dir = app_data_dir.join("images");
                    if let Err(e) = std::fs::create_dir_all(&images_dir) {
                        eprintln!("[X] Failed to create images directory: {}", e);
                        continue;
                    }

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
                // check if it's a file URL pointing to an image
                if text.starts_with("file://") {
                    let file_path = text.trim_start_matches("file://");
                    // URL decode the path (spaces are %20, etc.)
                    let decoded_path = urlencoding::decode(file_path).unwrap_or_default();
                    let path = std::path::Path::new(decoded_path.as_ref());

                    // check if it's an image file
                    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                        let ext_lower = ext.to_lowercase();
                        if matches!(
                            ext_lower.as_str(),
                            "png" | "jpg" | "jpeg" | "gif" | "bmp" | "webp" | "tiff" | "tif"
                        ) {
                            if path.exists() {
                                // load the image and process it
                                if let Ok(img) = image::open(path) {
                                    let rgba = img.to_rgba8();
                                    let (width, height) = rgba.dimensions();

                                    // calculate hash for deduplication
                                    let mut hasher = DefaultHasher::new();
                                    rgba.as_raw().hash(&mut hasher);
                                    width.hash(&mut hasher);
                                    height.hash(&mut hasher);
                                    let current_hash = hasher.finish();

                                    let mut last_hash = last_image_hash_clone.lock().unwrap();

                                    if *last_hash != current_hash {
                                        *last_hash = current_hash;

                                        let app_data_dir = match app_handle.path().app_data_dir() {
                                            Ok(dir) => dir,
                                            Err(e) => {
                                                eprintln!(
                                                    "[X] Failed to get app data directory: {}",
                                                    e
                                                );
                                                continue;
                                            }
                                        };

                                        let images_dir = app_data_dir.join("images");
                                        if let Err(e) = std::fs::create_dir_all(&images_dir) {
                                            eprintln!(
                                                "[X] Failed to create images directory: {}",
                                                e
                                            );
                                            continue;
                                        }

                                        let filename = format!("{}.png", current_hash);
                                        let dest_path = images_dir.join(&filename);

                                        if !dest_path.exists() {
                                            let _ = rgba.save(&dest_path);
                                        }

                                        let metadata = serde_json::json!({
                                            "width": width,
                                            "height": height,
                                            "format": "png",
                                            "hash": current_hash.to_string(),
                                            "size": std::fs::metadata(&dest_path).map(|m| m.len()).unwrap_or(0)
                                        });

                                        let _ = app_handle.emit(
                                            "clipboard-changed",
                                            serde_json::json!({
                                                "type": "image",
                                                "content": filename,
                                                "file_path": dest_path.to_str().unwrap(),
                                                "metadata": metadata.to_string()
                                            }),
                                        );

                                        let mut last = last_text_clone.lock().unwrap();
                                        *last = String::new();
                                    }
                                }
                                continue;
                            }
                        }
                    }
                }

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

    Ok(())
}
