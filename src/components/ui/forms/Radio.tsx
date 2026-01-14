import { HelperText, Label } from "@yzzo/components";
import { useTranslation } from "react-i18next";

interface RadioOptionn<T extends string> {
  labelKey: string;
  value: T;
}

interface RadioProps<T extends string> {
  label?: string;
  selectedValue: T;
  options: RadioOptionn<T>[];
  onChange: (selectedValue: T) => void;
  helperText?: string;
  className?: string;
}

const Radio = <T extends string>({
  label,
  selectedValue,
  options,
  onChange,
  helperText,
  className = "",
}: RadioProps<T>) => {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <Label label={label} />}
      <div className="flex flex-col gap-2 mt-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => onChange(option.value)}
              className="w-4 h-4 cursor-pointer accent-primary-600"
            />
            <span className="text-sm text-neutral-800 dark:text-neutral-200">
              {t(option.labelKey)}
            </span>
          </label>
        ))}
      </div>
      {helperText && <HelperText text={helperText} />}
    </div>
  );
};

export default Radio;
