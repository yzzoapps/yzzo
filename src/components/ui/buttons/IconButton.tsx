import React from "react";
import { Link } from "@tanstack/react-router";
import { IconType } from "react-icons";
import { HiBellAlert } from "react-icons/hi2";

interface IconButtonProps {
  onClick?: () => void;
  icon: {
    type: IconType;
    background?: boolean;
    size?: number;
  };
  link?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon = { type: HiBellAlert, background: true, size: 6 },
  link,
}) => {
  const IconComponent = icon.type || HiBellAlert;
  const buttonSizes: Record<number, string> = {
    4: "w-4 h-4",
    6: "w-6 h-6",
    8: "w-8 h-8",
    10: "w-10 h-10",
  };
  const buttonStyle = `flex items-center text-lg cursor-pointer rounded-full justify-center transition-colors
    ${
      icon.background
        ? "bg-gray-200 text-neutral-black p-1 hover:bg-gray-300"
        : "bg-transparent text-primary hover:text-primary/80"
    }`;

  const buttonContent = (
    <>
      <IconComponent
        className={icon.size ? buttonSizes[icon.size] : "w-6 h-6"}
      />
    </>
  );

  if (link) {
    return (
      <Link to={link}>
        <button onClick={onClick} className={buttonStyle}>
          {buttonContent}
        </button>
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonStyle}>
      {buttonContent}
    </button>
  );
};

export default IconButton;
