"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "lib/utils";

export type AddToCartButtonProps = {
  onAdd?: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  loadingText?: string;
  children?: ReactNode;
};

export function AddToCartButton({
  onAdd,
  disabled,
  className,
  loadingText = "处理中...",
  children,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!onAdd || loading) {
      return;
    }

    try {
      setLoading(true);
      await onAdd();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:bg-neutral-300",
        className,
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <ShoppingCart className="h-4 w-4" aria-hidden />
      )}
      <span>{loading ? loadingText : (children ?? "加入购物车")}</span>
    </button>
  );
}
