import React from "react";
import { useRouter } from "@tanstack/react-router";
import { HiChevronRight } from "react-icons/hi";

interface SettingsItemProps {
  name: string;
  route: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ name, route }) => {
  const router = useRouter();

  const handleClick = () => {
    router.navigate({ to: route });
  };

  return (
    <button
      onClick={handleClick}
      className="flex justify-between items-center w-full px-4 py-3 hover:bg-secondary/10 rounded"
    >
      <span>{name}</span>
      <HiChevronRight />
    </button>
  );
};

export default SettingsItem;
