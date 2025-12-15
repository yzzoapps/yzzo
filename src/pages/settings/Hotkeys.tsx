import React, { useState, useEffect } from "react";
import { useGlobalHotkey } from "@yzzo/hooks/useGlobalHotkey";
import { Header } from "@yzzo/components";
import { useTranslation } from "react-i18next";

const Hotkeys: React.FC = () => {
  const { hotkey, holdBehavior, isLoading, updateHotkey, updateHoldBehavior } =
    useGlobalHotkey();
  const [isListening, setIsListening] = useState(false);
  const [currentCombination, setCurrentCombination] = useState<string>("");
  const { t } = useTranslation();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isListening) return;
    event.preventDefault();

    const modifiers: string[] = [];
    if (event.metaKey) modifiers.push("Cmd");
    if (event.ctrlKey) modifiers.push("Ctrl");
    if (event.altKey) modifiers.push("Alt");
    if (event.shiftKey) modifiers.push("Shift");

    let mainKey = "";
    if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) {
      let key = event.code;
      if (key === "Backquote") mainKey = "`";
      else if (key.startsWith("Key")) mainKey = key.replace("Key", "");
      else if (key.startsWith("Digit")) mainKey = key.replace("Digit", "");
    }

    const combo = mainKey
      ? [...modifiers, mainKey].join("+")
      : modifiers.join("+") + "+...";

    setCurrentCombination(combo);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!isListening) return;
    event.preventDefault();

    // save when all keys are released AND we have at least one key recorded
    if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey) {
      if (currentCombination) {
        const finalCombo = currentCombination.replace("+...", "");

        setIsListening(false);
        updateHotkey(finalCombo).catch((error) => {
          alert("Failed to save hotkey: " + error);
        });
        setCurrentCombination("");
      }
    }
  };

  useEffect(() => {
    if (isListening) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isListening, currentCombination]);

  const handleChangeHotkey = () => {
    setIsListening(true);
  };

  const handleHoldBehaviorToggle = async (enabled: boolean) => {
    try {
      await updateHoldBehavior(enabled);
    } catch (error) {
      alert("Failed to update hold behavior: " + error);
    }
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div>
      <Header
        title={t("common.settings.hotkeys")}
        previousRoute={"/settings"}
      />

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Global Hotkey</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={isListening ? currentCombination || "Press keys..." : hotkey}
            readOnly
            className="flex-1 px-3 py-2 border rounded bg-gray-50"
            placeholder="No hotkey set"
          />
          <button
            onClick={handleChangeHotkey}
            disabled={isListening}
            className={`px-4 py-2 rounded font-medium ${
              isListening
                ? "bg-red-500 text-white cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isListening ? "Listening..." : "Change"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Click "Change" and press your desired key combination
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={holdBehavior}
            onChange={(e) => handleHoldBehaviorToggle(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <div>
            <span className="font-medium">Hold to show</span>
            <p className="text-xs text-gray-500">
              {holdBehavior
                ? "Window shows while holding hotkey, hides on release"
                : "Press hotkey to toggle window visibility"}
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default Hotkeys;
