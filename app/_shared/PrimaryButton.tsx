"use client";

import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "lib/utils";

export const PRIMARY_BUTTON_COLOR_CLASSES =
  "bg-primary text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500";

const PRIMARY_BUTTON_BASE_CLASSES =
  "inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold";

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  loadingText?: string;
};

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (
    {
      leadingIcon,
      trailingIcon,
      loading,
      loadingText = "处理中...",
      className,
      disabled,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const isLoading = Boolean(loading);
    const content = isLoading ? loadingText : children;

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          PRIMARY_BUTTON_BASE_CLASSES,
          PRIMARY_BUTTON_COLOR_CLASSES,
          className,
        )}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          leadingIcon
        )}
        <span>{content}</span>
        {!isLoading && trailingIcon ? trailingIcon : null}
      </button>
    );
  },
);

PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
