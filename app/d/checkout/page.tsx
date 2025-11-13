import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OneTimeCheckout } from "@/app/_shared/checkout/OneTimeCheckout";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";
import { getCart } from "lib/api";

export const metadata: Metadata = {
  title: "结算",
  description:
    "填写一次性收货与联系信息，提交后我们将线下与您确认支付与发货。",
};

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const cart = await getCart();

  const selectedMerchandiseCookie = cookieStore.get(
    CART_SELECTED_MERCHANDISE_COOKIE,
  )?.value;
  const selectedMerchandiseIds = parseSelectedMerchandiseIds(
    selectedMerchandiseCookie,
  );
  const checkoutCart = cart
    ? filterCartBySelectedMerchandise(cart, selectedMerchandiseIds)
    : cart;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">确认订单</h1>
        <p className="mt-2 text-sm text-neutral-500">
          填写一次性收货与联系信息，提交后我们将线下与您确认支付与发货。
        </p>
      </header>
      <OneTimeCheckout cart={checkoutCart} />
    </div>
  );
}
