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
  orders,
  paymentMethods,
  pages,
  products,
  shippingMethods,
  users,
} from "./mock-data";
import type {
  Address,
  AddressInput,
  AppliedCoupon,
  Cart,
  CartItem,
  Collection,
  Coupon,
  Menu,
  Order,
  Page,
  PaymentMethod,
  PointAccount,
  Product,
  ProductVariant,
  ShippingMethod,
  User,
  Money,
} from "./types";
import { cookies, headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const CART_ID_COOKIE = "cartId";

type CartStore = Map<string, Cart>;

type GlobalCartStore = typeof globalThis & {
  __COMMERCE_CART_STORE__?: CartStore;
};

const globalCartStore = globalThis as GlobalCartStore;

const CHECKOUT_URL = process.env.COMMERCE_CHECKOUT_URL || checkoutFallback;

function cloneMoney(money: Money): Money {
  return { ...money };
}

function formatAddressLines(address: Address) {
  const lines = [
    [address.province, address.city, address.district, address.address1]
      .filter(Boolean)
      .join(" "),
    address.address2,
    [address.city, address.country].filter(Boolean).join(" "),
    address.postalCode
      ? `${address.postalCode}${address.countryCode ? ` ${address.countryCode}` : ""}`
      : undefined,
  ].filter((value): value is string =>
    Boolean(value && value.trim().length > 0),
  );

  return lines.length ? lines : undefined;
}

function cloneAddress(address: Address): Address {
  return {
    ...address,
    formatted: address.formatted
      ? [...address.formatted]
      : formatAddressLines(address),
  };
}

function clonePointAccount(account: PointAccount): PointAccount {
  return {
    ...account,
    transactions: account.transactions.map((entry) => ({ ...entry })),
  };
}

function cloneUserRecord(user: User): User {
  return {
    ...user,
    defaultAddress: user.defaultAddress
      ? cloneAddress(user.defaultAddress)
      : undefined,
    addresses: user.addresses.map(cloneAddress),
    loyalty: user.loyalty ? clonePointAccount(user.loyalty) : undefined,
  };
}

function findUserRecord(userId: string) {
  return users.find((user) => user.id === userId);
}

function createAddressRecord(input: AddressInput): Address {
  const address: Address = {
    id: input.id || `addr-${crypto.randomUUID()}`,
    firstName: (input.firstName || "").trim(),
    lastName: (input.lastName || "").trim(),
    phone: input.phone?.trim() || undefined,
    company: input.company?.trim() || undefined,
    country: input.country?.trim() || "中国",
    countryCode: input.countryCode?.trim().toUpperCase() || "CN",
    province: input.province?.trim() || undefined,
    city: (input.city || "").trim(),
    district: input.district?.trim() || undefined,
    postalCode: input.postalCode?.trim() || undefined,
    address1: (input.address1 || "").trim(),
    address2: input.address2?.trim() || undefined,
    isDefault: Boolean(input.isDefault),
  };

  const formatted = formatAddressLines(address);
  if (formatted) {
    address.formatted = formatted;
  }

  return address;
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
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const address = createAddressRecord(payload);

  user.addresses.push(address);

  if (address.isDefault) {
    user.addresses = user.addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === address.id,
      formatted: entry.formatted || formatAddressLines(entry),
    }));
    user.defaultAddress = user.addresses.find(
      (entry) => entry.id === address.id,
    );
  } else if (!user.defaultAddress) {
    user.defaultAddress = address;
    address.isDefault = true;
  }

  return cloneAddress(address);
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

function createEmptyCart(): Cart {
  const id = crypto.randomUUID();

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

function saveCart(cart: Cart) {
  cart.updatedAt = new Date().toISOString();
  const store = getCartStore();
  store.set(cart.id, cart);
}

async function loadCart(): Promise<Cart | undefined> {
  const cookieStore = await cookies();
  const cartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (!cartId) {
    return undefined;
  }

  return getCartStore().get(cartId);
}

async function ensureCartInstance(): Promise<Cart> {
  const existing = await loadCart();

  if (existing) {
    return existing;
  }

  return createCart();
}

function upsertCartLine(cart: Cart, variant: ProductVariant, quantity: number) {
  const existingLine = cart.lines.find(
    (line) => line.merchandise.id === variant.id,
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
    id: variant.id,
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

  const productMatch = findVariantById(variant.id);

  if (productMatch) {
    line.merchandise.product = {
      id: productMatch.product.id,
      handle: productMatch.product.handle,
      title: productMatch.product.title,
      featuredImage: productMatch.product.featuredImage,
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

function setCartLine(cart: Cart, variant: ProductVariant, quantity: number) {
  const currencyCode = variant.price.currencyCode || defaultCurrency;

  if (quantity <= 0) {
    cart.lines = cart.lines.filter(
      (line) => line.merchandise.id !== variant.id,
    );
    return;
  }

  const lineTotal = formatAmount(Number(variant.price.amount) * quantity);
  const productMatch = findVariantById(variant.id);

  const line: CartItem = {
    id: variant.id,
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
            id: productMatch.product.id,
            handle: productMatch.product.handle,
            title: productMatch.product.title,
            featuredImage: productMatch.product.featuredImage,
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

  const existingIndex = cart.lines.findIndex(
    (line) => line.merchandise.id === variant.id,
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
  saveCart(cart);

  return cart;
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cart = await ensureCartInstance();

  for (const line of lines) {
    const match = findVariantById(line.merchandiseId);

    if (!match) {
      continue;
    }

    upsertCartLine(cart, match.variant, line.quantity);
  }

  normalizeCartTotals(cart);
  saveCart(cart);

  return cart;
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cart = await ensureCartInstance();

  cart.lines = cart.lines.filter((line) =>
    line.id ? !lineIds.includes(line.id) : true,
  );
  normalizeCartTotals(cart);
  saveCart(cart);

  return cart;
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cart = await ensureCartInstance();

  for (const line of lines) {
    const match = findVariantById(line.merchandiseId);

    if (!match) {
      continue;
    }

    setCartLine(cart, match.variant, line.quantity);
  }

  normalizeCartTotals(cart);
  saveCart(cart);

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
  saveCart(cart);

  return cart;
}

export async function removeCouponFromCart(code: string): Promise<Cart> {
  const cart = await ensureCartInstance();

  cart.appliedCoupons = (cart.appliedCoupons ?? []).filter(
    (entry) => entry.coupon.code.toLowerCase() !== code.trim().toLowerCase(),
  );

  normalizeCartTotals(cart);
  saveCart(cart);

  return cart;
}

export async function getAvailableCoupons(): Promise<Coupon[]> {
  return coupons.map((entry) => ({ ...entry }));
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

export async function getCurrentUser(): Promise<User | undefined> {
  const user = users[0];
  return user ? cloneUserRecord(user) : undefined;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const user = users.find((entry) => entry.id === id);
  return user ? cloneUserRecord(user) : undefined;
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
  const product = findProductByHandle(handle);

  if (!product) {
    return undefined;
  }

  const { collections: _collections, bestsellerRank: _rank, ...rest } = product;

  return rest;
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
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

export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    console.error("Invalid revalidation secret.");
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
