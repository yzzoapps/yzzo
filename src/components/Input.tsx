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
      <label className="block text-sm font-medium">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full min-w-0 px-3 py-2 border border-neutral-300 rounded text-sm h-10
          ${readOnly ? "bg-neutral-200 text-neutral-600 cursor-not-allowed" : "bg-white"}
          ${attachedToButton ? "rounded-r-none" : ""}
          ${className}`}
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

export default Input;
