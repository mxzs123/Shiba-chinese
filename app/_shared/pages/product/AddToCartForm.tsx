"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "app/_shared";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import type { Product, ProductVariant } from "lib/api/types";

function getPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

export function AddToCartForm({ product }: { product: Product }) {
  const { addCartItem } = useCart();
  const primaryVariant = getPrimaryVariant(product);
  const [quantity, setQuantity] = useState(1);

  const increment = useCallback(() => {
    setQuantity((prev) => Math.min(99, prev + 1));
  }, []);

  const decrement = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleManualInput = useCallback((value: string) => {
    const parsed = Number(value.replace(/[^0-9]/g, ""));
    if (Number.isNaN(parsed)) {
      setQuantity(1);
      return;
    }
    setQuantity(Math.min(99, Math.max(1, parsed)));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!primaryVariant || !primaryVariant.availableForSale) {
      toast.error("暂不可购买", {
        description: "该商品当前缺货，请稍后再试。",
      });
      return;
    }

    try {
      addCartItem(primaryVariant, product, quantity);
      const result = await addItem(null, primaryVariant.id, quantity);

      if (typeof result === "string") {
        toast.error("未能加入购物车", {
          description: "系统繁忙，请稍后再试。",
        });
        return;
      }

      toast.success("已加入购物车", {
        description: `${product.title} × ${quantity} 已添加，稍后可在购物车查看。`,
      });
    } catch (error) {
      console.error(error);
      toast.error("未能加入购物车", {
        description: "系统繁忙，请稍后再试。",
      });
    }
  }, [addCartItem, primaryVariant, product, quantity]);

  const isDisabled =
    !product.availableForSale || !primaryVariant?.availableForSale;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-neutral-800">购买数量</span>
        <div className="inline-flex items-center rounded-lg border border-neutral-200 bg-white">
          <button
            type="button"
            onClick={decrement}
            className="px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
            aria-label="减少数量"
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            onChange={(event) => handleManualInput(event.target.value)}
            className="w-12 border-x border-neutral-200 bg-transparent py-2 text-center text-sm font-medium text-neutral-800 focus:outline-none"
            aria-label="购买数量输入"
          />
          <button
            type="button"
            onClick={increment}
            className="px-3 py-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
            aria-label="增加数量"
          >
            ＋
          </button>
        </div>
      </div>
      <AddToCartButton
        onAdd={handleAdd}
        disabled={isDisabled}
        loadingText="加入中..."
        className="w-full justify-center px-6 py-3 text-base font-semibold"
      >
        加入购物车
      </AddToCartButton>
    </div>
  );
}

export default AddToCartForm;
