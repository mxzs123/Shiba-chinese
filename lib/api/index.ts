import { TAGS } from "lib/constants";
import {
  checkoutUrl as checkoutFallback,
  collections,
  coupons,
  defaultCurrency,
  findCollectionByHandle,
  findProductByHandle,
  findVariantById,
  loyaltyAccounts,
  listVisibleCollections,
  menus,
  news,
  notifications,
  orders,
  paymentMethods,
  pages,
  products,
  surveyAssignments,
  surveyTemplates,
  shippingMethods,
  pointRules,
  users,
} from "./mock-data";
import {
  findGoodsProductByBackendId as lookupGoodsProductByBackendId,
  findGoodsProductByHandle as lookupGoodsProductByHandle,
  findGoodsProductByInternalId as lookupGoodsProductByInternalId,
  findGoodsVariantByObjectId as lookupGoodsVariantByObjectId,
  mockGetGoodsRecommendList,
} from "./goods";
import {
  cloneAddress,
  cloneCustomerCoupon,
  cloneIdentityVerification,
  clonePointAccount,
  cloneSurveyAnswer,
  cloneSurveyAssignment,
  cloneSurveyTemplate,
  cloneUser,
  createAddressRecord,
  formatAddressLines,
} from "./serializers";
import type {
  Address,
  AddressInput,
  AppliedCoupon,
  BackendApiResponse,
  Cart,
  CartItem,
  CartDeleteInput,
  CartLineInput,
  CartListRequest,
  Collection,
  Coupon,
  CurrencyCode,
  CustomerCoupon,
  Menu,
  Order,
  Page,
  PaymentMethod,
  PointAccount,
  PointRule,
  Product,
  ProductVariant,
  ShippingMethod,
  SurveyAnswer,
  SurveyAssignment,
  SurveyTemplate,
  User,
  UserProfileInput,
  Money,
  Notification,
  NotificationCategory,
  IdentityVerification,
  IdentityDocumentInput,
  NewsArticle,
} from "./types";
import { cookies, headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromSessionCookie } from "./auth-store";

export const CART_ID_COOKIE = "cartId";
const CART_STATE_COOKIE = "cartState";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
type ForwardedHeader = string | null | undefined;

function normalizeProto(value: ForwardedHeader) {
  if (!value) {
    return undefined;
  }

  const [first] = value.split(",");
  if (!first) {
    return undefined;
  }

  return first
    .trim()
    .replace(/^proto=/i, "")
    .replace(/"/g, "")
    .toLowerCase();
}

function extractProtoFromForwarded(value: ForwardedHeader) {
  if (!value) {
    return undefined;
  }

  const segments = value.split(";");
  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed.toLowerCase().startsWith("proto=")) {
      return normalizeProto(trimmed);
    }
  }

  return undefined;
}

export async function shouldUseSecureCookies(): Promise<boolean> {
  try {
    const headerStore = await headers();

    const forwardedProto = normalizeProto(
      headerStore.get("x-forwarded-proto") ||
        headerStore.get("x-forwarded-protocol"),
    );

    if (forwardedProto) {
      return forwardedProto === "https";
    }

    const forwarded = extractProtoFromForwarded(headerStore.get("forwarded"));
    if (forwarded) {
      return forwarded === "https";
    }

    const forwardedSsl = headerStore.get("x-forwarded-ssl");
    if (forwardedSsl) {
      return forwardedSsl.trim().toLowerCase() === "on";
    }

    const cfVisitor = headerStore.get("cf-visitor");
    if (cfVisitor) {
      try {
        const parsed = JSON.parse(cfVisitor);
        const scheme = typeof parsed?.scheme === "string" ? parsed.scheme : "";
        if (scheme) {
          return scheme.toLowerCase() === "https";
        }
      } catch (error) {
        // ignore malformed JSON
      }
    }
  } catch (error) {
    // Fallback handled below
  }

  return false;
}

