import React from "react";

interface HelperTextProps {
  text: string;
  className?: string;
}

const HelperText: React.FC<HelperTextProps> = ({ text, className = "" }) => {
  return <p className={`text-xs text-gray-500 mt-1 ${className}`}>{text}</p>;
};

export default HelperText;
