import React from "react";

interface LabelProps {
  label: string;
  htmlFor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ label, htmlFor, className = "" }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium ${className}`}
    >
      {label}
    </label>
  );
};

export default Label;
