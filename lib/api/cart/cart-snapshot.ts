import type { Cart, CurrencyCode } from "../types";
import { defaultCurrency, findVariantById } from "../mock-data";
import { findGoodsVariantByObjectId as lookupGoodsVariantByObjectId } from "../goods";
import type { CartSnapshot } from "./types";
import { createEmptyCart, setCartLine, normalizeCartTotals } from "./cart-utils";
import { coupons } from "../mock-data";

export function createCartSnapshot(cart: Cart): CartSnapshot {
  return {
    id: cart.id,
    lines: cart.lines.map((line) => ({
      merchandiseId: line.merchandise.id,
      quantity: line.quantity,
      lineId: line.id,
      backend: line.backend,
    })),
    appliedCoupons: (cart.appliedCoupons ?? []).map(
      (entry) => entry.coupon.code,
    ),
    updatedAt: cart.updatedAt ?? new Date().toISOString(),
  };
}

export function encodeCartSnapshot(snapshot: CartSnapshot): string {
  return Buffer.from(JSON.stringify(snapshot), "utf-8").toString("base64url");
}

export function decodeCartSnapshot(value: string): CartSnapshot | undefined {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf-8"),
    ) as CartSnapshot;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    return parsed;
  } catch (error) {
    return undefined;
  }
}

function findCouponByCode(code: string) {
  const normalised = code.trim().toLowerCase();
  if (!normalised) {
    return undefined;
  }

  return coupons.find(
    (entry) => entry.code.trim().toLowerCase() === normalised,
  );
}

export function hydrateCartFromSnapshot(snapshot: CartSnapshot): Cart {
  const cart = createEmptyCart(snapshot.id);

  snapshot.lines.forEach((entry) => {
    const match =
      findVariantById(entry.merchandiseId) ||
      (entry.backend?.objectId
        ? lookupGoodsVariantByObjectId(entry.backend.objectId)
        : undefined);

    if (!match) {
      return;
    }

    setCartLine(cart, match.variant, entry.quantity, {
      lineId: entry.lineId || entry.backend?.lineId,
      backend: entry.backend,
      product: match.product,
    });
  });

  const appliedCoupons = snapshot.appliedCoupons
    .map((code) => findCouponByCode(code))
    .filter((coupon): coupon is import("../types").Coupon => Boolean(coupon))
    .map((coupon) => ({
      coupon,
      amount: {
        amount: "0.00",
        currencyCode: defaultCurrency as CurrencyCode,
      },
    }));

  cart.appliedCoupons = appliedCoupons;
  normalizeCartTotals(cart);
  const fallbackUpdatedAt = cart.updatedAt ?? new Date().toISOString();
  cart.updatedAt = snapshot.updatedAt ?? fallbackUpdatedAt;

  return cart;
}
