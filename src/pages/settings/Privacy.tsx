import React from "react";
import { Header, ExternalLink } from "@yzzo/components";
import { useTranslation } from "react-i18next";
import { LINKS } from "@yzzo/constants";

const headerStyle = "font-semibold text-primary dark:text-white mb-1";
const descriptionStyle = "text-sm dark:text-gray-400";

const Privacy: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Header
        title={t("common.settings.privacy")}
        previousRoute={"/settings"}
      />

      <div className="flex flex-col gap-6 p-4">
        <section>
          <h2 className={headerStyle}>
            {t("components.settings.privacy.dataStorage")}
          </h2>
          <p className={descriptionStyle}>
            {t("components.settings.privacy.dataStorageDescription")}
          </p>
        </section>

        <section>
          <h2 className={headerStyle}>
            {t("components.settings.privacy.noCollection")}
          </h2>
          <p className={descriptionStyle}>
            {t("components.settings.privacy.noCollectionDescription")}
          </p>
        </section>

        <section>
          <h2 className={headerStyle}>
            {t("components.settings.privacy.imageStorage")}
          </h2>
          <p className={descriptionStyle}>
            {t("components.settings.privacy.imageStorageDescription")}
          </p>
        </section>

        <section>
          <h2 className={headerStyle}>
            {t("components.settings.privacy.feedback")}
          </h2>
          <p className={descriptionStyle}>
            {t("components.settings.privacy.feedbackDescription")}{" "}
            <ExternalLink href={LINKS.GITHUB_ISSUES}>GitHub</ExternalLink>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
