"use server";

import { TAGS } from "lib/constants";
import {
  addCustomerAddress,
  applyCouponToCart,
  getCart,
  getCustomerAddresses,
  removeCouponFromCart,
  setDefaultCustomerAddress,
  redeemCouponForUser,
} from "lib/api";
import type {
  Address,
  AddressInput,
  Cart,
  Coupon,
  CustomerCoupon,
  PaymentMethod,
  ShippingMethod,
  User,
  CurrencyCode,
} from "lib/api/types";
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

export async function redeemCouponCodeAction(
  userId: string,
  code: string,
): Promise<
  ActionResult<{
    coupon: Coupon;
    customerCoupon: CustomerCoupon;
  }>
> {
  const trimmed = code.trim();

  if (!trimmed) {
    return {
      success: false,
      error: "请输入优惠券兑换码",
    };
  }

  try {
    const customerCoupon = await redeemCouponForUser(userId, trimmed);

    return {
      success: true,
      data: {
        coupon: customerCoupon.coupon,
        customerCoupon,
      },
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

// 新增：确认支付并通知（Slack Webhook）
export type ConfirmPaymentPayload = {
  customer?: User;
  address: Address;
  shipping: ShippingMethod;
  payment: PaymentMethod;
  payable: {
    amount: number;
    currencyCode: CurrencyCode | string;
  };
  pointsApplied?: number;
  idempotencyKey?: string;
  note?: string;
  device?: "desktop" | "mobile";
};

export async function confirmPaymentAndNotifyAction(
  payload: ConfirmPaymentPayload,
): Promise<ActionResult<{ postedAt: string }>> {
  try {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    const cart = await getCart();
    if (!cart || cart.lines.length === 0) {
      return { success: false, error: "购物车为空，无法提交订单" };
    }

    const now = new Date();
    const postedAt = now.toISOString();
    const orderNumber = `DEMO-${now.toISOString().replace(/[-:TZ.]/g, "")}`;

    // 如果没有配置 Slack webhook，跳过通知但仍然返回成功
    if (!webhookUrl) {
      console.log("Slack Webhook 未配置，跳过通知");
      return {
        success: true,
        data: { postedAt },
      };
    }

    const amount = Number.isFinite(payload.payable.amount)
      ? payload.payable.amount
      : Number(cart.cost.totalAmount.amount) || 0;

    const currency = (payload.payable.currencyCode ||
      cart.cost.totalAmount.currencyCode) as CurrencyCode;

    const addressLines = (
      payload.address.formatted && payload.address.formatted.length
        ? payload.address.formatted
        : [
            payload.address.address1,
            payload.address.address2,
            [payload.address.city, payload.address.district]
              .filter(Boolean)
              .join(" "),
            [payload.address.province, payload.address.postalCode]
              .filter(Boolean)
              .join(" "),
            `${payload.address.country} (${payload.address.countryCode})`,
          ]
    ).filter(Boolean);

    const cartLines = cart.lines.map((line) => {
      return `• ${line.merchandise.product.title} / ${line.merchandise.title} × ${line.quantity} = ${line.cost.totalAmount.amount} ${line.cost.totalAmount.currencyCode}`;
    });

    const coupons = (cart.appliedCoupons || [])
      .map(
        (c) =>
          `${c.coupon.code} (-${c.amount.amount} ${c.amount.currencyCode})`,
      )
      .join(", ");

    const customerInfo = payload.customer
      ? [
          `姓名：${payload.customer.lastName}${payload.customer.firstName}`,
          payload.customer.email ? `邮箱：${payload.customer.email}` : null,
          payload.customer.phone ? `电话：${payload.customer.phone}` : null,
          payload.customer.nickname
            ? `昵称：${payload.customer.nickname}`
            : null,
        ].filter(Boolean)
      : [];

    const textSummary = [
      `新订单提交（内测） #${orderNumber}`,
      `金额：${amount.toFixed(2)} ${currency}`,
      `支付方式：${payload.payment.name}`,
      `配送方式：${payload.shipping.name} · ${payload.shipping.carrier}`,
      coupons ? `优惠：${coupons}` : null,
      payload.pointsApplied ? `积分抵扣：-${payload.pointsApplied}` : null,
      `地址：${addressLines.join(" / ")}`,
      customerInfo.length ? customerInfo.join(" / ") : null,
      `明细：\n${cartLines.join("\n")}`,
      `来源：${payload.device || "unknown"}`,
      payload.idempotencyKey ? `幂等键：${payload.idempotencyKey}` : null,
      payload.note ? `备注：${payload.note}` : null,
      `时间：${postedAt}`,
    ]
      .filter(Boolean)
      .join("\n");

    const body = {
      text: textSummary,
    };

    // 发送 Slack 通知，失败时不阻断订单提交
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        // Slack webhook 不需要缓存
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error(`Slack 通知失败: ${errText || `HTTP ${res.status}`}`);
        // 不返回错误，继续处理订单
      }
    } catch (slackError) {
      console.error("Slack 通知异常:", slackError);
      // Slack 推送失败不阻断下单
    }

    return {
      success: true,
      data: { postedAt },
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
}
