import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { registerHotkey, getHotkey } from "@yzzo/api/tauriApi";

export function useGlobalHotkey() {
  const [hotkey, setHotkey] = useState<string>("");

  useEffect(() => {
    const fetchHotkey = async () => {
      try {
        const savedHotkey = await getHotkey();
        setHotkey(savedHotkey || "Alt+`");
      } catch (error) {
        console.error("Failed to load hotkey:", error);
        setHotkey("Alt+`");
      }
    };

    fetchHotkey();
  }, []);

  useEffect(() => {
    const unlisten = listen<string>("hotkey-changed", async (event) => {
      const newHotkey = event.payload;
      setHotkey(newHotkey);

      try {
        await registerHotkey(newHotkey);
      } catch (error) {
        console.error("Failed to save hotkey:", error);
      }
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return hotkey;
}
