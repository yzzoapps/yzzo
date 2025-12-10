import React from "react";
import { Link } from "@tanstack/react-router";
import { IconType } from "react-icons";
import { HiBellAlert } from "react-icons/hi2";

interface IconButtonProps {
  onClick?: () => void;
  icon?: IconType;
  link?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon = HiBellAlert,
  link,
}) => {
  const IconComponent = icon || HiBellAlert;
  const buttonStyle =
    "flex items-center rounded-lg text-primary text-lg cursor-pointer hover:text-secondary";

  const buttonContent = (
    <>
      <IconComponent className="h-6 w-6" />
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
