import React from "react";
import { Header, Radio } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@yzzo/contexts/LanguageContext";
import type { Language as LanguageType } from "@yzzo/types";

const languageOptions: { value: LanguageType; labelKey: string }[] = [
  { value: "system", labelKey: "components.settings.language.system" },
  { value: "en", labelKey: "components.settings.language.en" },
  { value: "pt", labelKey: "components.settings.language.pt" },
];

const LanguagePage: React.FC = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div>
      <Header
        title={t("components.settings.language.title")}
        previousRoute={"/settings/preferences"}
      />

      <div className="flex flex-col gap-4 p-4">
        <Radio<LanguageType>
          selectedValue={language}
          options={languageOptions}
          onChange={setLanguage}
        />
      </div>
    </div>
  );
};

export default LanguagePage;
