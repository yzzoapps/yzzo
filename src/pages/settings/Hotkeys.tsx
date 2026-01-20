import React, { useState, useEffect } from "react";
import { useGlobalHotkey } from "@yzzo/hooks";
import { Button, Header, Input, Label, Radio } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import type { HotkeyBehavior } from "@yzzo/types";

const behaviorOptions: { value: HotkeyBehavior; labelKey: string }[] = [
  { value: "toggle", labelKey: "components.settings.hotkey.behaviorToggle" },
  { value: "hold", labelKey: "components.settings.hotkey.behaviorHold" },
];

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

    // check if a non-modifier key was released (the main key of the combo)
    const isModifierKey = ["Control", "Alt", "Shift", "Meta"].includes(
      event.key,
    );

    if (
      !isModifierKey &&
      currentCombination &&
      !currentCombination.endsWith("...")
    ) {
      // a main key was released, save the combination
      const finalCombo = currentCombination.replace("+...", "");

      setIsListening(false);
      updateHotkey(finalCombo).catch((error) => {
        alert("Failed to save hotkey: " + error);
      });
      setCurrentCombination("");
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
        <div className="w-full max-w-80">
          <Label
            label={t("components.settings.hotkey.title")}
            className="mb-1"
          />
          <div className="flex flex-row w-full">
            <Input
              readOnly
              value={
                isListening
                  ? currentCombination ||
                    t("components.settings.hotkey.listeningPlaceholder")
                  : hotkey
              }
              className="flex-1"
              attachedToButton
            />
            <Button
              variant={isListening ? "danger" : "default"}
              onClick={handleChangeHotkey}
              label={
                isListening
                  ? t("components.settings.hotkey.cancel")
                  : t("components.settings.hotkey.change")
              }
              attachedToInput
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t("components.settings.hotkey.helperText")}
          </p>
        </div>
        <Radio<HotkeyBehavior>
          label={t("components.settings.hotkey.behavior")}
          selectedValue={holdBehavior ? "hold" : "toggle"}
          options={behaviorOptions}
          onChange={(value) => handleHoldBehaviorToggle(value === "hold")}
        />
      </div>
    </div>
  );
};

export default Hotkeys;
