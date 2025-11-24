import type { Coupon } from "lib/api/types";
import { ADDRESS_CACHE_PREFIX } from "../constants";

export function toNumber(amount?: string): number {
  return amount ? Number(amount) : 0;
}

export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}

export function isCouponCurrentlyActive(coupon: Coupon): boolean {
  const now = Date.now();

  if (coupon.startsAt) {
    const startsAt = new Date(coupon.startsAt).getTime();
    if (!Number.isNaN(startsAt) && startsAt > now) {
      return false;
    }
  }

  if (coupon.expiresAt) {
    const expiresAt = new Date(coupon.expiresAt).getTime();
    if (!Number.isNaN(expiresAt) && expiresAt < now) {
      return false;
    }
  }

  return true;
}

export function buildAddressCacheKey(userId?: string | null): string | null {
  return userId ? `${ADDRESS_CACHE_PREFIX}_${userId}` : null;
}
