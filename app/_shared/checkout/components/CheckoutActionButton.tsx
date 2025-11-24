import type { ButtonHTMLAttributes } from "react";
import { cn } from "lib/utils";

type CheckoutActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "accentOutline" | "ghost";
  size?: "default" | "sm";
};

export function CheckoutActionButton({
  variant = "primary",
  size = "default",
  type = "button",
  className,
  ...props
}: CheckoutActionButtonProps) {
  const sizeClasses = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";

  const variantClasses =
    variant === "primary"
      ? "bg-[#049e6b] text-white hover:brightness-105 disabled:bg-[#049e6b]/40 disabled:text-white/80"
      : variant === "secondary"
        ? "border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 disabled:border-neutral-200 disabled:text-neutral-300"
        : variant === "accent"
          ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-200 disabled:text-white/80"
          : variant === "accentOutline"
            ? "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:border-emerald-200 disabled:text-emerald-200"
            : "text-xs font-semibold text-emerald-600 hover:text-emerald-500 disabled:text-neutral-300";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition disabled:cursor-not-allowed",
        sizeClasses,
        variantClasses,
        className,
      )}
      {...props}
    />
  );
}
