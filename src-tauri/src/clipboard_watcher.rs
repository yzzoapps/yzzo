use arboard::Clipboard;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Wry};

pub fn start_clipboard_watcher(app_handle: AppHandle<Wry>) {
    let last_text = Arc::new(Mutex::new(String::new()));
    let last_text_clone = last_text.clone();

    thread::spawn(move || {
        let mut clipboard = Clipboard::new().unwrap();

        loop {
            if let Ok(text) = clipboard.get_text() {
                let mut last = last_text_clone.lock().unwrap();
                if *last != text {
                    *last = text.clone();
                    app_handle.emit("clipboard-changed", text).unwrap();
                }
            }
            thread::sleep(Duration::from_millis(200));
        }
    });
}
