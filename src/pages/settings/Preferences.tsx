import React from "react";
import { Header, Label } from "@yzzo/components";
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
        <div>
          <Label label={t("components.settings.preferences.theme")} />
          <div className="flex flex-col gap-2 mt-2">
            {themeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={theme === option.value}
                  onChange={() => setTheme(option.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span>{t(option.labelKey)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
