"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import { AddToCartButton } from "app/_shared";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { QuantityInput } from "components/quantity-input";
import type { Product, ProductVariant } from "lib/api/types";
import { cn } from "lib/utils";
import { handleError } from "lib/error-handler";

function getPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

type AddToCartFormProps = {
  product: Product;
  variant?: "default" | "inline";
  className?: string;
};

export function AddToCartForm({
  product,
  variant = "default",
  className,
}: AddToCartFormProps) {
  const { addCartItem } = useCart();
  const primaryVariant = getPrimaryVariant(product);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = useCallback((value: number) => {
    setQuantity(value);
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
      handleError(error, { action: "addToCart" }, false);
      toast.error("未能加入购物车", {
        description: "系统繁忙，请稍后再试。",
      });
    }
  }, [addCartItem, primaryVariant, product, quantity]);

  const isDisabled =
    !product.availableForSale || !primaryVariant?.availableForSale;

  const isInline = variant === "inline";

  const inlineControls = (
    <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
      <QuantityInput
        value={quantity}
        onChange={handleQuantityChange}
        min={1}
        max={99}
        className="w-full sm:w-auto sm:flex-none"
        buttonClassName="px-3 py-2"
        inputClassName="w-20 text-base"
        decrementAriaLabel="减少数量"
        incrementAriaLabel="增加数量"
        inputAriaLabel="购买数量输入"
      />
      <AddToCartButton
        onAdd={handleAdd}
        disabled={isDisabled}
        loadingText="加入中..."
        className="h-12 w-full justify-center rounded-lg px-4 text-base font-semibold"
      >
        加入购物车
      </AddToCartButton>
    </div>
  );

  return (
    <div
      className={cn("w-full", isInline ? "space-y-0" : "space-y-4", className)}
    >
      {isInline ? null : (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-neutral-800">购买数量</span>
          <QuantityInput
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={99}
            decrementAriaLabel="减少数量"
            incrementAriaLabel="增加数量"
            inputAriaLabel="购买数量输入"
          />
        </div>
      )}
      {isInline ? (
        inlineControls
      ) : (
        <AddToCartButton
          onAdd={handleAdd}
          disabled={isDisabled}
          loadingText="加入中..."
          className="w-full justify-center px-6 py-3 text-base font-semibold"
        >
          加入购物车
        </AddToCartButton>
      )}
    </div>
  );
}

export default AddToCartForm;
