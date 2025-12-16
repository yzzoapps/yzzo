import React from "react";

interface ButtonProps {
  variant?: "default" | "danger";
  size?: "sm" | "md" | "lg";
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  attachedToInput?: boolean;
  className?: string;
}

const buttonStyles = {
  base: "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors shrink-0 whitespace-nowrap cursor-pointer",
  variants: {
    default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700",
    danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    disabled: "bg-neutral-500 text-white cursor-not-allowed",
  },
  sizes: {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  },
};

const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  label,
  onClick,
  disabled = false,
  attachedToInput = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${buttonStyles.base}
        ${buttonStyles.sizes[size]}
        ${disabled ? buttonStyles.variants.disabled : buttonStyles.variants[variant]}
        ${attachedToInput ? "rounded-l-none" : ""}
        ${className}
      `}
    >
      {label}
    </button>
  );
};

export default Button;
