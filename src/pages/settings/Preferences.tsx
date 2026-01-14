import React from "react";
import { Header, Radio } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { useTheme } from "@yzzo/contexts/ThemeContext";
import type { Theme } from "@yzzo/types";

const themeOptions: { value: Theme; labelKey: string }[] = [
  { value: "light", labelKey: "components.settings.preferences.themeLight" },
  { value: "dark", labelKey: "components.settings.preferences.themeDark" },
  { value: "auto", labelKey: "components.settings.preferences.themeAuto" },
];

const Preferences: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <Header
        title={t("common.settings.preferences")}
        previousRoute={"/settings"}
      />

      <div className="flex flex-col gap-4 p-4">
        <Radio<Theme>
          label={t("components.settings.preferences.theme")}
          selectedValue={theme}
          options={themeOptions}
          onChange={setTheme}
        />
      </div>
    </div>
  );
};

export default Preferences;
