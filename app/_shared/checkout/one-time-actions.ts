"use server";

import { cookies } from "next/headers";
import { appendRecord, createRecord } from "lib/mock-store";
import { CART_SELECTED_MERCHANDISE_COOKIE } from "@/components/cart/constants";
import { getCart, getCartCookieOptions, removeFromCart } from "lib/api";
import {
  filterCartBySelectedMerchandise,
  parseSelectedMerchandiseIds,
} from "@/components/cart/cart-selection";

type OneTimeOrderInput = {
  name: string;
  phone?: string;
  wechat?: string;
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  address1: string;
  postalCode?: string;
  note?: string;
};

export async function submitOneTimeOrder(
  payload: OneTimeOrderInput,
): Promise<{ success: boolean; data?: { orderId: string }; error?: string }> {
  try {
    const cookieStore = await cookies();
    const selectionCookie = cookieStore.get(
      CART_SELECTED_MERCHANDISE_COOKIE,
    )?.value;
    const selectedIds = parseSelectedMerchandiseIds(selectionCookie);
    const cart = await getCart();
    const checkoutCart = cart
      ? filterCartBySelectedMerchandise(cart, new Set(selectedIds))
      : undefined;

    if (!checkoutCart || checkoutCart.lines.length === 0) {
      return { success: false, error: "购物车为空，无法提交订单。" };
    }

    const orderId = `ORD-${Date.now()}`;
    const orderSnapshot = {
      orderId,
      submittedAt: new Date().toISOString(),
      contact: {
        name: payload.name,
        phone: payload.phone || null,
        wechat: payload.wechat || null,
      },
      address: {
        country: payload.country || "中国",
        province: payload.province || "",
        city: payload.city || "",
        district: payload.district || "",
        address1: payload.address1,
        postalCode: payload.postalCode || "",
      },
      note: payload.note || "",
      items: checkoutCart.lines.map((line) => ({
        title: line.merchandise.product.title,
        skuTitle: line.merchandise.title,
        quantity: line.quantity,
        amount: line.cost.totalAmount.amount,
        currency: line.cost.totalAmount.currencyCode,
      })),
      totals: checkoutCart.cost,
      ua: undefined as string | undefined,
      referer: undefined as string | undefined,
    };

    // 1) 本地持久化（内测）
    await appendRecord(createRecord("one_time_order", orderSnapshot));

    // 2) Slack 推送（可选）
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (webhook) {
      const blocks = [
        {
          type: "header",
          text: { type: "plain_text", text: `新的一次性订单 ${orderId}` },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*姓名*: ${payload.name}` },
            { type: "mrkdwn", text: `*电话*: ${payload.phone || "-"}` },
            { type: "mrkdwn", text: `*微信*: ${payload.wechat || "-"}` },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*地址*: ${[payload.country, payload.province, payload.city, payload.district, payload.address1].filter(Boolean).join(" ")}${payload.postalCode ? `（${payload.postalCode}）` : ""}`,
          },
        },
        ...(payload.note
          ? [
              {
                type: "section",
                text: { type: "mrkdwn", text: `*备注*: ${payload.note}` },
              },
            ]
          : []),
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: checkoutCart.lines
              .map(
                (l) =>
                  `• ${l.merchandise.product.title} × ${l.quantity} —— ${l.cost.totalAmount.amount} ${l.cost.totalAmount.currencyCode}`,
              )
              .join("\n"),
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `应付总计：${checkoutCart.cost.totalAmount.amount} ${checkoutCart.cost.totalAmount.currencyCode}`,
            },
          ],
        },
      ];
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blocks }),
        });
      } catch {
        // Slack 推送失败不阻断下单
      }
    }

    // 3) 清空购物车 + 清理选择 Cookie
    try {
      if (checkoutCart.lines.length > 0) {
        await removeFromCart(
          checkoutCart.lines.map((l) => l.id || l.merchandise.id),
        );
      }
      const cookieOptions = await getCartCookieOptions();
      // 清除“结算选择的行”
      const ck = await cookies();
      ck.set({
        name: CART_SELECTED_MERCHANDISE_COOKIE,
        value: "",
        maxAge: 0,
        path: "/",
        httpOnly: false,
        sameSite: "lax",
      });
    } catch {
      // 忽略清空失败
    }

    return { success: true, data: { orderId } };
  } catch (error: any) {
    return { success: false, error: error?.message || "系统繁忙，请稍后再试" };
  }
}
