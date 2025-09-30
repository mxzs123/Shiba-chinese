"use client";

import BasePrice from "components/price";
import { convertJpyToCny } from "lib/currency";
import type { Money } from "lib/api/types";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";

export type PriceProps = {
  value: Money;
  originalValue?: Money | null;
  className?: string;
  currencyClassName?: string;
  showCurrencyCode?: boolean;
  showConvertedPrice?: boolean;
  convertedClassName?: string;
  convertedCurrencyClassName?: string;
  wrapperClassName?: string;
  convertedPrefix?: string;
  originalClassName?: string;
  originalCurrencyClassName?: string;
  originalConvertedClassName?: string;
  originalConvertedCurrencyClassName?: string;
  originalConvertedPrefix?: string;
  badge?: string;
  badgeClassName?: string;
  originalColumnAlign?: "center" | "start" | "end";
  discountLayout?: "balanced" | "start";
};

export function Price({
  value,
  originalValue,
  className,
  currencyClassName,
  showCurrencyCode = true,
  showConvertedPrice = false,
  convertedClassName,
  convertedCurrencyClassName,
  wrapperClassName,
  convertedPrefix = "约",
  originalClassName,
  originalCurrencyClassName,
  originalConvertedClassName,
  originalConvertedCurrencyClassName,
  originalConvertedPrefix,
  badge,
  badgeClassName,
  originalColumnAlign = "center",
  discountLayout = "balanced",
}: PriceProps) {
  const currencyClasses = cn(
    showCurrencyCode ? undefined : "sr-only",
    currencyClassName,
  );

  const originalClasses = cn(
    showCurrencyCode ? undefined : "sr-only",
    originalCurrencyClassName ?? currencyClassName,
  );

  const hasOriginalPrice = isDiscountedPrice(value, originalValue);

  if (!showConvertedPrice && !hasOriginalPrice) {
    return (
      <BasePrice
        amount={value.amount}
        currencyCode={value.currencyCode}
        className={className}
        currencyCodeClassName={currencyClasses}
      />
    );
  }

  const converted = showConvertedPrice ? convertJpyToCny(value) : null;
  const convertedCurrencyClasses = converted
    ? cn(
        showCurrencyCode ? undefined : "sr-only",
        convertedCurrencyClassName ?? currencyClassName,
      )
    : undefined;
  const convertedOriginal =
    showConvertedPrice && originalValue ? convertJpyToCny(originalValue) : null;
  const convertedOriginalClasses = convertedOriginal
    ? cn(
        showCurrencyCode ? undefined : "sr-only",
        originalConvertedCurrencyClassName ??
          originalCurrencyClassName ??
          currencyClassName,
      )
    : undefined;
  const convertedOriginalPrefix = originalConvertedPrefix ?? convertedPrefix;

  const resolvedBadge = hasOriginalPrice ? (badge ?? "芝园价") : undefined;

  if (hasOriginalPrice) {
    const alignDiscountStart = discountLayout === "start";
    const alignOriginalEnd = originalColumnAlign === "end";
    const alignOriginalStart = originalColumnAlign === "start";
    const originalColumnClasses = cn(
      "flex min-w-0 flex-col justify-end gap-0.5",
      alignOriginalEnd
        ? "items-end pr-1 text-right"
        : alignOriginalStart
          ? "items-start text-left"
          : "items-center text-center",
    );
    const originalPriceClasses = cn(
      "inline-flex items-baseline gap-0.5 text-xs font-medium text-neutral-400 line-through",
      alignOriginalEnd
        ? "justify-end"
        : alignOriginalStart
          ? "justify-start"
          : "justify-center",
      originalClassName,
    );
    const originalConvertedClasses = cn(
      "inline-flex items-baseline gap-0.5 text-[10px] font-medium text-neutral-400",
      alignOriginalEnd
        ? "justify-end"
        : alignOriginalStart
          ? "justify-start"
          : "justify-center",
      originalConvertedClassName,
    );

    return (
      <div
        className={cn(
          "grid w-full items-stretch gap-2",
          alignDiscountStart
            ? "justify-start grid-cols-[auto_auto_auto]"
            : "grid-cols-[1fr_auto_1fr]",
          wrapperClassName,
        )}
      >
        <div className={originalColumnClasses}>
          <BasePrice
            amount={originalValue!.amount}
            currencyCode={originalValue!.currencyCode}
            className={originalPriceClasses}
            currencyCodeClassName={originalClasses}
          />
          {convertedOriginal ? (
            <BasePrice
              amount={convertedOriginal.amount}
              currencyCode={convertedOriginal.currencyCode}
              className={originalConvertedClasses}
              currencyCodeClassName={convertedOriginalClasses}
              prefix={convertedOriginalPrefix}
            />
          ) : null}
        </div>
        <div
          aria-hidden
          className={cn(
            "h-full w-px rounded-full bg-neutral-200",
            alignDiscountStart ? "" : "mx-auto",
          )}
        />
        <div
          className={cn(
            "flex min-w-0 flex-col gap-0.5 text-left",
            alignDiscountStart ? "items-start" : undefined,
          )}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
            <BasePrice
              amount={value.amount}
              currencyCode={value.currencyCode}
              className={cn(
                "inline-flex shrink-0 items-baseline gap-0.5 text-base font-semibold text-neutral-900",
                className,
              )}
              currencyCodeClassName={currencyClasses}
            />
            {resolvedBadge ? (
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full bg-emerald-500/10 px-1 py-0.5 text-[9px] font-medium text-emerald-600",
                  badgeClassName,
                )}
              >
                {resolvedBadge}
              </span>
            ) : null}
          </div>
          {converted ? (
            <BasePrice
              amount={converted.amount}
              currencyCode={converted.currencyCode}
              className={cn(
                "inline-flex items-baseline gap-0.5 text-xs font-medium text-neutral-500",
                convertedClassName,
              )}
              currencyCodeClassName={convertedCurrencyClasses}
              prefix={convertedPrefix}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      <div className="flex items-baseline gap-2">
        <BasePrice
          amount={value.amount}
          currencyCode={value.currencyCode}
          className={cn("inline-flex items-baseline gap-1", className)}
          currencyCodeClassName={currencyClasses}
        />
        {resolvedBadge ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600",
              badgeClassName,
            )}
          >
            {resolvedBadge}
          </span>
        ) : null}
      </div>
      {showConvertedPrice && converted ? (
        <BasePrice
          amount={converted.amount}
          currencyCode={converted.currencyCode}
          className={cn(
            "inline-flex items-baseline gap-1 text-sm font-medium text-neutral-500",
            convertedClassName,
          )}
          currencyCodeClassName={convertedCurrencyClasses}
          prefix={convertedPrefix}
        />
      ) : null}
    </div>
  );
}
