import React, { useState, useEffect } from "react";
import { useGlobalHotkey } from "@yzzo/hooks/useGlobalHotkey";
import { registerHotkey } from "@yzzo/api/tauriApi";

const HotkeysPage: React.FC = () => {
  const currentHotkey = useGlobalHotkey(); // Get the current hotkey from the hook
  const [isListening, setIsListening] = useState(false);
  const [newHotkey, setNewHotkey] = useState<string>("");

  // Function to handle the key combination listening
  const handleKeyDown = (event: KeyboardEvent) => {
    if (isListening) {
      let hotkeyCombination = "";

      // Check the modifiers (Shift, Ctrl, Alt, Command) and the key pressed
      if (event.ctrlKey) hotkeyCombination += "Ctrl+";
      if (event.altKey) hotkeyCombination += "Alt+";
      if (event.shiftKey) hotkeyCombination += "Shift+";
      if (event.metaKey) hotkeyCombination += "Cmd+"; // for macOS Cmd key

      hotkeyCombination += event.key;

      setNewHotkey(hotkeyCombination); // Update state with the new hotkey
      setIsListening(false); // Stop listening after a combination is detected

      // Save the new hotkey to the database
      registerHotkey(hotkeyCombination)
        .then(() => {
          console.log("Hotkey saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving hotkey:", error);
        });
    }
  };

  // Add the event listener for keydown when listening mode is active
  useEffect(() => {
    if (isListening) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Cleanup event listener
    };
  }, [isListening]);

  // Start listening for key combination
  const handleChangeHotkey = () => {
    setIsListening(true);
    setNewHotkey("Listening for hotkey..."); // Display a message while waiting for a combination
  };

  return (
    <div>
      <h3>Current Hotkey: {currentHotkey}</h3>
      <button onClick={handleChangeHotkey}>
        {isListening ? "Press a key combination" : "Change Hotkey"}
      </button>
      <p>
        {newHotkey && newHotkey !== currentHotkey
          ? `New Hotkey: ${newHotkey}`
          : ""}
      </p>
    </div>
  );
};

export default HotkeysPage;
