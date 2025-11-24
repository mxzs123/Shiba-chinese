import type { Cart, CartDeleteInput, CartLineInput } from "../types";
import { findVariantById } from "../mock-data";
import { findGoodsVariantByObjectId as lookupGoodsVariantByObjectId } from "../goods";
import type { LegacyAddLine, LegacyUpdateLine, BackendUpdateLine } from "./types";
import {
  createEmptyCart,
  loadCart,
  saveCart,
  normalizeCartTotals,
  upsertCartLine,
  setCartLine,
} from "./cart-utils";

async function ensureCartInstance(): Promise<Cart> {
  const existing = await loadCart();

  if (existing) {
    return existing;
  }

  return createCart();
}

function isLegacyAddLine(
  line: CartLineInput | LegacyAddLine,
): line is LegacyAddLine {
  return typeof (line as LegacyAddLine).merchandiseId === "string";
}

function isLegacyUpdateLine(
  line: LegacyUpdateLine | BackendUpdateLine,
): line is LegacyUpdateLine {
  return typeof (line as LegacyUpdateLine).merchandiseId === "string";
}

export async function createCart(): Promise<Cart> {
  const cart = createEmptyCart();
  await saveCart(cart);

  return cart;
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
      (line.objectId
        ? lookupGoodsVariantByObjectId(line.objectId)
        : undefined) ||
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
