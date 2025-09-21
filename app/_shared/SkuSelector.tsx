"use client";

import type { ProductOption } from "lib/api/types";
import { cn } from "lib/utils";

export type SkuSelectorProps = {
  options: ProductOption[];
  value: Record<string, string | undefined>;
  onChange: (optionName: string, optionValue: string) => void;
  isDisabled?: (optionName: string, optionValue: string) => boolean;
  className?: string;
};

export function SkuSelector({
  options,
  value,
  onChange,
  isDisabled,
  className,
}: SkuSelectorProps) {
  if (!options.length) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {options.map((option) => (
        <fieldset key={option.id} className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {option.name}
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((optionValue) => {
              const selected = value?.[option.name] === optionValue;
              const disabled = isDisabled?.(option.name, optionValue) ?? false;

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => onChange(option.name, optionValue)}
                  disabled={disabled}
                  className={cn(
                    "rounded-full border px-4 py-1 text-sm transition",
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-700 dark:border-teal-400 dark:bg-teal-950 dark:text-teal-200"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300",
                    disabled &&
                      "cursor-not-allowed border-dashed text-neutral-400 opacity-60",
                  )}
                  aria-pressed={selected}
                >
                  {optionValue}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
