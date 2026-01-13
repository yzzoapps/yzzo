import React, { useState, useEffect } from "react";
import { useGlobalHotkey } from "@yzzo/hooks/useGlobalHotkey";
import { Button, Header, Input, Label } from "@yzzo/components";
import { useTranslation } from "react-i18next";

const isMacOS = navigator.platform.toLowerCase().includes("mac");

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
    setIsListening(!isListening);
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

      <div className="flex flex-col gap-4 p-4">
        <div>
          <div className="flex flex-row w-full">
            <Input
              label={t("components.settings.hotkey.title")}
              readOnly
              value={
                isListening
                  ? currentCombination ||
                    t("components.settings.hotkey.listeningPlaceholder")
                  : hotkey
              }
              helperText={t("components.settings.hotkey.helperText")}
              className="w-2/3"
              attachedToButton
            />
            <Button
              variant={isListening ? "danger" : "default"}
              onClick={handleChangeHotkey}
              className="w-1/3 self-end mb-6"
              label={isListening ? "Cancel" : "Change"}
              attachedToInput
            />
          </div>
        </div>
        {isMacOS && (
          <div className="mb-6">
            <Label label={t("components.settings.hotkey.behavior")} />
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
        )}
      </div>
    </div>
  );
};

export default Hotkeys;
