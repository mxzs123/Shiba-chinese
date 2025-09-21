"use server";

import { TAGS } from "lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from "lib/api";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CART_ID_COOKIE = "cartId";
const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

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

    if (!cookieStore.get(CART_ID_COOKIE)) {
      cookieStore.set({
        name: CART_ID_COOKIE,
        value: cart.id,
        ...CART_COOKIE_OPTIONS,
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
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function redirectToCheckout() {
  const cookieStore = await cookies();
  let cart = await getCart();

  if (!cart) {
    cart = await createCart();
    cookieStore.set({
      name: CART_ID_COOKIE,
      value: cart.id,
      ...CART_COOKIE_OPTIONS,
    });
  }

  redirect(cart.checkoutUrl);
}

export async function createCartAndSetCookie() {
  const cookieStore = await cookies();
  const cart = await createCart();

  cookieStore.set({
    name: CART_ID_COOKIE,
    value: cart.id,
    ...CART_COOKIE_OPTIONS,
  });
}
