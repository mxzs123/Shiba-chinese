"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "app/_shared";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import type { Product, ProductVariant } from "lib/api/types";
import { useCartStore } from "hooks/use-cart-store";

function getPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

export function AddToCartForm({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const openCart = useCartStore((state) => state.open);
  const primaryVariant = getPrimaryVariant(product);

  const handleAdd = useCallback(async () => {
    if (!primaryVariant || !primaryVariant.availableForSale) {
      toast.error("暂不可购买", {
        description: "该商品当前缺货，请稍后再试。",
      });
      return;
    }

    try {
      addCartItem(primaryVariant, product);
      const result = await addItem(null, primaryVariant.id);

      if (typeof result === "string") {
        toast.error("未能加入购物车", {
          description: "系统繁忙，请稍后再试。",
        });
        return;
      }

      toast.success("已加入购物车", {
        description: `${product.title} 已添加，稍后可在购物车查看。`,
      });
      openCart();
    } catch (error) {
      console.error(error);
      toast.error("未能加入购物车", {
        description: "系统繁忙，请稍后再试。",
      });
    }
  }, [addCartItem, openCart, primaryVariant, product]);

  const isDisabled =
    !product.availableForSale || !primaryVariant?.availableForSale;

  return (
    <AddToCartButton
      onAdd={handleAdd}
      disabled={isDisabled}
      loadingText="加入中..."
      className="w-full justify-center px-6 py-3 text-base font-semibold"
    >
      加入购物车
    </AddToCartButton>
  );
}

export default AddToCartForm;
