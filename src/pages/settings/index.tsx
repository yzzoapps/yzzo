import { useEffect, useState } from "react";
import { Button, Header, SettingsItem } from "@yzzo/components";
import { clearAllItems } from "@yzzo/api/tauriApi";
import { getVersion } from "@tauri-apps/api/app";
import { exit } from "@tauri-apps/plugin-process";
import { ask } from "@tauri-apps/plugin-dialog";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  const handleClearHistory = async () => {
    const confirmed = await ask(
      t("common.settings.clearHistory.dialog.description"),
      {
        title: t("common.settings.clearHistory.dialog.title"),
        kind: "warning",
        okLabel: t("common.settings.clearHistory.dialog.okLabel"),
        cancelLabel: t("common.settings.clearHistory.dialog.cancelLabel"),
      },
    );
    if (confirmed) {
      await clearAllItems();
    }
  };

  const handleQuit = async () => {
    const confirmed = await ask(t("common.settings.quit.dialog.description"), {
      title: t("common.settings.quit.dialog.title"),
      kind: "warning",
      okLabel: t("common.settings.quit.dialog.okLabel"),
      cancelLabel: t("common.settings.quit.dialog.cancelLabel"),
    });
    if (confirmed) {
      await exit(0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title={t("common.settings.title")} previousRoute={"/"} />
      <div className="flex-1 overflow-y-auto">
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
            label={t("common.settings.clearHistory.label")}
          />
        </div>
        <div
          className={`px-4 py-2 ${BORDER_BOTTOM} items-center justify-center flex`}
        >
          <Button
            variant="danger"
            onClick={handleQuit}
            label={t("common.settings.quit.label")}
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
