import React, { useEffect, useState } from "react";
import { Header, ExternalLink } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import { LINKS } from "@yzzo/constants";

const About: React.FC = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  const handleOpenGithub = async () => {
    try {
      await openUrl(LINKS.GITHUB);
    } catch (e) {
      console.error("Failed to open URL:", e);
    }
  };

  return (
    <div>
      <Header
        title={t("common.settings.about")}
        previousRoute={"/settings"}
      />

      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">YZZO</h1>
          <p className="text-sm text-secondary">v{version}</p>
        </div>

        <p className="text-center text-sm">
          {t("components.settings.about.description")}
        </p>

        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm">
            {t("components.settings.about.author")}{" "}
            <span className="font-semibold">Lucca Romaniello</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 text-center">
          <p className="text-sm">
            {t("components.settings.about.support")}{" "}
            <button
              onClick={handleOpenGithub}
              className="text-secondary hover:underline font-semibold focus:outline-none"
            >
              GitHub
            </button>
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-secondary">
            {t("components.settings.about.license")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
