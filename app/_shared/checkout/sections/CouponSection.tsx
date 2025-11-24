import { Ticket, Loader2 } from "lucide-react";
import { cn } from "lib/utils";
import type { Coupon } from "lib/api/types";
import { CouponCard, CouponRedeemForm } from "app/_shared/coupons";
import type { CheckoutVariant } from "../types";
import { CheckoutActionButton } from "../components";

type CouponSectionProps = {
  availableCouponList: Coupon[];
  appliedCouponCodes: Set<string>;
  couponProcessingCode: string | null;
  couponError: string | null;
  couponSuccess: string | null;
  variant: CheckoutVariant;
  disabled: boolean;
  onApply: (code: string) => void;
  onRemove: (code: string) => void;
  onRedeem: (
    code: string,
  ) => Promise<{ success: true } | { success: false; error?: string }>;
};

export function CouponSection({
  availableCouponList,
  appliedCouponCodes,
  couponProcessingCode,
  couponError,
  couponSuccess,
  variant,
  disabled,
  onApply,
  onRemove,
  onRedeem,
}: CouponSectionProps) {
  const isMobile = variant === "mobile";

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <header className="flex items-center gap-2 text-neutral-900">
        <Ticket className="h-5 w-5" aria-hidden />
        <h2 className="text-lg font-semibold">优惠券</h2>
      </header>
      <p className="mt-1 text-sm text-neutral-500">
        选择可用优惠券，金额与规则均可在后端配置。
      </p>

      <CouponRedeemForm
        className="mt-4"
        onRedeem={onRedeem}
        submitLabel="立即兑换"
        pendingLabel="兑换中..."
      />

      <div className={cn("mt-4", isMobile ? "space-y-2" : "space-y-3")}>
        {availableCouponList.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
            当前无可用优惠券。
          </p>
        ) : (
          availableCouponList.map((coupon) => {
            const isApplied = appliedCouponCodes.has(coupon.code.toLowerCase());
            const isProcessing = couponProcessingCode === coupon.code;

            return (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                state="available"
                layout={isMobile ? "compact" : "default"}
                actionDescription={null}
                actionSlot={
                  <CheckoutActionButton
                    variant={isApplied ? "accent" : "accentOutline"}
                    size="sm"
                    className={cn(
                      "gap-1.5",
                      isMobile && "w-full justify-center",
                    )}
                    onClick={() =>
                      isApplied
                        ? onRemove(coupon.code)
                        : onApply(coupon.code)
                    }
                    disabled={isProcessing || disabled}
                  >
                    {isProcessing ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden
                      />
                    ) : null}
                    {isApplied ? "已使用" : "使用优惠"}
                  </CheckoutActionButton>
                }
                className={cn(
                  isApplied && "border-emerald-500/60 bg-emerald-50",
                )}
              />
            );
          })
        )}
      </div>

      {couponError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
          {couponError}
        </p>
      ) : null}

      {couponSuccess ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          {couponSuccess}
        </p>
      ) : null}
    </section>
  );
}
