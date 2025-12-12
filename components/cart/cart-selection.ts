import { CART_SELECTED_MERCHANDISE_DELIMITER } from "./constants";
import type {
  AppliedCoupon,
  Cart,
  CartItem,
  Coupon,
  Money,
  CurrencyCode,
} from "@/lib/api/types";

const DEFAULT_CURRENCY: CurrencyCode = "USD";

function createMoney(amount: number, currencyCode: CurrencyCode): Money {
  return {
    amount: amount.toFixed(2),
    currencyCode,
  };
}

function determineCurrency(
  lines: CartItem[],
  fallbackCurrency?: CurrencyCode,
): CurrencyCode {
  return (
    lines[0]?.cost.totalAmount.currencyCode ||
    fallbackCurrency ||
    DEFAULT_CURRENCY
  );
}

export function parseSelectedMerchandiseIds(
  raw: string | undefined | null,
): string[] {
  if (!raw) {
    return [];
  }

  let decoded = raw;

  try {
    decoded = decodeURIComponent(raw);
  } catch (error) {
    // Ignore malformed URI sequences so we can still attempt to parse the raw value.
  }

  return decoded
    .split(CART_SELECTED_MERCHANDISE_DELIMITER)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function serializeSelectedMerchandiseIds(ids: Iterable<string>): string {
  return Array.from(ids).join(CART_SELECTED_MERCHANDISE_DELIMITER);
}

function evaluateCouponDiscount(coupon: Coupon, subtotalValue: number) {
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

function recalculateAppliedCoupons(
  appliedCoupons: AppliedCoupon[] | undefined,
  subtotalValue: number,
  currencyCode: CurrencyCode,
) {
  // TODO_BACKEND: 接入 /api/Cart/GetCartAvailableCoupon 后移除本地折扣估算逻辑。
  if (!appliedCoupons || appliedCoupons.length === 0) {
    return {
      totalDiscount: 0,
      coupons: appliedCoupons,
    };
  }

  let totalDiscount = 0;
  const coupons = appliedCoupons.map((entry) => {
    const discount = evaluateCouponDiscount(entry.coupon, subtotalValue);
    totalDiscount += discount;

    return {
      ...entry,
      amount: createMoney(discount, entry.amount.currencyCode || currencyCode),
    };
  });

  return {
    totalDiscount,
    coupons,
  };
}

export function calculateTotalsForLines(
  lines: CartItem[],
  fallbackCurrency?: CurrencyCode,
  appliedCoupons?: AppliedCoupon[],
) {
  const currencyCode = determineCurrency(lines, fallbackCurrency);

  const subtotalValue = lines.reduce(
    (sum, line) => sum + Number(line.cost.totalAmount.amount),
    0,
  );
  const totalQuantity = lines.reduce((sum, line) => sum + line.quantity, 0);

  const subtotalAmount = createMoney(subtotalValue, currencyCode);
  const { totalDiscount, coupons } = recalculateAppliedCoupons(
    appliedCoupons,
    subtotalValue,
    currencyCode,
  );
  const discountAmount = createMoney(totalDiscount, currencyCode);
  const totalAmountValue = Math.max(subtotalValue - totalDiscount, 0);

  return {
    totalQuantity,
    subtotalAmount,
    totalAmount: createMoney(totalAmountValue, currencyCode),
    discountAmount,
    totalTaxAmount: createMoney(0, currencyCode),
    appliedCoupons: coupons,
  };
}

export function rebuildCartWithSelectedLines(
  cart: Cart,
  selectedLines: CartItem[],
) {
  const {
    totalQuantity,
    subtotalAmount,
    totalAmount,
    discountAmount,
    totalTaxAmount,
    appliedCoupons,
  } = calculateTotalsForLines(
    selectedLines,
    cart.cost.totalAmount.currencyCode,
    cart.appliedCoupons,
  );

  return {
    ...cart,
    lines: selectedLines,
    totalQuantity,
    cost: {
      ...cart.cost,
      subtotalAmount,
      totalAmount,
      totalTaxAmount,
      discountAmount,
    },
    appliedCoupons,
  };
}

export function filterCartBySelectedMerchandise(
  cart: Cart | undefined,
  selectedMerchandiseIds: Iterable<string> | undefined,
) {
  if (!cart) {
    return cart;
  }

  const ids = selectedMerchandiseIds
    ? Array.from(selectedMerchandiseIds)
    : undefined;

  if (!ids?.length) {
    return cart;
  }

  const idSet = new Set(ids);
  const selectedLines = cart.lines.filter((line) =>
    idSet.has(line.merchandise.id),
  );

  if (!selectedLines.length) {
    return rebuildCartWithSelectedLines(cart, []);
  }

  return rebuildCartWithSelectedLines(cart, selectedLines);
}

export function filterIdsByAvailableLines(
  selectedIds: Iterable<string>,
  availableLines: CartItem[],
) {
  const availableSet = new Set(
    availableLines.map((line) => line.merchandise.id),
  );

  return Array.from(selectedIds).filter((id) => availableSet.has(id));
}

export function buildDefaultSelection(lines: CartItem[]) {
  return new Set(lines.map((line) => line.merchandise.id));
}
