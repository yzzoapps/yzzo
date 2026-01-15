import React, { useEffect, useState } from "react";
import { Header, ExternalLink } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { getVersion } from "@tauri-apps/api/app";
import { LINKS } from "@yzzo/constants";

const descriptionStyle = "text-sm dark:text-gray-400";

const About: React.FC = () => {
  const { t } = useTranslation();
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <div>
      <Header title={t("common.settings.about")} previousRoute={"/settings"} />

      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-center gap-1">
          <div className="h-14 flex flex-row gap-1 items-center">
            <img src="/icon.svg" alt="Logo" className="h-full w-auto" />
            <img src="/text.svg" alt="Logo" className="h-6 w-auto" />
          </div>
          <p className="text-neutral-black dark:text-gray-400">v{version}</p>
        </div>

        <p className={descriptionStyle}>
          {t("components.settings.about.description")}
        </p>

        <div className="flex flex-col gap-2">
          <p className={descriptionStyle}>
            {t("components.settings.about.author")}{" "}
            <ExternalLink href={LINKS.AUTHOR_WEBSITE}>
              Lucca Romaniello
            </ExternalLink>
            . {t("components.settings.about.support")}{" "}
            <ExternalLink href={LINKS.GITHUB}>GitHub</ExternalLink>.
          </p>
        </div>

        <div>
          <p className={descriptionStyle}>
            {t("components.settings.about.license")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
