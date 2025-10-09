import type { ComponentPropsWithoutRef } from "react";
import clsx from "clsx";

const variantStyles = {
  default:
    "bg-primary text-primary-foreground border-transparent",
  outline:
    "border border-primary/40 bg-primary/5 text-primary",
} satisfies Record<string, string>;

export type BadgeVariant = keyof typeof variantStyles;

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
