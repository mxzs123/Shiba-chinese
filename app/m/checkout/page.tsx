import type { Metadata } from "next";
import { cookies } from "next/headers";

import { OneTimeCheckout } from "@/app/_shared/checkout/OneTimeCheckout";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import { MobileHeader } from "@/components/layout/mobile-header";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";
import { getCart, getNotifications } from "lib/api";

export const metadata: Metadata = {
  title: "结算",
  description:
    "填写一次性收货与联系信息，提交后我们将线下与您确认支付与发货。",
};

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const [cart, notifications] = await Promise.all([
    getCart(),
    getNotifications(),
  ]);

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
    <div className="w-full bg-neutral-50">
      <MobileHeader
        notifications={notifications}
        leadingVariant="back"
        showSearchInput={false}
      />
      <header className="mb-4 px-4 pt-4">
        <h1 className="text-xl font-semibold text-neutral-900">确认订单</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          填写一次性收货与联系信息，提交后我们将线下与您确认支付与发货。
        </p>
      </header>
      <div className="px-4 pb-8">
        <OneTimeCheckout cart={checkoutCart} variant="mobile" />
      </div>
    </div>
  );
}
