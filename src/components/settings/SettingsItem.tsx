import React from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { HiChevronRight } from "react-icons/hi";
import { BORDER_BOTTOM } from "@yzzo/styles/constants";

interface SettingsItemProps {
  name: string;
  route: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ name, route }) => {
  const router = useRouter();

  const handleClick = () => {
    console.log("Attempting to navigate to:", route);
    console.log("Available routes:", router.routesById);
    router.navigate({ to: route as any });
  };

  return (
    <button
      onClick={handleClick}
      className={`flex justify-between items-center w-full px-4 py-3 hover:bg-secondary/10 cursor-pointer ${BORDER_BOTTOM}`}
    >
      <span>{name}</span>
      <HiChevronRight />
    </button>
  );
};

export default SettingsItem;
