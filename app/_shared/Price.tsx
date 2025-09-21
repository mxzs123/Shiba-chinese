"use client";

import BasePrice from "components/price";
import { cn } from "lib/utils";
import type { Money } from "lib/api/types";

export type PriceProps = {
  value: Money;
  className?: string;
  currencyClassName?: string;
  showCurrencyCode?: boolean;
};

export function Price({
  value,
  className,
  currencyClassName,
  showCurrencyCode = true,
}: PriceProps) {
  return (
    <BasePrice
      amount={value.amount}
      currencyCode={value.currencyCode}
      className={className}
      currencyCodeClassName={cn(
        showCurrencyCode ? undefined : "sr-only",
        currencyClassName,
      )}
    />
  );
}
