import type { Cart } from "../types";
import { coupons } from "../mock-data";
import { formatAmount, getCurrency } from "../utils";
import {
  createEmptyCart,
  loadCart,
  saveCart,
  normalizeCartTotals,
  evaluateCouponDiscount,
} from "./cart-utils";

async function ensureCartInstance(): Promise<Cart> {
  const existing = await loadCart();

  if (existing) {
    return existing;
  }

  const cart = createEmptyCart();
  await saveCart(cart);
  return cart;
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

export async function applyCouponToCart(code: string): Promise<Cart> {
  const cart = await ensureCartInstance();
  const coupon = findCouponByCode(code);

  if (!coupon) {
    throw new Error(`Coupon ${code} not found`);
  }

  cart.appliedCoupons = cart.appliedCoupons ?? [];

  const exists = cart.appliedCoupons.some(
    (entry) => entry.coupon.code.toLowerCase() === coupon.code.toLowerCase(),
  );

  if (!exists) {
    const subtotalValue = cart.lines.reduce(
      (acc, line) => acc + Number(line.cost.totalAmount.amount),
      0,
    );
    const currencyCode = getCurrency(cart.lines, cart.appliedCoupons);
    const discountPreview = evaluateCouponDiscount(coupon, subtotalValue);

    if (discountPreview <= 0 && coupon.minimumSubtotal) {
      throw new Error("Coupon requirements not met");
    }

    cart.appliedCoupons.push({
      coupon,
      amount: { amount: formatAmount(discountPreview), currencyCode },
    });
  }

  normalizeCartTotals(cart);
  await saveCart(cart);

  return cart;
}

export async function removeCouponFromCart(code: string): Promise<Cart> {
  const cart = await ensureCartInstance();

  cart.appliedCoupons = (cart.appliedCoupons ?? []).filter(
    (entry) => entry.coupon.code.toLowerCase() !== code.trim().toLowerCase(),
  );

  normalizeCartTotals(cart);
  await saveCart(cart);

  return cart;
}
