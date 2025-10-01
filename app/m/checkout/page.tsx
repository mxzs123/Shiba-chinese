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
  getProductById,
  getShippingMethods,
  getUserById,
} from "lib/api";
import type { Cart } from "lib/api/types";

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

  const requiresPrescriptionReview =
    await cartNeedsPrescriptionReview(checkoutCart);

  return (
    <div className="w-full">
      <header className="mb-4 px-4 pt-6">
        <h1 className="text-2xl font-semibold text-neutral-900">确认订单</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          核对收货信息、配送方式与支付方式后提交订单。
        </p>
      </header>
      <div className="px-4">
        <CheckoutClient
          cart={checkoutCart}
          customer={customer}
          shippingMethods={shippingMethods}
          paymentMethods={paymentMethods}
          availableCoupons={availableCoupons}
          selectedMerchandiseIds={selectedMerchandiseIds}
          requiresPrescriptionReview={requiresPrescriptionReview}
          variant="mobile"
        />
      </div>
    </div>
  );
}

async function cartNeedsPrescriptionReview(cart: Cart | undefined) {
  if (!cart || cart.lines.length === 0) {
    return false;
  }

  const productIds = Array.from(
    new Set(
      cart.lines
        .map((line) => line.merchandise.product.id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (!productIds.length) {
    return false;
  }

  const products = await Promise.all(
    productIds.map(async (productId) => getProductById(productId)),
  );

  return products.some((product) => product?.tags.includes("prescription"));
}