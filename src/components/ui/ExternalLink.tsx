import React from "react";
import { openUrl } from "@tauri-apps/plugin-opener";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className = "",
}) => {
  const handleClick = async () => {
    try {
      await openUrl(href);
    } catch (e) {
      console.error("Failed to open URL:", e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`text-neutral-black underline decoration-2 decoration-accent hover:cursor-pointer focus:outline-none ${className}`}
    >
      {children}
    </button>
  );
};

export default ExternalLink;
