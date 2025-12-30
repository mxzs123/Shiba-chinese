import type { Cart, CurrencyCode } from "../types";
import { defaultCurrency, findVariantById } from "../mock-data";
import { findGoodsVariantByObjectId as lookupGoodsVariantByObjectId } from "../goods";
import type { CartSnapshot, CartSnapshotLine } from "./types";
import {
  createEmptyCart,
  setCartLine,
  normalizeCartTotals,
} from "./cart-utils";
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
    ) as unknown;

    if (!parsed || typeof parsed !== "object") {
      return undefined;
    }

    const snapshot = parsed as Record<string, unknown>;
    const id = typeof snapshot.id === "string" ? snapshot.id : "";

    if (!id) {
      return undefined;
    }

    const linesInput = Array.isArray(snapshot.lines) ? snapshot.lines : [];
    const lines = linesInput
      .map((line) => {
        if (!line || typeof line !== "object") {
          return undefined;
        }

        const entry = line as Record<string, unknown>;
        const merchandiseId =
          typeof entry.merchandiseId === "string" ? entry.merchandiseId : "";
        const quantity =
          typeof entry.quantity === "number"
            ? entry.quantity
            : typeof entry.quantity === "string"
              ? Number(entry.quantity)
              : Number.NaN;

        if (!merchandiseId || !Number.isFinite(quantity) || quantity <= 0) {
          return undefined;
        }

        const snapshotLine: CartSnapshotLine = {
          merchandiseId,
          quantity,
        };

        if (typeof entry.lineId === "string" && entry.lineId) {
          snapshotLine.lineId = entry.lineId;
        }

        if (entry.backend && typeof entry.backend === "object") {
          snapshotLine.backend = entry.backend as CartSnapshotLine["backend"];
        }

        return snapshotLine;
      })
      .filter((line): line is CartSnapshotLine => Boolean(line));

    const appliedCoupons = Array.isArray(snapshot.appliedCoupons)
      ? snapshot.appliedCoupons.filter(
          (code): code is string => typeof code === "string",
        )
      : [];

    const updatedAt =
      typeof snapshot.updatedAt === "string" ? snapshot.updatedAt : undefined;

    return {
      id,
      lines,
      appliedCoupons,
      updatedAt,
    };
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

  (snapshot.lines ?? []).forEach((entry) => {
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

  const appliedCoupons = (snapshot.appliedCoupons ?? [])
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
