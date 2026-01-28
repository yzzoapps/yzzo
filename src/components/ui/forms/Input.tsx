import { HelperText, Label } from "@yzzo/components";
import React, { forwardRef } from "react";

interface InputProps {
  label?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  helperText?: string;
  attachedToButton?: boolean;
  className?: string;
  rounded?: "rounded-full" | "rounded-md";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      value,
      onChange,
      placeholder = "",
      readOnly = false,
      helperText,
      attachedToButton = false,
      className = "",
      rounded = "rounded-md",
    },
    ref,
  ) => {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        {label && <Label label={label} />}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${rounded} w-full min-w-0 px-3 py-2 border border-neutral-300 dark:border-neutral-600 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
            ${readOnly ? "bg-neutral-200 dark:bg-neutral-black/10 text-neutral-600 dark:text-neutral-400 cursor-not-allowed" : "bg-white dark:bg-neutral-black/10 dark:text-neutral-white caret-secondary"}
            ${attachedToButton ? "rounded-r-none" : ""}`}
        />
        {helperText && <HelperText text={helperText} />}
      </div>
    );
  },
);

export default Input;
