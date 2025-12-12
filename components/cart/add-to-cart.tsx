"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { addItem } from "@/app/_shared/cart/actions";
import { useCart } from "@/components/cart/cart-context";
import { useProduct } from "@/components/product/product-context";
import type { Product, ProductVariant } from "@/lib/api/types";
import { handleError } from "@/lib/error-handler";
import { APP_TEXT } from "@/lib/i18n/constants";
import { useActionState } from "react";

function SubmitButton({
  availableForSale,
  selectedVariantId,
}: {
  availableForSale: boolean;
  selectedVariantId: string | undefined;
}) {
  const buttonClasses =
    "relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white";
  const disabledClasses = "cursor-not-allowed opacity-60 hover:opacity-60";

  if (!availableForSale) {
    return (
      <button disabled className={clsx(buttonClasses, disabledClasses)}>
        {APP_TEXT.cart.outOfStock}
      </button>
    );
  }

  if (!selectedVariantId) {
    return (
      <button
        aria-label={APP_TEXT.cart.selectOption}
        disabled
        className={clsx(buttonClasses, disabledClasses)}
      >
        <div className="absolute left-0 ml-4">
          <PlusIcon className="h-5" />
        </div>
        {APP_TEXT.cart.addToCart}
      </button>
    );
  }

  return (
    <button
      aria-label={APP_TEXT.cart.addToCart}
      className={clsx(buttonClasses, {
        "hover:opacity-90": true,
      })}
    >
      <div className="absolute left-0 ml-4">
        <PlusIcon className="h-5" />
      </div>
      {APP_TEXT.cart.addToCart}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { variants, availableForSale } = product;
  const { addCartItem } = useCart();
  const { state } = useProduct();
  const [result, formAction] = useActionState(addItem, null);

  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === state[option.name.toLowerCase()],
    ),
  );
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const selectedVariantId = variant?.id || defaultVariantId;
  const addItemAction = formAction.bind(null, selectedVariantId);
  const finalVariant = variants.find(
    (variant) => variant.id === selectedVariantId,
  )!;

  return (
    <form
      action={async () => {
        try {
          addCartItem(finalVariant, product, 1);
          await addItemAction();
        } catch (error) {
          handleError(error, { action: "addToCart" });
        }
      }}
    >
      <SubmitButton
        availableForSale={availableForSale}
        selectedVariantId={selectedVariantId}
      />
      <p aria-live="polite" className="sr-only" role="status">
        {result && !result.success ? result.error : null}
      </p>
    </form>
  );
}
