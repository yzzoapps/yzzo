import React from "react";
import { useRouter } from "@tanstack/react-router";
import { HiChevronRight } from "react-icons/hi";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";

interface SettingsItemProps {
  name: string;
  route: string;
  value?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ name, route, value }) => {
  const router = useRouter();

  const handleClick = () => {
    router.navigate({ to: route as any });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex justify-between items-center w-full px-4 py-3 hover:bg-secondary/10 dark:hover:bg-secondary/5 cursor-pointer ${BORDER_BOTTOM}`}
    >
      <span>{name}</span>
      <div className="flex items-center gap-1 text-neutral- dark:text-neutral-white">
        {value && (
          <span className="text-sm text-gray-500 dark:text-gray-400 font-light">
            {value}
          </span>
        )}
        <HiChevronRight />
      </div>
    </button>
  );
};

export default SettingsItem;
