import { cookies } from "next/headers";
import type {
  AppliedCoupon,
  Cart,
  CartItem,
  Product,
  ProductVariant,
} from "../types";
import { defaultCurrency, findVariantById } from "../mock-data";
import { checkoutUrl as checkoutFallback } from "../mock-data";
import { formatAmount, getCurrency, getCartCookieOptions } from "../utils";
import { CART_ID_COOKIE, CART_STATE_COOKIE } from "../utils/cookie";
import {
  createCartSnapshot,
  encodeCartSnapshot,
  decodeCartSnapshot,
  hydrateCartFromSnapshot,
} from "./cart-snapshot";
import type { CartLineOptions } from "./types";

const CHECKOUT_URL = process.env.COMMERCE_CHECKOUT_URL || checkoutFallback;

export function createEmptyCart(initialId?: string): Cart {
  const id = initialId ?? crypto.randomUUID();

  return {
    id,
    checkoutUrl: CHECKOUT_URL,
    lines: [],
    appliedCoupons: [],
    totalQuantity: 0,
    cost: {
      subtotalAmount: { amount: "0.00", currencyCode: defaultCurrency },
      totalAmount: { amount: "0.00", currencyCode: defaultCurrency },
      totalTaxAmount: { amount: "0.00", currencyCode: defaultCurrency },
      discountAmount: { amount: "0.00", currencyCode: defaultCurrency },
    },
    updatedAt: new Date().toISOString(),
  };
}

export async function saveCart(cart: Cart) {
  cart.updatedAt = new Date().toISOString();

  try {
    const cookieStore = await cookies();
    const snapshot = createCartSnapshot(cart);
    const encoded = encodeCartSnapshot(snapshot);
    const cartCookieOptions = await getCartCookieOptions();

    cookieStore.set({
      name: CART_STATE_COOKIE,
      value: encoded,
      ...cartCookieOptions,
    });

    cookieStore.set({
      name: CART_ID_COOKIE,
      value: cart.id,
      ...cartCookieOptions,
    });
  } catch (error) {
    // Best-effort persistence: environments without writable cookies can ignore failures.
  }
}

export async function loadCart(): Promise<Cart | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return undefined;
  }

  const encodedSnapshot = cookieStore.get(CART_STATE_COOKIE)?.value;

  if (!encodedSnapshot) {
    return undefined;
  }

  const snapshot = decodeCartSnapshot(encodedSnapshot);

  if (!snapshot || snapshot.id !== cartId) {
    return undefined;
  }

  const cart = hydrateCartFromSnapshot(snapshot);

  return cart;
}

