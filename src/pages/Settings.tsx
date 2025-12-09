import { Link } from "@tanstack/react-router";
import { SettingsItem } from "@yzzo/components";
import { PADDING_X, PADDING_Y } from "@yzzo/styles/constants";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <>
      <div
        className={`bg-primary h-12 flex items-center justify-between ${PADDING_X} ${PADDING_Y}`}
      >
        <Link to="/">
          <p>a</p>
        </Link>
        <h1 className="text-neutral-white font-medium text-center flex-1">
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
