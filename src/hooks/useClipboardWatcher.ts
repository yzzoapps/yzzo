import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { addItem } from "@yzzo/api/tauriApi";

interface ClipboardEvent {
  type: string;
  content: string;
  file_path?: string;
  metadata?: string;
}

export function useClipboardEventWatcher() {
  const [clipboardText, setClipboardText] = useState("");

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

  return clipboardText;
}
