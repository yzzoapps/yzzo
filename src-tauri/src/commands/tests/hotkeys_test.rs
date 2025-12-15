use super::parse_hotkey;
use tauri_plugin_global_shortcut::{Code, Modifiers};

#[test]
fn test_parse_simple_hotkey() {
    let result = parse_hotkey("Ctrl+A").unwrap();
    assert!(result.mods.contains(Modifiers::CONTROL));
    assert_eq!(result.key, Code::KeyA);
}

#[test]
fn test_parse_multiple_modifiers() {
    let result = parse_hotkey("Cmd+Shift+B").unwrap();
    assert!(result.mods.contains(Modifiers::SUPER));
    assert!(result.mods.contains(Modifiers::SHIFT));
    assert_eq!(result.key, Code::KeyB);
}

#[test]
fn test_parse_all_modifiers() {
    let result = parse_hotkey("Ctrl+Alt+Shift+Cmd+Z").unwrap();
    assert!(result.mods.contains(Modifiers::CONTROL));
    assert!(result.mods.contains(Modifiers::ALT));
    assert!(result.mods.contains(Modifiers::SHIFT));
    assert!(result.mods.contains(Modifiers::SUPER));
    assert_eq!(result.key, Code::KeyZ);
}

#[test]
fn test_parse_backtick() {
    let result = parse_hotkey("Cmd+`").unwrap();
    assert_eq!(result.key, Code::Backquote);
}

#[test]
fn test_parse_digits() {
    assert_eq!(parse_hotkey("Ctrl+0").unwrap().key, Code::Digit0);
    assert_eq!(parse_hotkey("Ctrl+5").unwrap().key, Code::Digit5);
    assert_eq!(parse_hotkey("Ctrl+9").unwrap().key, Code::Digit9);
}

#[test]
fn test_parse_all_letters() {
    assert_eq!(parse_hotkey("Ctrl+A").unwrap().key, Code::KeyA);
    assert_eq!(parse_hotkey("Ctrl+M").unwrap().key, Code::KeyM);
    assert_eq!(parse_hotkey("Ctrl+Z").unwrap().key, Code::KeyZ);
}

#[test]
fn test_parse_case_insensitive_modifiers() {
    let result1 = parse_hotkey("ctrl+A").unwrap();
    let result2 = parse_hotkey("CTRL+A").unwrap();
    let result3 = parse_hotkey("Ctrl+A").unwrap();

    assert_eq!(result1.mods, result2.mods);
    assert_eq!(result2.mods, result3.mods);
}

#[test]
fn test_parse_super_alias() {
    let result1 = parse_hotkey("Cmd+A").unwrap();
    let result2 = parse_hotkey("Super+A").unwrap();

    assert_eq!(result1.mods, result2.mods);
}

#[test]
fn test_parse_invalid_key() {
    let result = parse_hotkey("Ctrl+InvalidKey");
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unsupported key"));
}

#[test]
fn test_parse_empty_string() {
    let result = parse_hotkey("");
    assert!(result.is_err());
}

#[test]
fn test_parse_special_characters() {
    let result = parse_hotkey("Ctrl+@");
    assert!(result.is_err());
}

#[test]
fn test_parse_whitespace_handling() {
    let result = parse_hotkey(" Ctrl + A ").unwrap();
    assert!(result.mods.contains(Modifiers::CONTROL));
    assert_eq!(result.key, Code::KeyA);
}
