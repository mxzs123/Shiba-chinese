import { cn } from "lib/utils";
import type { PaymentMethod } from "lib/api/types";
import type { CheckoutVariant } from "../types";
import {
  SELECTABLE_CARD_SELECTED_CLASSES,
  SELECTABLE_CARD_UNSELECTED_CLASSES,
} from "../constants";

type PaymentMethodSectionProps = {
  paymentMethods: PaymentMethod[];
  selectedPaymentId: string;
  variant: CheckoutVariant;
  disabled: boolean;
  onSelect: (paymentId: string) => void;
};

export function PaymentMethodSection({
  paymentMethods,
  selectedPaymentId,
  variant,
  disabled,
  onSelect,
}: PaymentMethodSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <header className="flex items-center gap-2 text-neutral-900">
        <h2 className="text-lg font-semibold">支付方式</h2>
      </header>
      <p className="mt-1 text-sm text-neutral-500">
        本次订单采用二维码扫码支付，完成后系统会根据支付渠道回调更新状态。
      </p>

      <div className="mt-4 space-y-3">
        {paymentMethods.map((method) => {
          const isSelected = method.id === selectedPaymentId;
          return (
            <label
              key={method.id}
              className={cn(
                "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition",
                isSelected
                  ? SELECTABLE_CARD_SELECTED_CLASSES
                  : SELECTABLE_CARD_UNSELECTED_CLASSES,
                method.disabled && "opacity-50",
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="checkout-payment"
                  className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                  checked={isSelected}
                  onChange={() => onSelect(method.id)}
                  disabled={disabled || method.disabled}
                />
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {method.name}
                  </p>
                  {method.description ? (
                    <p className="text-xs text-neutral-500">
                      {method.description}
                    </p>
                  ) : null}
                  {method.instructions ? (
                    <p className="mt-1 text-xs text-neutral-400">
                      {method.instructions}
                    </p>
                  ) : null}
                  {method.type === "qr_code" ? (
                    <p className="mt-1 text-[11px] text-neutral-400">
                      * 支持微信 / 支付宝扫码支付
                    </p>
                  ) : null}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
