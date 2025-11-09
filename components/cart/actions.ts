"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  CART_ID_COOKIE,
  createCart,
  getCart,
  getCartCookieOptions,
  getVariantById,
  removeFromCart,
  shouldUseSecureCookies,
  updateCart,
} from "lib/api";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  CART_SELECTED_MERCHANDISE_COOKIE,
  CART_SELECTED_MERCHANDISE_FORM_FIELD,
  CART_SELECTED_MERCHANDISE_MAX_AGE,
} from "./constants";
import {
  parseSelectedMerchandiseIds,
  serializeSelectedMerchandiseIds,
} from "./cart-selection";

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
  quantity = 1,
) {
  if (!selectedVariantId) {
    return "Error adding item to cart";
  }

  try {
    const cookieStore = await cookies();
    const normalizedQuantity = Math.max(
      1,
      Number.isFinite(quantity) ? quantity : 1,
    );
    const variantInfo = await getVariantById(selectedVariantId);

    if (!variantInfo) {
      return "Error adding item to cart";
    }

    const backendMeta = variantInfo.variant.backend;
    const payload =
      backendMeta && typeof backendMeta.objectId === "number"
        ? [
            {
              productId: backendMeta.productId,
              objectId: backendMeta.objectId,
              type: backendMeta.type ?? 0,
              cartType: backendMeta.cartType ?? 0,
              groupId: backendMeta.groupId,
              nums: normalizedQuantity,
            },
          ]
        : [{ merchandiseId: selectedVariantId, quantity: normalizedQuantity }];

    const cart = await addToCart(payload);

    const existingCartId = cookieStore.get(CART_ID_COOKIE)?.value;

    if (existingCartId !== cart.id) {
      const cartCookieOptions = await getCartCookieOptions();
      cookieStore.set({
        name: CART_ID_COOKIE,
        value: cart.id,
        ...cartCookieOptions,
      });
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    return "Error adding item to cart";
  }
}

export async function removeItem(prevState: any, lineIdentifier: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) =>
        line.id === lineIdentifier || line.merchandise.id === lineIdentifier,
    );

    if (lineItem && lineItem.id) {
      await removeFromCart([lineItem.id]);
      revalidateTag(TAGS.cart);
    } else {
      return "Item not found in cart";
    }
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    lineId?: string;
    merchandiseId: string;
    quantity: number;
  },
) {
  const { lineId, merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.id === lineId || line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else if (lineItem.backend?.objectId !== undefined) {
        await updateCart([
          {
            id: lineItem.id,
            nums: quantity,
            objectId: lineItem.backend.objectId,
          },
        ]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId: lineItem.merchandise.id,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      const fallbackVariant = await getVariantById(merchandiseId);

      if (
        fallbackVariant?.variant.backend?.objectId !== undefined &&
        fallbackVariant.variant.backend.productId !== undefined
      ) {
        await addToCart([
          {
            productId: fallbackVariant.variant.backend.productId,
            objectId: fallbackVariant.variant.backend.objectId,
            type: fallbackVariant.variant.backend.type ?? 0,
            cartType: fallbackVariant.variant.backend.cartType ?? 0,
            groupId: fallbackVariant.variant.backend.groupId,
            nums: quantity,
          },
        ]);
      } else {
        await addToCart([{ merchandiseId, quantity }]);
      }
    }

    revalidateTag(TAGS.cart);
  } catch (e) {
    // 错误已在调用方处理，这里只记录到开发控制台
    if (process.env.NODE_ENV === "development") {
      console.error("[Cart Action Error]", e);
    }
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout(formData: FormData) {
  const cookieStore = await cookies();
  const selectionField = formData.get(CART_SELECTED_MERCHANDISE_FORM_FIELD);

  const secureCookies = await shouldUseSecureCookies();
  const selectionCookieBase = {
    sameSite: "lax" as const,
    path: "/",
    secure: secureCookies,
  };

  if (typeof selectionField === "string") {
    const parsedSelection = parseSelectedMerchandiseIds(selectionField);

    if (parsedSelection.length > 0) {
      cookieStore.set({
        name: CART_SELECTED_MERCHANDISE_COOKIE,
        value: serializeSelectedMerchandiseIds(parsedSelection),
        ...selectionCookieBase,
        maxAge: CART_SELECTED_MERCHANDISE_MAX_AGE,
      });
    } else {
      cookieStore.set({
        name: CART_SELECTED_MERCHANDISE_COOKIE,
        value: "",
        ...selectionCookieBase,
        maxAge: 0,
      });
    }
  }

  let cart = await getCart();

  if (!cart) {
    cart = await createCart();
  }

  const existingCartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (existingCartId !== cart.id) {
    const cartCookieOptions = await getCartCookieOptions();
    cookieStore.set({
      name: CART_ID_COOKIE,
      value: cart.id,
      ...cartCookieOptions,
    });
  }

  redirect("/checkout");
}

export async function createCartAndSetCookie() {
  const cookieStore = await cookies();
  const cart = await createCart();

  const existingCartId = cookieStore.get(CART_ID_COOKIE)?.value;

  if (existingCartId !== cart.id) {
    const cartCookieOptions = await getCartCookieOptions();
    cookieStore.set({
      name: CART_ID_COOKIE,
      value: cart.id,
      ...cartCookieOptions,
    });
  }
}
