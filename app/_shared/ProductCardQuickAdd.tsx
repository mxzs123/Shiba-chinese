"use client";

import { useCallback, useTransition } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "./AddToCartButton";
import { addItem } from "@/app/_shared/cart/actions";
import { useCart } from "@/components/cart/cart-context";
import type { Product, ProductVariant } from "@/lib/api/types";
import { handleError } from "@/lib/error-handler";
import { cn } from "@/lib/utils";

type ProductCardQuickAddProps = {
  product: Product;
  className?: string;
};

function getPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  const availableVariant = product.variants.find(
    (variant) => variant.availableForSale,
  );

  return availableVariant ?? product.variants[0];
}

export function ProductCardQuickAdd({
  product,
  className,
}: ProductCardQuickAddProps) {
  const { addCartItem } = useCart();
  const [, startTransition] = useTransition();
  const primaryVariant = getPrimaryVariant(product);

  const isUnavailable =
    !product.availableForSale || !primaryVariant?.availableForSale;

  const handleAdd = useCallback(async () => {
    if (isUnavailable) {
      toast.error("暂不可购买", {
        description: "该商品当前缺货，请稍后再试。",
      });
      return;
    }

    if (!primaryVariant) {
      toast.error("未能加入购物车", {
        description: "未找到可用的商品信息，请稍后再试。",
      });
      return;
    }

    try {
      // Wrap optimistic add in a transition to comply with Next 15
      // and avoid "Optimistic update outside a transition".
      startTransition(() => {
        addCartItem(primaryVariant, product, 1);
      });
      const result = await addItem(null, primaryVariant.id, 1);

      if (!result.success) {
        toast.error("未能加入购物车", {
          description: "系统繁忙，请稍后再试。",
        });
        return;
      }

      toast.success("已加入购物车", {
        description: `${product.title} × 1 已添加至购物车。`,
      });
    } catch (error) {
      handleError(error, { action: "addToCart" }, false);
      toast.error("未能加入购物车", {
        description: "系统繁忙，请稍后再试。",
      });
    }
  }, [addCartItem, isUnavailable, primaryVariant, product]);

  const buttonLabel = isUnavailable ? "暂不可购" : "加入购物车";

  return (
    <div className={cn("w-full", className)}>
      <AddToCartButton
        onAdd={handleAdd}
        disabled={isUnavailable}
        loadingText="加入中..."
        className="w-full justify-center px-3 text-xs xl:px-6 xl:text-sm"
      >
        {buttonLabel}
      </AddToCartButton>
    </div>
  );
}

export default ProductCardQuickAdd;