export async function getCartCookieOptions() {
  const secure = await shouldUseSecureCookies();

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure,
    maxAge: CART_COOKIE_MAX_AGE,
  };
}

type CartStore = Map<string, Cart>;

type GlobalCartStore = typeof globalThis & {
  __COMMERCE_CART_STORE__?: CartStore;
};

const globalCartStore = globalThis as GlobalCartStore;

type CartSnapshotLine = {
  merchandiseId: string;
  quantity: number;
  lineId?: string;
  backend?: CartItem["backend"];
};

type CartSnapshot = {
  id: string;
  lines: CartSnapshotLine[];
  appliedCoupons: string[];
  updatedAt?: string;
};

const CHECKOUT_URL = process.env.COMMERCE_CHECKOUT_URL || checkoutFallback;

function cloneMoney(money: Money): Money {
  return { ...money };
}

function cloneNewsArticle(article: NewsArticle): NewsArticle {
  return {
    ...article,
    tags: article.tags ? [...article.tags] : undefined,
  };
}

function findUserRecord(userId: string) {
  return users.find((user) => user.id === userId);
}

function findSurveyAssignmentRecord(assignmentId: string) {
  return surveyAssignments.find((assignment) => assignment.id === assignmentId);
}

function findSurveyTemplateRecord(templateId: string) {
  return surveyTemplates.find((template) => template.id === templateId);
}

function cloneShippingMethod(method: ShippingMethod): ShippingMethod {
  return {
    ...method,
    price: cloneMoney(method.price),
  };
}

