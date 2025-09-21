"use client";

import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "lib/utils";

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
          "inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500",
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
