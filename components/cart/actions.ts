"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  CART_ID_COOKIE,
  createCart,
  getCart,
  getCartCookieOptions,
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
    const cart = await addToCart([
      { merchandiseId: selectedVariantId, quantity: normalizedQuantity },
    ]);

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

export async function removeItem(prevState: any, merchandiseId: string) {
  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
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
    merchandiseId: string;
    quantity: number;
  },
) {
  const { merchandiseId, quantity } = payload;

  try {
    const cart = await getCart();

    if (!cart) {
      return "Error fetching cart";
    }

    const lineItem = cart.lines.find(
      (line) => line.merchandise.id === merchandiseId,
    );

    if (lineItem && lineItem.id) {
      if (quantity === 0) {
        await removeFromCart([lineItem.id]);
      } else {
        await updateCart([
          {
            id: lineItem.id,
            merchandiseId,
            quantity,
          },
        ]);
      }
    } else if (quantity > 0) {
      // If the item doesn't exist in the cart and quantity > 0, add it
      await addToCart([{ merchandiseId, quantity }]);
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
