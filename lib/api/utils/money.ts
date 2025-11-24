import type { AppliedCoupon, CartItem, Money } from "../types";
import { defaultCurrency } from "../mock-data";

export function cloneMoney(money: Money): Money {
  return { ...money };
}

export function formatAmount(value: number): string {
  return value.toFixed(2);
}

export function getCurrency(
  lines: CartItem[],
  appliedCoupons: AppliedCoupon[] | undefined,
) {
  return (
    lines[0]?.cost.totalAmount.currencyCode ||
    appliedCoupons?.[0]?.amount.currencyCode ||
    defaultCurrency
  );
}
