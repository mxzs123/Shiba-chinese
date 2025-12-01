import type { CartItem } from "lib/api/types";
import { PrimaryButton } from "app/_shared";
import { formatCurrency, toNumber } from "../utils";

type OrderSummaryAsideProps = {
  cartLines: CartItem[];
  itemsSubtotal: number;
  couponsTotal: number;
  pointsApplied: number;
  shippingFee: number;
  payable: number;
  currencyCode: string;
  canProceedToPay: boolean;
  paymentModalOpen: boolean;
  internalTestingEnabled: boolean;
  onPayment: () => void;
};

export function OrderSummaryAside({
  cartLines,
  itemsSubtotal,
  couponsTotal,
  pointsApplied,
  shippingFee,
  payable,
  currencyCode,
  canProceedToPay,
  paymentModalOpen,
  internalTestingEnabled,
  onPayment,
}: OrderSummaryAsideProps) {
  return (
    <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-black/[0.02]">
      <h2 className="text-lg font-semibold text-neutral-900">订单摘要</h2>

      <div className="mt-4 space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-neutral-600">商品列表</h3>
          <ul className="space-y-3">
            {cartLines.map((line) => (
              <li
                key={line.merchandise.id}
                className="flex items-start justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {line.merchandise.product.title}
                  </p>
                  {line.merchandise.title ? (
                    <p className="text-xs text-neutral-500">
                      {line.merchandise.title}
                    </p>
                  ) : null}
                  <p className="text-xs text-neutral-400">
                    数量 × {line.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatCurrency(
                    toNumber(line.cost.totalAmount.amount),
                    line.cost.totalAmount.currencyCode,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <dl className="space-y-3 border-t border-dashed border-neutral-200 pt-4 text-sm text-neutral-500">
          <div className="flex items-center justify-between">
            <dt>商品金额</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {formatCurrency(itemsSubtotal, currencyCode)}
            </dd>
          </div>

          {!internalTestingEnabled && (
            <div className="flex items-center justify-between">
              <dt>优惠减免</dt>
              <dd className="text-sm font-semibold text-emerald-600">
                {formatCurrency(-couponsTotal, currencyCode)}
              </dd>
            </div>
          )}

          {!internalTestingEnabled && pointsApplied > 0 ? (
            <div className="flex items-center justify-between">
              <dt>积分抵扣</dt>
              <dd className="text-sm font-semibold text-emerald-600">
                {formatCurrency(-pointsApplied, currencyCode)}
              </dd>
            </div>
          ) : null}

          <div className="flex items-center justify-between">
            <dt>运费</dt>
            <dd className="text-sm font-semibold text-neutral-900">
              {formatCurrency(shippingFee, currencyCode)}
            </dd>
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
            <dt>应付总计</dt>
            <dd className="text-base font-semibold text-neutral-900">
              {formatCurrency(payable, currencyCode)}
            </dd>
          </div>
        </dl>

        <PrimaryButton
          type="button"
          className="w-full justify-center"
          onClick={onPayment}
          disabled={!canProceedToPay || paymentModalOpen}
        >
          去支付
        </PrimaryButton>

        <p className="text-xs text-neutral-400">
          请先核对订单信息，确认无误后点击“去支付”。支付将通过二维码完成，系统会在收到支付渠道回调后更新订单状态。
        </p>
      </div>
    </aside>
  );
}
