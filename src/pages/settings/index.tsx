import { Header, SettingsItem } from "@yzzo/components";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t("common.settings.title")} previousRoute={"/"} />
      <SettingsItem
        name={t("common.settings.hotkeys")}
        route={"/settings/hotkeys"}
      />
      <SettingsItem name={t("common.settings.preferences")} route={"/"} />
      <SettingsItem name={t("common.settings.privacy")} route={"/"} />
      <SettingsItem name={t("common.settings.about")} route={"/"} />
    </>
  );
};

export default Settings;
