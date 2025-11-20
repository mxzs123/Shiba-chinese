import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutClient } from "@/app/_shared/checkout/CheckoutClient";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import { parseSelectedMerchandiseIds } from "@/components/cart/cart-selection";
import type { Cart } from "lib/types";
import {
  getCart,
  getCurrentUser,
  getUserById,
  getShippingMethods,
  getPaymentMethods,
  getAvailableCoupons,
} from "lib/api";

export const metadata: Metadata = {
  title: "结算",
  description:
    "确认收货地址、配送方式和支付方式，完成订单提交。",
};

/**
 * 检测购物车中是否包含处方药品
 */
function containsPrescriptionProduct(cart?: Cart): boolean {
  if (!cart) return false;

  return cart.lines.some((line) => {
    const tags = line.merchandise.product.tags || [];
    return tags.some(
      (tag) =>
        tag.toLowerCase() === "prescription" ||
        tag.toLowerCase().startsWith("rx:"),
    );
  });
}

export default async function CheckoutPage() {
  const cookieStore = await cookies();

  // 并发获取所有必需数据
  const [cart, customer, demoUser, shippingMethods, paymentMethods, availableCoupons] =
    await Promise.all([
      getCart(),
      getCurrentUser(),
      getUserById("user-demo"), // demo 用户作为降级
      getShippingMethods(),
      getPaymentMethods(),
      getAvailableCoupons(),
    ]);

  // 未登录时使用 demo 用户
  const effectiveCustomer = customer || demoUser;

  // 获取选中的商品 ID
  const selectedMerchandiseCookie = cookieStore.get(
    CART_SELECTED_MERCHANDISE_COOKIE,
  )?.value;
  const selectedMerchandiseIds = parseSelectedMerchandiseIds(
    selectedMerchandiseCookie,
  );

  // 检测是否包含处方商品
  const requiresPrescriptionReview = containsPrescriptionProduct(cart);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-0">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900">确认订单</h1>
        <p className="mt-2 text-sm text-neutral-500">
          请确认收货地址、配送方式和支付方式
        </p>
      </header>
      <CheckoutClient
        cart={cart}
        customer={effectiveCustomer}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        availableCoupons={availableCoupons}
        selectedMerchandiseIds={selectedMerchandiseIds}
        requiresPrescriptionReview={requiresPrescriptionReview}
        variant="desktop"
      />
    </div>
  );
}
