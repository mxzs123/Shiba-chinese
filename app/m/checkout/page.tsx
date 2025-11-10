import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutClient } from "@/app/_shared";
import { OneTimeCheckout } from "@/app/_shared/checkout/OneTimeCheckout";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import { MobileHeader } from "@/components/layout/mobile-header";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";
import {
  getCartAvailableCoupons,
  getCart,
  getCurrentUser,
  getNotifications,
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
    availableCouponsResponse,
    notifications,
  ] = await Promise.all([
    getCart(),
    getCurrentUser(),
    getUserById("user-demo"),
    getShippingMethods(),
    getPaymentMethods(),
    getCartAvailableCoupons(),
    getNotifications(),
  ]);

  const availableCoupons =
    (availableCouponsResponse.status && availableCouponsResponse.data) || [];

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

  const useOneTime =
    process.env.MOCK_MODE === "1" || process.env.HIDE_ACCOUNT === "1" ||
    process.env.NEXT_PUBLIC_MOCK_MODE === "1" || process.env.NEXT_PUBLIC_HIDE_ACCOUNT === "1";

  return (
    <div className="w-full bg-neutral-50">
      <MobileHeader
        notifications={notifications}
        leadingVariant="back"
        showSearchInput={false}
      />
      <header className="mb-4 px-4 pt-4">
        <h1 className="text-xl font-semibold text-neutral-900">确认订单</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          {useOneTime
            ? "填写一次性收货与联系信息，提交后我们将线下与您确认支付与发货。"
            : "核对收货信息、配送方式与支付方式后提交订单。"}
        </p>
      </header>
      <div className="px-4 pb-8">
        {useOneTime ? (
          <OneTimeCheckout cart={checkoutCart} variant="mobile" />
        ) : (
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
        )}
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
