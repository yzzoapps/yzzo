import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface HotkeySettings {
  hotkey: string;
  holdBehavior: boolean;
}

export function useGlobalHotkey() {
  const [hotkey, setHotkey] = useState<string>("");
  const [holdBehavior, setHoldBehavior] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [savedHotkey, savedHoldBehavior] = await Promise.all([
          invoke<string>("get_hotkey"),
          invoke<boolean>("get_hold_behavior"),
        ]);
        setHotkey(savedHotkey || "Alt+`");
        setHoldBehavior(savedHoldBehavior);
      } catch (error) {
        console.error("Failed to load hotkey settings:", error);
        setHotkey("Alt+`");
        setHoldBehavior(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateHotkey = async (newHotkey: string) => {
    try {
      await invoke("set_hotkey", { hotkey: newHotkey });
      setHotkey(newHotkey);
    } catch (error) {
      console.error("Failed to save hotkey:", error);
      throw error;
    }
  };

  const updateHoldBehavior = async (enabled: boolean) => {
    try {
      await invoke("set_hold_behavior", { holdBehavior: enabled });
      setHoldBehavior(enabled);
    } catch (error) {
      console.error("Failed to update hold behavior:", error);
      throw error;
    }
  };

  return {
    hotkey,
    holdBehavior,
    isLoading,
    updateHotkey,
    updateHoldBehavior,
  };
}
