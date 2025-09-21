"use client";

import { cn } from "lib/utils";

export type CartBadgeProps = {
  quantity: number;
  className?: string;
};

export function CartBadge({ quantity, className }: CartBadgeProps) {
  if (quantity <= 0) {
    return null;
  }

  const displayQuantity = quantity > 99 ? "99+" : quantity;

  return (
    <span
      className={cn(
        "inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground shadow-sm",
        className,
      )}
      aria-label={`购物车内共有 ${quantity} 件商品`}
    >
      {displayQuantity}
    </span>
  );
}
