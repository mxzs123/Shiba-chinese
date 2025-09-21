"use server";

import { TAGS } from "lib/constants";
import {
  addCustomerAddress,
  applyCouponToCart,
  getCart,
  getCustomerAddresses,
  removeCouponFromCart,
  setDefaultCustomerAddress,
} from "lib/api";
import type { Address, AddressInput, Cart } from "lib/api/types";
import { revalidateTag } from "next/cache";

type ActionSuccess<T> = {
  success: true;
  data: T;
};

type ActionFailure = {
  success: false;
  error: string;
};

type ActionResult<T> = ActionSuccess<T> | ActionFailure;

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "发生未知错误，请稍后重试";
}

export async function addAddressAction(
  userId: string,
  payload: AddressInput,
): Promise<ActionResult<{ addresses: Address[]; added: Address }>> {
  try {
    const added = await addCustomerAddress(userId, payload);
    const addresses = await getCustomerAddresses(userId);

    return {
      success: true,
      data: { addresses, added },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function setDefaultAddressAction(
  userId: string,
  addressId: string,
): Promise<ActionResult<{ addresses: Address[]; defaultAddress?: Address }>> {
  try {
    const updated = await setDefaultCustomerAddress(userId, addressId);
    const addresses = await getCustomerAddresses(userId);

    return {
      success: true,
      data: { addresses, defaultAddress: updated },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function applyCouponAction(
  code: string,
): Promise<ActionResult<Cart>> {
  try {
    const cart = await applyCouponToCart(code);
    revalidateTag(TAGS.cart);

    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function removeCouponAction(
  code: string,
): Promise<ActionResult<Cart>> {
  try {
    const cart = await removeCouponFromCart(code);
    revalidateTag(TAGS.cart);

    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}

export async function refreshCartAction(): Promise<ActionResult<Cart>> {
  try {
    const cart = await getCart();

    if (!cart) {
      return {
        success: false,
        error: "购物车为空",
      };
    }

    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
