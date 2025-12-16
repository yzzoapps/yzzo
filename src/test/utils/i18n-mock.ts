import { mock } from "bun:test";

import commonEn from "@yzzo/i18n/locales/common/en.json";
import commonPt from "@yzzo/i18n//locales/common/pt.json";
import componentsEn from "@yzzo/i18n/locales/components/en.json";
import componentsPt from "@yzzo/i18n/locales/components/pt.json";

type Locale = "en" | "pt";
type Namespace = "common" | "components";

interface Translations {
  [locale: string]: {
    [namespace: string]: Record<string, any>;
  };
}

const translations: Translations = {
  en: {
    common: commonEn,
    components: componentsEn,
  },
  pt: {
    common: commonPt,
    components: componentsPt,
  },
};

function getNestedValue(obj: any, path: string): any {
  const keys = path.split(".");
  let value: any = obj;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return undefined;
    }
  }

  return value;
}

/**
 * Creates a mock translation function that supports namespaces
 * Handles keys like:
 * - "common.settings.title" → uses common namespace
 * - "components.settings.item" → uses components namespace
 */
export function createMockTranslation(locale: Locale = "en") {
  const mockT = (key: string): string => {
    // Split key into namespace and path
    // e.g., "common.settings.title" → ["common", "settings.title"]
    const parts = key.split(".");
    const namespace = parts[0] as Namespace;
    const translationPath = parts.slice(1).join(".");

    // Check if namespace exists
    if (!translations[locale][namespace]) {
      console.warn(`Namespace not found: ${namespace}`);
      return key;
    }

    // Get the translation value
    const value = getNestedValue(
      translations[locale][namespace],
      translationPath,
    );

    if (value === undefined) {
      console.warn(`Translation key not found: ${key} (locale: ${locale})`);
      return key;
    }

    return value;
  };

  return mockT;
}

/**
 * Setup i18n mock with language switching support
 */
export function setupI18nMock(initialLocale: Locale = "en") {
  let currentLocale = initialLocale;
  let mockT = createMockTranslation(currentLocale);

  mock.module("react-i18next", () => ({
    useTranslation: () => ({
      t: mockT,
      i18n: {
        changeLanguage: async (lang: string) => {
          if (lang !== "en" && lang !== "pt") {
            console.warn(`Unsupported language: ${lang}, falling back to en`);
            lang = "en";
          }

          currentLocale = lang as Locale;
          mockT = createMockTranslation(currentLocale);

          return lang;
        },
        language: currentLocale,
        languages: ["en", "pt"],
      },
    }),
    Trans: ({ children }: any) => children,
    useTranslationContext: () => ({
      i18n: {
        language: currentLocale,
        changeLanguage: async (lang: string) => {
          currentLocale = lang as Locale;
          mockT = createMockTranslation(currentLocale);
          return lang;
        },
      },
    }),
  }));

  return {
    changeLanguage: async (lang: Locale) => {
      currentLocale = lang;
      mockT = createMockTranslation(currentLocale);
    },
  };
}

/**
 * Get all translation keys from a namespace
 * Useful for validation tests
 */
export function getAllTranslationKeys(
  locale: Locale = "en",
  namespace: Namespace,
): string[] {
  const namespaceTranslations = translations[locale][namespace];

  function extractKeys(obj: any, prefix = ""): string[] {
    return Object.keys(obj).reduce((keys: string[], key) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof obj[key] === "object" && obj[key] !== null) {
        return [...keys, ...extractKeys(obj[key], fullKey)];
      }

      return [...keys, fullKey];
    }, []);
  }

  return extractKeys(namespaceTranslations);
}

/**
 * Validate that a translation key exists
 */
export function hasTranslationKey(key: string, locale: Locale = "en"): boolean {
  const parts = key.split(".");
  const namespace = parts[0] as Namespace;
  const translationPath = parts.slice(1).join(".");

  if (!translations[locale][namespace]) {
    return false;
  }

  const value = getNestedValue(
    translations[locale][namespace],
    translationPath,
  );
  return value !== undefined;
}
