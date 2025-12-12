"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type CartSelectionCheckboxProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  indeterminate?: boolean;
  label?: ReactNode;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

export function CartSelectionCheckbox({
  checked,
  onCheckedChange,
  indeterminate = false,
  label,
  className,
  inputClassName,
  disabled = false,
}: CartSelectionCheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked;
      const state =
        indeterminate && !checked
          ? "indeterminate"
          : checked
            ? "checked"
            : "unchecked";
      inputRef.current.setAttribute("data-state", state);
    }
  }, [indeterminate, checked]);

  return (
    <label
      className={cn(
        "inline-flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-neutral-700",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={cn("peer sr-only", inputClassName)}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        disabled={disabled}
      />
      <span
        aria-hidden
        className="relative flex h-5 w-5 items-center justify-center rounded-lg border border-neutral-300 bg-white text-white transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#049e6b] peer-checked:border-[#049e6b] peer-checked:bg-[#049e6b] peer-checked:shadow-sm peer-checked:before:opacity-100 peer-data-[state=indeterminate]:border-[#049e6b] peer-data-[state=indeterminate]:before:opacity-0 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:text-[11px] before:font-semibold before:leading-none before:text-white before:opacity-0 before:transition-opacity before:content-['✔']"
      >
        <span className="absolute h-[2px] w-2 rounded-full bg-[#049e6b] opacity-0 transition-opacity peer-data-[state=indeterminate]:opacity-100 peer-checked:opacity-0" />
      </span>
      {label ? label : null}
    </label>
  );
}