function clonePaymentMethod(method: PaymentMethod): PaymentMethod {
  return { ...method };
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function getCurrency(
  lines: CartItem[],
  appliedCoupons: AppliedCoupon[] | undefined,
) {
  return (
    lines[0]?.cost.totalAmount.currencyCode ||
    appliedCoupons?.[0]?.amount.currencyCode ||
    defaultCurrency
  );
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

function findCouponByCode(code: string) {
  const normalised = code.trim().toLowerCase();
  if (!normalised) {
    return undefined;
  }

  return coupons.find(
    (entry) => entry.code.trim().toLowerCase() === normalised,
  );
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

function calculateCartTotals(
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

function createCartSnapshot(cart: Cart): CartSnapshot {
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

function encodeCartSnapshot(snapshot: CartSnapshot): string {
  return Buffer.from(JSON.stringify(snapshot), "utf-8").toString("base64url");
}

function decodeCartSnapshot(value: string): CartSnapshot | undefined {
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

function hydrateCartFromSnapshot(snapshot: CartSnapshot): Cart {
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
    .filter((coupon): coupon is Coupon => Boolean(coupon))
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

type GetNotificationsOptions = {
  categories?: NotificationCategory[];
};

export async function getNotifications(
  options?: GetNotificationsOptions,
): Promise<Notification[]> {
  const categories = options?.categories;
  const filtered = categories?.length
    ? notifications.filter((entry) => categories.includes(entry.category))
    : notifications;

  return filtered
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return shippingMethods.map(cloneShippingMethod);
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return paymentMethods.map(clonePaymentMethod);
}

export async function getCustomerAddresses(userId: string): Promise<Address[]> {
  const user = findUserRecord(userId);

  if (!user) {
    return [];
  }

  return user.addresses.map(cloneAddress);
}

export async function addCustomerAddress(
  userId: string,
  payload: AddressInput,
): Promise<Address> {
  return upsertCustomerAddress(userId, payload);
}

export async function upsertCustomerAddress(
  userId: string,
  payload: AddressInput,
): Promise<Address> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const addressRecord = createAddressRecord(payload);
  const existing = addressRecord.id
    ? user.addresses.find((entry) => entry.id === addressRecord.id)
    : undefined;

  if (existing) {
    Object.assign(existing, addressRecord);
  } else {
    user.addresses.push(addressRecord);
  }

  if (addressRecord.isDefault) {
    user.addresses = user.addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === addressRecord.id,
      formatted: entry.formatted || formatAddressLines(entry),
    }));
    user.defaultAddress = user.addresses.find(
      (entry) => entry.id === addressRecord.id,
    );
  } else if (!user.defaultAddress) {
    addressRecord.isDefault = true;
    user.defaultAddress = addressRecord;
  } else if (
    existing &&
    user.defaultAddress?.id === existing.id &&
    !existing.isDefault
  ) {
    const fallbackCandidate =
      user.addresses.find(
        (entry) => entry.isDefault && entry.id !== existing.id,
      ) ||
      user.addresses.find((entry) => entry.id !== existing.id) ||
      user.addresses[0];

    if (fallbackCandidate) {
      user.addresses = user.addresses.map((entry) => ({
        ...entry,
        isDefault: entry.id === fallbackCandidate.id,
        formatted: entry.formatted || formatAddressLines(entry),
      }));
      user.defaultAddress = user.addresses.find(
        (entry) => entry.id === fallbackCandidate.id,
      );
    } else {
      user.defaultAddress = undefined;
    }
  }

  const updated = existing ?? addressRecord;

  return cloneAddress({
    ...updated,
    formatted: updated.formatted || formatAddressLines(updated),
  });
}

export async function setDefaultCustomerAddress(
  userId: string,
  addressId: string,
): Promise<Address | undefined> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const target = user.addresses.find((entry) => entry.id === addressId);

  if (!target) {
    throw new Error("Address not found");
  }

  user.addresses = user.addresses.map((entry) => ({
    ...entry,
    isDefault: entry.id === addressId,
    formatted: entry.formatted || formatAddressLines(entry),
  }));

  const defaultAddress = user.addresses.find((entry) => entry.id === addressId);
  user.defaultAddress = defaultAddress;

  return defaultAddress ? cloneAddress(defaultAddress) : undefined;
}

export async function deleteCustomerAddress(
  userId: string,
  addressId: string,
): Promise<Address[]> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const wasDefault = user.defaultAddress?.id === addressId;

  user.addresses = user.addresses
    .filter((entry) => entry.id !== addressId)
    .map((entry) => ({
      ...entry,
      formatted: entry.formatted || formatAddressLines(entry),
    }));

  if (wasDefault) {
    const fallback = user.addresses[0];
    if (fallback) {
      fallback.isDefault = true;
      user.defaultAddress = fallback;
    } else {
      user.defaultAddress = undefined;
    }
  } else if (
    user.defaultAddress &&
    !user.addresses.some((entry) => entry.id === user.defaultAddress?.id)
  ) {
    user.defaultAddress = user.addresses.find((entry) => entry.isDefault);
  }

  return user.addresses.map(cloneAddress);
}

function createEmptyCart(initialId?: string): Cart {
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

function getCartStore(): CartStore {
  if (!globalCartStore.__COMMERCE_CART_STORE__) {
    globalCartStore.__COMMERCE_CART_STORE__ = new Map<string, Cart>();
  }

  return globalCartStore.__COMMERCE_CART_STORE__;
}

async function saveCart(cart: Cart) {
  cart.updatedAt = new Date().toISOString();
  const store = getCartStore();
  store.set(cart.id, cart);

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

async function loadCart(): Promise<Cart | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return undefined;
  }

  const store = getCartStore();
  const existing = store.get(cartId);

  if (existing) {
    return existing;
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
  store.set(cart.id, cart);

  return cart;
}

async function ensureCartInstance(): Promise<Cart> {
  const existing = await loadCart();

  if (existing) {
    return existing;
  }

  return createCart();
}

type CartLineOptions = {
  lineId?: string | number;
  backend?: CartItem["backend"];
  product?: Product;
};

function upsertCartLine(
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

function setCartLine(
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

function normalizeCartTotals(cart: Cart) {
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

function serializeProducts(list: typeof products): Product[] {
  return list.map(
    ({ collections: _collections, bestsellerRank: _rank, ...rest }) => rest,
  );
}

function sortProducts(
  list: typeof products,
  sortKey: string | undefined,
  reverse: boolean | undefined,
) {
  const sorted = [...list];

  switch (sortKey) {
    case "PRICE":
      sorted.sort(
        (a, b) =>
          Number(a.priceRange.maxVariantPrice.amount) -
          Number(b.priceRange.maxVariantPrice.amount),
      );
      break;
    case "CREATED_AT":
      sorted.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      break;
    case "BEST_SELLING":
      sorted.sort((a, b) => a.bestsellerRank - b.bestsellerRank);
      break;
    default:
      break;
  }

  if (reverse) {
    sorted.reverse();
  }

  return sorted;
}

export async function createCart(): Promise<Cart> {
  const cart = createEmptyCart();
  await saveCart(cart);

  return cart;
}

type LegacyAddLine = { merchandiseId: string; quantity: number };

function isLegacyAddLine(
  line: CartLineInput | LegacyAddLine,
): line is LegacyAddLine {
  return typeof (line as LegacyAddLine).merchandiseId === "string";
}

export async function addToCart(
  lines: (CartLineInput | LegacyAddLine)[],
): Promise<Cart> {
  const cart = await ensureCartInstance();

  for (const line of lines) {
    if (isLegacyAddLine(line)) {
      const match = findVariantById(line.merchandiseId);

      if (!match) {
        continue;
      }

      upsertCartLine(cart, match.variant, line.quantity, {
        product: match.product,
      });
      continue;
    }

    const quantity = Math.max(1, Math.round(line.nums));
    const match =
      lookupGoodsVariantByObjectId(line.objectId) ||
      findVariantById(String(line.objectId));

    if (!match) {
      continue;
    }

    const backendMeta = {
      lineId: `line-${line.objectId}`,
      productId: line.productId,
      objectId: line.objectId,
      cartType: line.cartType,
      type: line.type,
      groupId: line.groupId,
    };

    upsertCartLine(cart, match.variant, quantity, {
      lineId: backendMeta.lineId,
      backend: backendMeta,
      product: match.product,
    });
  }

  normalizeCartTotals(cart);
  await saveCart(cart);

  return cart;
}

export async function removeFromCart(
  entries: (string | CartDeleteInput)[],
): Promise<Cart> {
  const cart = await ensureCartInstance();
  const lineIds = entries.map((entry) =>
    typeof entry === "string" ? entry : String(entry.id),
  );

  cart.lines = cart.lines.filter((line) =>
    line.id ? !lineIds.includes(line.id) : true,
  );
  normalizeCartTotals(cart);
  await saveCart(cart);

  return cart;
}

type LegacyUpdateLine = { id: string; merchandiseId: string; quantity: number };
type BackendUpdateLine = { id: string; nums: number; objectId?: number };

function isLegacyUpdateLine(
  line: LegacyUpdateLine | BackendUpdateLine,
): line is LegacyUpdateLine {
  return typeof (line as LegacyUpdateLine).merchandiseId === "string";
}

export async function updateCart(
  lines: (LegacyUpdateLine | BackendUpdateLine)[],
): Promise<Cart> {
  const cart = await ensureCartInstance();

  for (const line of lines) {
    if (isLegacyUpdateLine(line)) {
      const match = findVariantById(line.merchandiseId);

      if (!match) {
        continue;
      }

      setCartLine(cart, match.variant, line.quantity, {
        lineId: line.id,
        product: match.product,
      });
      continue;
    }

    const quantity = Math.max(0, Math.round(line.nums));
    const targetLine = cart.lines.find(
      (entry) => entry.id === line.id || entry.backend?.lineId === line.id,
    );

    if (!targetLine) {
      continue;
    }

    if (quantity === 0) {
      cart.lines = cart.lines.filter((entry) => entry.id !== targetLine.id);
      continue;
    }

    const variantMatch =
      (targetLine.backend?.objectId
        ? lookupGoodsVariantByObjectId(targetLine.backend.objectId)
        : undefined) ||
      (line.objectId ? lookupGoodsVariantByObjectId(line.objectId) : undefined) ||
      findVariantById(targetLine.merchandise.id);

    if (!variantMatch) {
      continue;
    }

    setCartLine(cart, variantMatch.variant, quantity, {
      lineId: targetLine.id,
      backend: targetLine.backend,
      product: variantMatch.product ?? targetLine.merchandise.product,
    });
  }

  normalizeCartTotals(cart);
  await saveCart(cart);

  return cart;
}

export async function getCart(): Promise<Cart | undefined> {
  const cart = await loadCart();

  if (!cart) {
    return undefined;
  }

  normalizeCartTotals(cart);
  return cart;
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

export async function getAvailableCoupons(): Promise<Coupon[]> {
  return coupons.map((entry) => ({ ...entry }));
}

export async function getCartAvailableCoupons(
  payload?: CartListRequest,
): Promise<BackendApiResponse<Coupon[]>> {
  const data = await getAvailableCoupons();

  return {
    methodDescription: null,
    otherData: payload ? JSON.stringify(payload) : null,
    status: true,
    msg: "接口响应成功",
    data,
    code: 0,
  };
}

export async function getCouponByCode(
  code: string,
): Promise<Coupon | undefined> {
  const coupon = findCouponByCode(code);

  if (!coupon) {
    return undefined;
  }

  return { ...coupon };
}

export async function getCustomerCoupons(
  userId: string,
): Promise<CustomerCoupon[]> {
  const user = findUserRecord(userId);

  if (!user || !user.coupons) {
    return [];
  }

  return user.coupons.map(cloneCustomerCoupon);
}

function determineCouponState(
  coupon: Coupon,
): "active" | "scheduled" | "expired" {
  const now = Date.now();

  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return "scheduled";
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return "expired";
  }

  return "active";
}

export async function redeemCouponForUser(
  userId: string,
  code: string,
): Promise<CustomerCoupon> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const coupon = findCouponByCode(code);

  if (!coupon) {
    throw new Error("优惠券不存在或已下架");
  }

  user.coupons = user.coupons ?? [];

  const exists = user.coupons.some(
    (entry) => entry.coupon.code.toLowerCase() === coupon.code.toLowerCase(),
  );

  if (exists) {
    throw new Error("该优惠券已在账户中，无需重复兑换");
  }

  const state = determineCouponState(coupon);
  const now = new Date().toISOString();

  const customerCoupon: CustomerCoupon = {
    id: `user-coupon-${crypto.randomUUID()}`,
    coupon,
    state,
    assignedAt: now,
    expiresAt: coupon.expiresAt,
    source: "兑换码输入",
  };

  user.coupons.push(customerCoupon);
  user.updatedAt = now;

  return cloneCustomerCoupon(customerCoupon);
}

export async function getCurrentUser(): Promise<User | undefined> {
  return getUserFromSessionCookie();
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = users.find((entry) => entry.id === id);
  return user ? cloneUser(user) : undefined;
}

export async function updateUserProfile(
  userId: string,
  input: UserProfileInput,
): Promise<User> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (input.firstName !== undefined) {
    user.firstName = input.firstName.trim();
  }

  if (input.lastName !== undefined) {
    user.lastName = input.lastName.trim();
  }

  if (input.nickname !== undefined) {
    user.nickname = input.nickname.trim() || undefined;
  }

  if (input.phone !== undefined) {
    user.phone = input.phone.trim() || undefined;
  }

  user.updatedAt = new Date().toISOString();

  return cloneUser(user);
}

export async function getIdentityVerification(
  userId: string,
): Promise<IdentityVerification | undefined> {
  const user = findUserRecord(userId);

  if (!user?.identityVerification) {
    return undefined;
  }

  return cloneIdentityVerification(user.identityVerification);
}

export async function submitIdentityVerification(
  userId: string,
  input: IdentityDocumentInput,
): Promise<IdentityVerification> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!input.frontImage || !input.backImage) {
    throw new Error("身份证正反面均需上传");
  }

  const uploadedAt = new Date().toISOString();
  user.identityVerification = {
    status: "verified",
    document: {
      frontImageUrl: input.frontImage,
      backImageUrl: input.backImage,
      uploadedAt,
    },
  };
  user.updatedAt = uploadedAt;

  return cloneIdentityVerification(user.identityVerification);
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  return orders.filter((order) => order.customerId === userId);
}

export async function getOrderById(
  orderId: string,
): Promise<Order | undefined> {
  return orders.find((order) => order.id === orderId);
}

export async function getLoyaltyAccount(
  userId: string,
): Promise<PointAccount | undefined> {
  const account = loyaltyAccounts.find((entry) => entry.userId === userId);

  return account ? clonePointAccount(account) : undefined;
}

export async function getPointRules(): Promise<PointRule[]> {
  return pointRules.map((rule) => ({ ...rule }));
}

export async function getSurveyTemplates(): Promise<SurveyTemplate[]> {
  return surveyTemplates.map((template) => cloneSurveyTemplate(template));
}

export async function getSurveyTemplateById(
  templateId: string,
): Promise<SurveyTemplate | undefined> {
  const template = findSurveyTemplateRecord(templateId);
  return template ? cloneSurveyTemplate(template) : undefined;
}

export async function getSurveyAssignmentsByUser(
  userId: string,
): Promise<SurveyAssignment[]> {
  return surveyAssignments
    .filter((assignment) => assignment.userId === userId)
    .map((assignment) => cloneSurveyAssignment(assignment));
}

export async function getSurveyAssignmentById(
  assignmentId: string,
): Promise<SurveyAssignment | undefined> {
  const assignment = findSurveyAssignmentRecord(assignmentId);
  return assignment ? cloneSurveyAssignment(assignment) : undefined;
}

function upsertSurveyAnswers(
  assignment: SurveyAssignment,
  answers: SurveyAnswer[],
) {
  assignment.answers = answers.map((answer) => cloneSurveyAnswer(answer));
  assignment.updatedAt = new Date().toISOString();
}

export async function saveSurveyAssignmentDraft(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<SurveyAssignment> {
  const assignment = findSurveyAssignmentRecord(assignmentId);

  if (!assignment) {
    throw new Error("问卷不存在");
  }

  if (assignment.userId !== userId) {
    throw new Error("无权访问该问卷");
  }

  upsertSurveyAnswers(assignment, answers);

  if (assignment.status !== "submitted") {
    assignment.status = "pending";
    assignment.submittedAt = undefined;
  }

  return cloneSurveyAssignment(assignment);
}

export async function submitSurveyAssignment(
  userId: string,
  assignmentId: string,
  answers: SurveyAnswer[],
): Promise<SurveyAssignment> {
  const assignment = findSurveyAssignmentRecord(assignmentId);

  if (!assignment) {
    throw new Error("问卷不存在");
  }

  if (assignment.userId !== userId) {
    throw new Error("无权访问该问卷");
  }

  upsertSurveyAnswers(assignment, answers);
  assignment.status = "submitted";
  assignment.submittedAt = new Date().toISOString();

  return cloneSurveyAssignment(assignment);
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const collection = findCollectionByHandle(handle);

  if (!collection) {
    return undefined;
  }

  const { isHidden: _hidden, ...rest } = collection;
  return rest;
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const filtered = products.filter((product) =>
    product.collections.includes(collection),
  );

  if (!filtered.length) {
    return [];
  }

  const sorted = sortProducts(filtered, sortKey, reverse);

  return serializeProducts(sorted);
}

export async function getLatestNews({
  limit = 3,
}: {
  limit?: number;
} = {}): Promise<NewsArticle[]> {
  const items = await getNews();
  return items.slice(0, Math.max(limit, 0));
}

export async function getHighlightedNewsArticle(): Promise<
  NewsArticle | undefined
> {
  const highlighted = news
    .filter((article) => article.highlight)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

  const [first] = highlighted;

  if (!first) {
    return undefined;
  }

  return cloneNewsArticle(first);
}

export async function getNews(): Promise<NewsArticle[]> {
  const sorted = [...news].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return sorted.map((article) => cloneNewsArticle(article));
}

export async function getNewsArticle(
  slug: string,
): Promise<NewsArticle | undefined> {
  const article = news.find((entry) => entry.slug === slug);

  if (!article) {
    return undefined;
  }

  return cloneNewsArticle(article);
}

export async function getCollections(): Promise<Collection[]> {
  const visibleCollections = listVisibleCollections();

  const collectionsWithPaths = visibleCollections.map(
    ({ isHidden: _hidden, ...rest }) => rest,
  );

  return [
    {
      handle: "",
      title: "全部商品",
      description: "浏览所有上架商品",
      seo: {
        title: "全部商品",
        description: "浏览所有上架商品",
      },
      updatedAt: new Date().toISOString(),
      path: "/search",
    },
    ...collectionsWithPaths,
  ];
}

export async function getMenu(handle: string): Promise<Menu[]> {
  return menus[handle] || [];
}

export async function getPage(handle: string): Promise<Page | undefined> {
  return pages.find((entry) => entry.handle === handle);
}

export async function getPages(): Promise<Page[]> {
  return pages;
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  const goodsProduct = lookupGoodsProductByHandle(handle);

  if (goodsProduct) {
    return goodsProduct;
  }

  const product = findProductByHandle(handle);

  if (!product) {
    return undefined;
  }

  const { collections: _collections, bestsellerRank: _rank, ...rest } = product;

  return rest;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const goodsProduct = lookupGoodsProductByInternalId(id);

  if (goodsProduct) {
    return goodsProduct;
  }

  const product = products.find((entry) => entry.id === id);

  if (!product) {
    return undefined;
  }

  const { collections: _collections, bestsellerRank: _rank, ...rest } = product;

  return rest;
}

export async function getVariantById(
  variantId: string,
): Promise<{ product: Product; variant: ProductVariant } | undefined> {
  const match = findVariantById(variantId);

  if (!match) {
    return undefined;
  }

  const productRecord = match.product as Product & {
    collections?: string[];
    bestsellerRank?: number;
  };

  const { collections: _collections, bestsellerRank: _rank, ...rest } =
    productRecord;

  return {
    product: rest,
    variant: match.variant,
  };
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const goodsProduct = lookupGoodsProductByInternalId(productId);

  if (goodsProduct?.backend?.productId) {
    const response = await mockGetGoodsRecommendList({
      id: goodsProduct.backend.productId,
    });

    if (response.status && response.data) {
      return response.data;
    }
  }

  const filtered = products.filter((product) => product.id !== productId);

  return serializeProducts(filtered.slice(0, 4));
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  let filtered = [...products];

  if (query) {
    const normalised = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(normalised) ||
        product.description.toLowerCase().includes(normalised),
    );
  }

  const sorted = sortProducts(filtered, sortKey, reverse);

  return serializeProducts(sorted);
}

export {
  mockGetAllGoodsCategories as getAllGoodsCategories,
  mockGetGoodsDetail as getGoodsDetail,
  mockGetGoodsPageList as getGoodsPageList,
  mockGetGoodsRecommendList as getGoodsRecommendList,
  mockGetProductInfo as getBackendProductInfo,
  findGoodsProductByHandle,
  findGoodsProductByBackendId,
  findGoodsProductByInternalId,
  findGoodsVariantByObjectId,
} from "./goods";

export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    // 安全相关错误，只在开发环境输出
    if (process.env.NODE_ENV === "development") {
      console.error("[API] Invalid revalidation secret.");
    }
    return NextResponse.json({ status: 401 });
  }

  const headerStore = await headers();
  const topic = headerStore.get("x-commerce-topic");

  if (!topic) {
    revalidateTag(TAGS.products);
    revalidateTag(TAGS.collections);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
