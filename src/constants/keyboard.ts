export const MODIFIER_KEYS = ["Control", "Alt", "Shift", "Meta"] as const;

export const KEY_CODE_MAP: Record<string, string> = {
  // Special characters
  Backquote: "Backquote",
  Minus: "Minus",
  Equal: "Equal",
  BracketLeft: "BracketLeft",
  BracketRight: "BracketRight",
  Backslash: "Backslash",
  Semicolon: "Semicolon",
  Quote: "Quote",
  Comma: "Comma",
  Period: "Period",
  Slash: "Slash",

  // Control keys
  Space: "Space",
  Enter: "Enter",
  Tab: "Tab",
  Escape: "Escape",
  Backspace: "Backspace",
  Delete: "Delete",
  Insert: "Insert",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",

  // Arrow keys
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
};

export function parseKeyCode(code: string): string {
  // Check direct mapping first
  if (KEY_CODE_MAP[code]) {
    return KEY_CODE_MAP[code];
  }

  // Handle letter keys (KeyA -> A)
  if (code.startsWith("Key")) {
    return code.replace("Key", "");
  }

  // Handle digit keys (Digit0 -> 0)
  if (code.startsWith("Digit")) {
    return code.replace("Digit", "");
  }

  // Handle function keys (F1-F12)
  if (/^F([1-9]|1[0-2])$/.test(code)) {
    return code;
  }

  // Handle numpad keys
  if (code.startsWith("Numpad")) {
    return code;
  }

  return code;
}
