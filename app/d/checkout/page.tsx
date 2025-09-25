import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutClient } from "@/app/_shared";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";
import {
  getAvailableCoupons,
  getCart,
  getCurrentUser,
  getPaymentMethods,
  getShippingMethods,
  getUserById,
} from "lib/api";

export const metadata: Metadata = {
  title: "结算",
  description: "确认收货信息与支付方式，完成订单提交。",
};

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const [
    cart,
    sessionUser,
    fallbackUser,
    shippingMethods,
    paymentMethods,
    availableCoupons,
  ] = await Promise.all([
    getCart(),
    getCurrentUser(),
    getUserById("user-demo"),
    getShippingMethods(),
    getPaymentMethods(),
    getAvailableCoupons(),
  ]);

  const customer = sessionUser ?? fallbackUser;
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
          核对收货信息、配送方式与支付方式后提交订单。
        </p>
      </header>
      <CheckoutClient
        cart={checkoutCart}
        customer={customer}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        availableCoupons={availableCoupons}
        selectedMerchandiseIds={selectedMerchandiseIds}
      />
    </div>
  );
}
