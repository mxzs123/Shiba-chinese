"use client";

import { ShoppingCart } from "lucide-react";
import {
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

import { PrimaryButton } from "./PrimaryButton";

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

  const handleClick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

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
    <PrimaryButton
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={className}
      loading={loading}
      loadingText={loadingText}
      leadingIcon={<ShoppingCart className="h-4 w-4" aria-hidden />}
    >
      {children ?? "加入购物车"}
    </PrimaryButton>
  );
}
