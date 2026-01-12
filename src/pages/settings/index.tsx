import { Button, Header, SettingsItem } from "@yzzo/components";
import { clearAllItems } from "@yzzo/api/tauriApi";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();

  const handleClearHistory = async () => {
    if (window.confirm(t("common.settings.clearHistoryConfirm"))) {
      await clearAllItems();
    }
  };

  return (
    <>
      <Header title={t("common.settings.title")} previousRoute={"/"} />
      <ul>
        <SettingsItem
          name={t("common.settings.hotkeys")}
          route={"/settings/hotkeys"}
        />
        <SettingsItem name={t("common.settings.preferences")} route={"/"} />
        <SettingsItem name={t("common.settings.privacy")} route={"/"} />
        <SettingsItem name={t("common.settings.about")} route={"/"} />
      </ul>
      <div className={`px-4 py-4 ${BORDER_BOTTOM} items-center flex`}>
        <Button
          variant="danger"
          onClick={handleClearHistory}
          label={t("common.settings.clearHistory")}
        />
      </div>
    </>
  );
};

export default Settings;
