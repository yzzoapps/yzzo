import { useEffect, useState } from "react";
import { Button, Header, SettingsItem } from "@yzzo/components";
import { clearAllItems } from "@yzzo/api/tauriApi";
import { getVersion } from "@tauri-apps/api/app";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

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
        <SettingsItem
          name={t("common.settings.preferences")}
          route={"/settings/preferences"}
        />
        <SettingsItem
          name={t("common.settings.privacy")}
          route={"/settings/privacy"}
        />
        <SettingsItem
          name={t("common.settings.about")}
          route={"/settings/about"}
          value={version ? `v${version}` : ""}
        />
      </ul>
      <div
        className={`px-4 py-2 ${BORDER_BOTTOM} items-center justify-center flex`}
      >
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
