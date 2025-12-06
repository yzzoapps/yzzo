import React from "react";
import { useRouter } from "@tanstack/react-router";

const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
);

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
      className="flex justify-between items-center w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
    >
      <span>{name}</span>
      <ChevronRightIcon />
    </button>
  );
};

export default SettingsItem;
