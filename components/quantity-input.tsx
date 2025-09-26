"use client";

import type { ChangeEvent } from "react";
import { useCallback } from "react";

import { cn } from "lib/utils";

type QuantityInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  inputAriaLabel?: string;
  disabled?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  buttonClassName,
  inputClassName,
  decrementAriaLabel = "减少数量",
  incrementAriaLabel = "增加数量",
  inputAriaLabel = "数量输入",
  disabled = false,
}: QuantityInputProps) {
  const handleUpdate = useCallback(
    (next: number) => {
      const normalized = clamp(Math.round(next), min, max);
      if (normalized === value) {
        return;
      }
      onChange(normalized);
    },
    [max, min, onChange, value],
  );

  const handleDecrement = useCallback(() => {
    if (disabled) {
      return;
    }
    handleUpdate(value - 1);
  }, [disabled, handleUpdate, value]);

  const handleIncrement = useCallback(() => {
    if (disabled) {
      return;
    }
    handleUpdate(value + 1);
  }, [disabled, handleUpdate, value]);

  const handleManualInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      const rawValue = event.target.value;
      const digitsOnly = rawValue.replace(/[^0-9]/g, "");

      if (!digitsOnly.length) {
        handleUpdate(min);
        return;
      }

      const parsed = Number(digitsOnly);

      if (Number.isNaN(parsed)) {
        handleUpdate(min);
        return;
      }

      handleUpdate(parsed);
    },
    [disabled, handleUpdate, min],
  );

  const decrementDisabled = disabled || value <= min;
  const incrementDisabled = disabled || value >= max;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-neutral-200 bg-white",
        className,
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={decrementDisabled}
        className={cn(
          "px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300",
          buttonClassName,
        )}
        aria-label={decrementAriaLabel}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleManualInput}
        disabled={disabled}
        className={cn(
          "w-12 border-x border-neutral-200 bg-transparent py-2 text-center text-sm font-medium text-neutral-800 focus:outline-none disabled:cursor-not-allowed disabled:text-neutral-300",
          inputClassName,
        )}
        aria-label={inputAriaLabel}
      />
      <button
        type="button"
        onClick={handleIncrement}
        disabled={incrementDisabled}
        className={cn(
          "px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300",
          buttonClassName,
        )}
        aria-label={incrementAriaLabel}
      >
        ＋
      </button>
    </div>
  );
}

export default QuantityInput;
