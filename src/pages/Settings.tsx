import { SettingsItem } from "@yzzo/components";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-primary h-12 flex items-center justify-center">
        <h1 className="text-neutral-white font-medium">
          {t("common.settings.title")}
        </h1>
      </div>
      <SettingsItem name={t("common.settings.hotkeys")} route={"/"} />
      <SettingsItem name={t("common.settings.preferences")} route={"/"} />
      <SettingsItem name={t("common.settings.privacy")} route={"/"} />
      <SettingsItem name={t("common.settings.about")} route={"/"} />
    </>
  );
};

export default Settings;
