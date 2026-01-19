import { useEffect } from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import { useTranslation } from "react-i18next";

const FIRST_LAUNCH_KEY = "yzzo_first_launch_done";

export function useFirstLaunchNotification() {
  const { t } = useTranslation();

  useEffect(() => {
    const showFirstLaunchNotification = async () => {
      if (localStorage.getItem(FIRST_LAUNCH_KEY)) {
        return;
      }

      let permissionGranted = await isPermissionGranted();

      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === "granted";
      }

      if (permissionGranted) {
        sendNotification({
          title: "YZZO",
          body: t("common.notifications.firstLaunch"),
        });
      }

      localStorage.setItem(FIRST_LAUNCH_KEY, "true");
    };

    showFirstLaunchNotification();
  }, [t]);
}
