import { getAllTranslationKeys } from "@yzzo/test/utils/i18n-mock";
import { expect } from "bun:test";
import { test } from "bun:test";
import { describe } from "bun:test";

describe("i18n - general keys validation", () => {
  test("common namespace keys should exist in all languages", () => {
    const enKeys = getAllTranslationKeys("en", "common");
    const ptKeys = getAllTranslationKeys("pt", "common");

    expect(enKeys.sort()).toEqual(ptKeys.sort());
  });

  test("component namespace keys should exist in all languages", () => {
    const enKeys = getAllTranslationKeys("en", "components");
    const ptKeys = getAllTranslationKeys("pt", "components");

    expect(enKeys.sort()).toEqual(ptKeys.sort());
  });
});
