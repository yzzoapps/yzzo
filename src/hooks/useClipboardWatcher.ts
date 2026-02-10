import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { addItem, checkIsFlatpak } from "@yzzo/api/tauriApi";

interface ClipboardEvent {
  type: string;
  content: string;
  file_path?: string;
  metadata?: string;
}

/**
 * JS-based clipboard polling fallback for Flatpak.
 * Inside the Flatpak sandbox, arboard can't access the Wayland clipboard
 * (wlr-data-control protocol is blocked by the portal). Instead, we poll
 * using the Web Clipboard API which goes through WebKitGTK's portal integration.
 */
function useFlatpakClipboardPoller(
  enabled: boolean,
  onTextChange: (text: string) => void,
) {
  const lastTextRef = useRef("");

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text !== lastTextRef.current) {
          lastTextRef.current = text;
          onTextChange(text);
        }
      } catch {
        // Clipboard read can fail if window not focused — that's OK
      }
    }, 500);

    return () => clearInterval(interval);
  }, [enabled, onTextChange]);
}

export function useClipboardEventWatcher() {
  const [clipboardText, setClipboardText] = useState("");
  const [isFlatpak, setIsFlatpak] = useState(false);

  useEffect(() => {
    checkIsFlatpak().then(setIsFlatpak);
  }, []);

  // Native Rust watcher (works outside Flatpak)
  useEffect(() => {
    const unlisten = listen<ClipboardEvent>(
      "clipboard-changed",
      async (event) => {
        const data = event.payload;

        if (data.type === "text") {
          setClipboardText(data.content);
          await addItem(data.content, "text");
        } else if (data.type === "image") {
          setClipboardText(`image:${data.content}`); // Trigger re-fetch
          await addItem(data.content, "image", data.file_path, data.metadata);
        }
      },
    );

    return () => {
      unlisten.then((f) => f()); // cleanup listener
    };
  }, []);

  // JS fallback poller (only active in Flatpak)
  const handleFlatpakText = useRef(async (text: string) => {
    setClipboardText(text);
    await addItem(text, "text");
  });

  useFlatpakClipboardPoller(isFlatpak, handleFlatpakText.current);

  return clipboardText;
}
