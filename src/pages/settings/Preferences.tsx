import React from "react";
import { Header, Radio, SettingsItem } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { useTheme, useLanguage } from "@yzzo/contexts";
import type { Theme } from "@yzzo/types";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";

const themeOptions: { value: Theme; labelKey: string }[] = [
  { value: "light", labelKey: "components.settings.preferences.themeLight" },
  { value: "dark", labelKey: "components.settings.preferences.themeDark" },
  { value: "auto", labelKey: "components.settings.preferences.themeAuto" },
];

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();

  const getLanguageLabel = () => {
    const labels: Record<string, string> = {
      system: t("components.settings.language.system"),
      en: t("components.settings.language.en"),
      pt: t("components.settings.language.pt"),
    };
    return labels[language] || language;
  };

  return (
    <div>
      <Header
        title={t("common.settings.preferences")}
        previousRoute={"/settings"}
      />

      <div className={`flex flex-col gap-4 p-4 ${BORDER_BOTTOM}`}>
        <Radio<Theme>
          label={t("components.settings.preferences.theme")}
          selectedValue={theme}
          options={themeOptions}
          onChange={setTheme}
        />
      </div>

      <SettingsItem
        name={t("common.settings.language")}
        route="/settings/preferences/language"
        value={getLanguageLabel()}
      />
    </div>
  );
};

export default Preferences;