export function upsertCartLine(
  cart: Cart,
  variant: ProductVariant,
  quantity: number,
  options?: CartLineOptions,
) {
  const targetLineId =
    options?.lineId !== undefined ? String(options.lineId) : variant.id;
  const existingLine = cart.lines.find(
    (line) => line.id === targetLineId || line.merchandise.id === variant.id,
  );
  const price = Number(variant.price.amount);
  const currencyCode = variant.price.currencyCode || defaultCurrency;
  const newQuantity = (existingLine?.quantity || 0) + quantity;

  if (newQuantity <= 0) {
    cart.lines = cart.lines.filter(
      (line) => line.merchandise.id !== variant.id,
    );
    return;
  }

  const lineTotal = formatAmount(price * newQuantity);

  const line: CartItem = {
    id: targetLineId,
    quantity: newQuantity,
    cost: {
      totalAmount: {
        amount: lineTotal,
        currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: {
        id: variant.id,
        handle: "",
        title: variant.title,
        featuredImage: {
          url: "",
          altText: variant.title,
          width: 800,
          height: 800,
        },
      },
    },
  };

  const backendMetadata = options?.backend || existingLine?.backend;
  if (backendMetadata) {
    line.backend = {
      ...backendMetadata,
      lineId: backendMetadata.lineId || targetLineId,
    };
  }

  const productMatch = options?.product || findVariantById(variant.id)?.product;

  if (productMatch) {
    line.merchandise.product = {
      id: productMatch.id,
      handle: productMatch.handle,
      title: productMatch.title,
      featuredImage: productMatch.featuredImage,
    };
  }

  if (existingLine) {
    cart.lines = cart.lines.map((entry) =>
      entry.merchandise.id === variant.id ? line : entry,
    );
  } else {
    cart.lines.push(line);
  }
}

export function setCartLine(
  cart: Cart,
  variant: ProductVariant,
  quantity: number,
  options?: CartLineOptions,
) {
  const currencyCode = variant.price.currencyCode || defaultCurrency;
  const normalizedLineId =
    options?.lineId !== undefined ? String(options.lineId) : variant.id;

  if (quantity <= 0) {
    cart.lines = cart.lines.filter(
      (line) =>
        line.id !== normalizedLineId && line.merchandise.id !== variant.id,
    );
    return;
  }

  const lineTotal = formatAmount(Number(variant.price.amount) * quantity);
  const productMatch = options?.product || findVariantById(variant.id)?.product;

  const lineId = normalizedLineId;
  const line: CartItem = {
    id: lineId,
    quantity,
    cost: {
      totalAmount: {
        amount: lineTotal,
        currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: variant.title,
      selectedOptions: variant.selectedOptions,
      product: productMatch
        ? {
            id: productMatch.id,
            handle: productMatch.handle,
            title: productMatch.title,
            featuredImage: productMatch.featuredImage,
          }
        : {
            id: variant.id,
            handle: "",
            title: variant.title,
            featuredImage: {
              url: "",
              altText: variant.title,
              width: 800,
              height: 800,
            },
          },
    },
  };

  if (options?.backend) {
    line.backend = {
      ...options.backend,
      lineId: options.backend.lineId || lineId,
    };
  }

  const existingIndex = cart.lines.findIndex(
    (line) => line.id === lineId || line.merchandise.id === variant.id,
  );

  if (existingIndex >= 0) {
    cart.lines[existingIndex] = line;
  } else {
    cart.lines.push(line);
  }
}

export function normalizeCartTotals(cart: Cart) {
  cart.appliedCoupons = cart.appliedCoupons ?? [];

  const {
    currencyCode,
    subtotalAmount,
    discountAmount,
    totalAmount,
    totalQuantity,
  } = calculateCartTotals(cart.lines, cart.appliedCoupons);

  cart.totalQuantity = totalQuantity;
  cart.cost = {
    subtotalAmount: { amount: subtotalAmount, currencyCode },
    totalAmount: { amount: totalAmount, currencyCode },
    totalTaxAmount: { amount: "0.00", currencyCode },
    discountAmount: { amount: discountAmount, currencyCode },
  };
}

export function calculateCartTotals(
  lines: CartItem[],
  appliedCoupons: AppliedCoupon[] | undefined,
) {
  const totalQuantity = lines.reduce((acc, line) => acc + line.quantity, 0);
  const subtotalValue = lines.reduce(
    (acc, line) => acc + Number(line.cost.totalAmount.amount),
    0,
  );
  const currencyCode = getCurrency(lines, appliedCoupons);
  const discountValue = recalculateAppliedCoupons(
    appliedCoupons,
    subtotalValue,
    currencyCode,
  );
  const totalValue = Math.max(subtotalValue - discountValue, 0);

  return {
    totalQuantity,
    subtotalAmount: formatAmount(subtotalValue),
    discountAmount: formatAmount(discountValue),
    totalAmount: formatAmount(totalValue),
    currencyCode,
  };
}

function recalculateAppliedCoupons(
  appliedCoupons: AppliedCoupon[] | undefined,
  subtotalValue: number,
  currencyCode: string,
) {
  let totalDiscount = 0;

  appliedCoupons?.forEach((entry) => {
    const discount = evaluateCouponDiscount(entry.coupon, subtotalValue);
    totalDiscount += discount;
    entry.amount = {
      amount: formatAmount(discount),
      currencyCode: entry.amount.currencyCode || currencyCode,
    };
  });

  return totalDiscount;
}

export function evaluateCouponDiscount(
  coupon: import("../types").Coupon,
  subtotalValue: number,
) {
  if (coupon.minimumSubtotal) {
    const minimum = Number(coupon.minimumSubtotal.amount);
    if (subtotalValue < minimum) {
      return 0;
    }
  }

  let discount = 0;

  switch (coupon.type) {
    case "percentage":
      discount = (subtotalValue * coupon.value) / 100;
      break;
    case "fixed_amount":
      discount = coupon.value;
      break;
    case "free_shipping":
      discount = 0;
      break;
    default:
      discount = 0;
      break;
  }

  return Math.min(discount, subtotalValue);
}
