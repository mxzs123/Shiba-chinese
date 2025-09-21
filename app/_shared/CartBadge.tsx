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

  return (
    <span
      className={cn(
        "inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white",
        className,
      )}
      aria-label={`购物车内共有 ${quantity} 件商品`}
    >
      {quantity}
    </span>
  );
}
