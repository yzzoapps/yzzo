import { HelperText, Label } from "@yzzo/components";
import React from "react";

interface InputProps {
  label?: string;
  value: string;
  placeholder?: string;
  readOnly?: boolean;
  helperText?: string;
  attachedToButton?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  placeholder = "",
  readOnly = false,
  helperText,
  attachedToButton = false,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <Label label={label} />}
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full min-w-0 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded text-sm h-10
          ${readOnly ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 cursor-not-allowed" : "bg-white dark:bg-neutral-800 dark:text-neutral-white"}
          ${attachedToButton ? "rounded-r-none" : ""}
          ${className}`}
      />
      {helperText && <HelperText text={helperText} />}
    </div>
  );
};

export default Input;
