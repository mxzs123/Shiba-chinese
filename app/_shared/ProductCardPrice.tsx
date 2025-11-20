import type { Money } from "lib/api/types";
import { convertJpyToCny } from "lib/currency";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";
import BasePrice from "components/price";

type ProductCardPriceProps = {
  value: Money;
  originalValue?: Money | null;
  compact?: boolean;
};

function formatCnyAmount(amount: string) {
  const numeric = Number.parseFloat(amount);
  if (!Number.isFinite(numeric)) {
    return "0";
  }

  return new Intl.NumberFormat("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numeric);
}

export function ProductCardPrice({
  value,
  originalValue,
  compact = false,
}: ProductCardPriceProps) {
  const hasDiscount = isDiscountedPrice(value, originalValue);
  const converted = convertJpyToCny(value);

  const mainPriceClassName = cn(
    "inline-flex items-baseline gap-1 font-semibold",
    compact ? "text-sm" : "text-base",
    hasDiscount ? "text-emerald-600" : "text-neutral-900",
  );

  const metaRowClassName = cn(
    "flex flex-wrap items-baseline gap-x-2 text-neutral-500",
    compact ? "text-[11px]" : "text-xs",
  );

  const originalPriceClassName = cn(
    "inline-flex items-baseline gap-0.5 text-neutral-400 line-through",
  );

  const formattedCny = formatCnyAmount(converted.amount);

  return (
    <div className={cn("flex flex-col", compact ? "gap-1" : "gap-1.5")}>
      <div className="flex items-baseline gap-1">
        <BasePrice
          amount={value.amount}
          currencyCode={value.currencyCode}
          className={mainPriceClassName}
          currencyCodeClassName="sr-only"
        />
      </div>
      <div className={metaRowClassName}>
        {hasDiscount && originalValue ? (
          <BasePrice
            amount={originalValue.amount}
            currencyCode={originalValue.currencyCode}
            className={originalPriceClassName}
            currencyCodeClassName="sr-only"
            prefix="原价"
          />
        ) : null}
        <span>约 {formattedCny} 元人民币</span>
      </div>
    </div>
  );
}
