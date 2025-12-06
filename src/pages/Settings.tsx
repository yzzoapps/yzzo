import { SettingsItem } from "@yzzo/components";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1>Settings Page</h1>
      <SettingsItem name={t("common.settings.hotkeys")} route={"/"} />
      <SettingsItem name={""} route={""} />
    </>
  );
};

export default Settings;
