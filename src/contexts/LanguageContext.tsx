import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Language, SupportedLanguage } from "@yzzo/types";
import { STORAGE_KEYS } from "@yzzo/constants";

interface LanguageContextType {
  language: Language;
  effectiveLanguage: SupportedLanguage;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);
const DEFAULT_LANGUAGE: SupportedLanguage = "en";
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "pt"];

function getSystemLanguage(): SupportedLanguage {
  const browserLang = navigator.language.split("-")[0] as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(browserLang)
    ? browserLang
    : DEFAULT_LANGUAGE;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (
      stored === "system" ||
      SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)
    ) {
      return stored as Language;
    }
    return "system";
  });

  const effectiveLanguage =
    language === "system" ? getSystemLanguage() : language;

  useEffect(() => {
    i18n.changeLanguage(effectiveLanguage);
  }, [effectiveLanguage, i18n]);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, newLanguage);
  };

  return (
    <LanguageContext.Provider
      value={{ language, effectiveLanguage, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
