import { Wallet } from "lucide-react";
import type { CheckoutVariant } from "../types";
import { CheckoutActionButton } from "../components";
import { formatCurrency } from "../utils";

type PointsSectionProps = {
  loyaltyBalance: number;
  maxPointRedeemable: number;
  pointsInput: string;
  pointsApplied: number;
  pointsRemaining: number;
  pointsError: string | null;
  pointsSuccess: string | null;
  variant: CheckoutVariant;
  disabled: boolean;
  cartCurrency: string;
  onInputChange: (value: string) => void;
  onApply: () => void;
  onApplyMax: () => void;
  onReset: () => void;
};

export function PointsSection({
  loyaltyBalance,
  maxPointRedeemable,
  pointsInput,
  pointsApplied,
  pointsRemaining,
  pointsError,
  pointsSuccess,
  variant,
  disabled,
  cartCurrency,
  onInputChange,
  onApply,
  onApplyMax,
  onReset,
}: PointsSectionProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <header className="flex items-center gap-2 text-neutral-900">
        <Wallet className="h-5 w-5" aria-hidden />
        <h2 className="text-lg font-semibold">积分抵扣</h2>
      </header>
      <p className="mt-2 text-sm text-neutral-500">
        可用积分
        <span className="mx-1 font-semibold text-neutral-900">
          {loyaltyBalance}
        </span>
        分。
      </p>

      <div className="mt-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-300">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              placeholder={
                maxPointRedeemable
                  ? "请输入想要使用的积分数量"
                  : "当前无可用积分"
              }
              value={pointsInput}
              onChange={(event) => onInputChange(event.target.value)}
              disabled={disabled || !maxPointRedeemable}
            />
            <CheckoutActionButton
              variant="ghost"
              size="sm"
              onClick={onApplyMax}
              disabled={disabled || !maxPointRedeemable}
              className="shrink-0"
            >
              全部使用
            </CheckoutActionButton>
          </div>
          <div className="flex items-center gap-2">
            <CheckoutActionButton
              variant="primary"
              onClick={onApply}
              disabled={disabled || !loyaltyBalance}
            >
              确认抵扣
            </CheckoutActionButton>
            <CheckoutActionButton
              variant="secondary"
              onClick={onReset}
              disabled={disabled || pointsApplied === 0}
            >
              清除
            </CheckoutActionButton>
          </div>
        </div>

        {pointsApplied > 0 ? (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
            <span>使用积分</span>
            <span className="font-semibold text-neutral-900">
              {pointsApplied}
            </span>
            <span>抵扣金额</span>
            <span className="font-semibold text-neutral-900">
              {formatCurrency(pointsApplied, cartCurrency)}
            </span>
            <span>剩余积分</span>
            <span className="font-semibold text-neutral-900">
              {pointsRemaining}
            </span>
            <span>。</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
            <span>未使用积分抵扣，可根据需要输入积分数量。</span>
          </div>
        )}
      </div>

      {pointsError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">
          {pointsError}
        </p>
      ) : null}

      {pointsSuccess ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
          {pointsSuccess}
        </p>
      ) : null}
    </section>
  );
}
