import { Truck } from "lucide-react";
import { cn } from "lib/utils";
import type { ShippingMethod } from "lib/api/types";
import type { CheckoutVariant } from "../types";
import {
  SELECTABLE_CARD_SELECTED_CLASSES,
  SELECTABLE_CARD_UNSELECTED_CLASSES,
} from "../constants";
import { formatCurrency, toNumber } from "../utils";

type ShippingSectionProps = {
  shippingMethods: ShippingMethod[];
  selectedShippingId: string;
  variant: CheckoutVariant;
  disabled: boolean;
  onSelect: (shippingId: string) => void;
};

export function ShippingSection({
  shippingMethods,
  selectedShippingId,
  variant,
  disabled,
  onSelect,
}: ShippingSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <header className="flex items-center gap-2 text-neutral-900">
        <Truck className="h-5 w-5" aria-hidden />
        <h2 className="text-lg font-semibold">配送方式</h2>
      </header>
      <p className="mt-1 text-sm text-neutral-500">
        配送费用将根据所选方式更新，可在发货前调整。
      </p>
      <div className="mt-4 grid gap-3">
        {shippingMethods.map((method) => {
          const isSelected = method.id === selectedShippingId;
          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition",
                isSelected
                  ? SELECTABLE_CARD_SELECTED_CLASSES
                  : SELECTABLE_CARD_UNSELECTED_CLASSES,
              )}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="checkout-shipping"
                    className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    checked={isSelected}
                    onChange={() => onSelect(method.id)}
                    disabled={disabled}
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {method.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {method.carrier}
                      {method.estimatedDelivery
                        ? ` · ${method.estimatedDelivery}`
                        : ""}
                    </p>
                  </div>
                </div>
                {method.description ? (
                  <p className="text-xs text-neutral-500">
                    {method.description}
                  </p>
                ) : null}
              </div>
              <span className="text-sm font-semibold text-neutral-900">
                {formatCurrency(
                  toNumber(method.price.amount),
                  method.price.currencyCode,
                )}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
