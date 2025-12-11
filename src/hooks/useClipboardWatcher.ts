import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { addItem } from "@yzzo/api/tauriApi";

export function useClipboardEventWatcher() {
  const [clipboardText, setClipboardText] = useState("");

  useEffect(() => {
    const unlisten = listen<string>("clipboard-changed", async (event) => {
      setClipboardText(event.payload);
      await addItem(event.payload); // automatically add to DB
    });

    return () => {
      unlisten.then((f) => f()); // cleanup listener
    };
  }, []);

  return clipboardText;
}
