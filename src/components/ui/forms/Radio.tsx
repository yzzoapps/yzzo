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
            <div className="relative flex items-center justify-center">
              <input
                type="radio"
                name={label}
                value={option.value}
                checked={selectedValue === option.value}
                onChange={() => onChange(option.value)}
                className="appearance-none w-4 h-4 border-2 border-neutral-400 dark:border-neutral-500 rounded-full checked:border-secondary dark:checked:border-accent cursor-pointer"
              />
              {selectedValue === option.value && (
                <div className="absolute w-2 h-2 bg-secondary dark:bg-accent rounded-full pointer-events-none" />
              )}
            </div>
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
