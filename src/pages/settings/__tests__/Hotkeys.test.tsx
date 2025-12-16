import { hasTranslationKey } from "@yzzo/test/utils/i18n-mock";
import { expect } from "bun:test";
import { test } from "bun:test";
import { describe } from "bun:test";

describe("Hotkeys page (Translation keys)", () => {
  describe("common", () => {
    test("all Hotkeys page keys should exist in English", () => {
      const keysToCheck = ["common.settings.hotkeys"];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "en")).toBe(true);
      });
    });

    test("all Hotkeys page keys should exist in Portuguese", () => {
      const keysToCheck = ["common.settings.hotkeys"];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "pt")).toBe(true);
      });
    });
  });

  describe("components", () => {
    test("all Hotkeys page keys should exist in English", () => {
      const keysToCheck = [
        "components.settings.hotkey.title",
        "components.settings.hotkey.listeningPlaceholder",
        "components.settings.hotkey.helperText",
        "components.settings.hotkey.change",
        "components.settings.hotkey.behavior",
      ];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "en")).toBe(true);
      });
    });

    test("all Hotkeys page keys should exist in Portuguese", () => {
      const keysToCheck = [
        "components.settings.hotkey.title",
        "components.settings.hotkey.listeningPlaceholder",
        "components.settings.hotkey.helperText",
        "components.settings.hotkey.change",
        "components.settings.hotkey.behavior",
      ];

      keysToCheck.forEach((key) => {
        expect(hasTranslationKey(key, "pt")).toBe(true);
      });
    });
  });
});
