"use client";

import BasePrice from "components/price";
import { convertJpyToCny } from "lib/currency";
import type { Money } from "lib/api/types";
import { cn } from "lib/utils";

export type PriceProps = {
  value: Money;
  className?: string;
  currencyClassName?: string;
  showCurrencyCode?: boolean;
  showConvertedPrice?: boolean;
  convertedClassName?: string;
  convertedCurrencyClassName?: string;
  wrapperClassName?: string;
  convertedPrefix?: string;
};

export function Price({
  value,
  className,
  currencyClassName,
  showCurrencyCode = true,
  showConvertedPrice = false,
  convertedClassName,
  convertedCurrencyClassName,
  wrapperClassName,
  convertedPrefix = "约",
}: PriceProps) {
  const currencyClasses = cn(
    showCurrencyCode ? undefined : "sr-only",
    currencyClassName,
  );

  if (!showConvertedPrice) {
    return (
      <BasePrice
        amount={value.amount}
        currencyCode={value.currencyCode}
        className={className}
        currencyCodeClassName={currencyClasses}
      />
    );
  }

  const converted = convertJpyToCny(value);
  const convertedCurrencyClasses = cn(
    showCurrencyCode ? undefined : "sr-only",
    convertedCurrencyClassName ?? currencyClassName,
  );

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <BasePrice
        amount={value.amount}
        currencyCode={value.currencyCode}
        className={className}
        currencyCodeClassName={currencyClasses}
      />
      <BasePrice
        amount={converted.amount}
        currencyCode={converted.currencyCode}
        className={cn("text-sm text-neutral-500", convertedClassName)}
        currencyCodeClassName={convertedCurrencyClasses}
        prefix={convertedPrefix}
      />
    </div>
  );
}
