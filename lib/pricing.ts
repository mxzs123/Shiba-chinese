import type { Money } from "./api/types";

export function isDiscountedPrice(
  current: Money,
  original?: Money | null,
): boolean {
  if (!original) {
    return false;
  }

  const currentAmount = Number.parseFloat(current.amount);
  const originalAmount = Number.parseFloat(original.amount);

  if (Number.isNaN(currentAmount) || Number.isNaN(originalAmount)) {
    return false;
  }

  return originalAmount > currentAmount;
}

