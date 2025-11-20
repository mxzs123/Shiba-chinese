import type { Metadata } from "next";
import { cookies } from "next/headers";

import { CheckoutClient } from "@/app/_shared/checkout/CheckoutClient";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";
import type { Cart } from "lib/api/types";
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
  description: "确认收货地址、配送方式和支付方式，完成订单提交。",
};

/**
 * 检测购物车中是否包含处方药品
 * 注意：CartProduct 类型不包含 tags，暂时返回 false
 * TODO: 需要扩展 CartProduct 类型或使用其他方式检测处方药
 */
function containsPrescriptionProduct(_cart?: Cart): boolean {
  // CartProduct 类型不包含 tags 属性，无法检测处方药
  // 需要后端 API 支持或扩展 CartProduct 类型
  return false;
}

export default async function CheckoutPage() {
  const cookieStore = await cookies();

  // 并发获取购物车与基础数据；用户信息单独处理以规避 demo 账号缺失导致的崩溃。
  const cartPromise = getCart();
  const shippingMethodsPromise = getShippingMethods();
  const paymentMethodsPromise = getPaymentMethods();
  const availableCouponsPromise = getAvailableCoupons();
  const customer = await getCurrentUser();
  const demoUser = customer
    ? undefined
    : await getUserById("user-demo").catch(() => undefined); // demo 用户作为降级，失败时忽略
  const [cart, shippingMethods, paymentMethods, availableCoupons] =
    await Promise.all([
      cartPromise,
      shippingMethodsPromise,
      paymentMethodsPromise,
      availableCouponsPromise,
    ]);
  const effectiveCustomer = customer || demoUser;

  // 获取选中的商品 ID
  const selectedMerchandiseCookie = cookieStore.get(
    CART_SELECTED_MERCHANDISE_COOKIE,
  )?.value;
  const selectedMerchandiseIds = parseSelectedMerchandiseIds(
    selectedMerchandiseCookie,
  );
  const filteredCart = filterCartBySelectedMerchandise(
    cart,
    new Set(selectedMerchandiseIds),
  );

  // 检测是否包含处方商品
  const requiresPrescriptionReview = containsPrescriptionProduct(filteredCart);

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
