import type { Metadata } from "next";

import { CheckoutResult, checkoutResultPlaceholders } from "@/app/_shared";
import { getCurrentUser, getUserOrders } from "lib/api";
import type { Order } from "lib/api/types";

export const metadata: Metadata = {
  title: "支付成功",
  description: "感谢下单，我们已收到支付并开始备货。",
};

function getLatestOrder(orders: Order[]): Order | undefined {
  if (!orders.length) {
    return undefined;
  }

  return orders.slice().sort((a, b) => {
    const aTime = new Date(a.processedAt || a.createdAt).getTime();
    const bTime = new Date(b.processedAt || b.createdAt).getTime();
    return bTime - aTime;
  })[0];
}

export default async function CheckoutSuccessPage() {
  const customer = await getCurrentUser();
  const orders = customer ? await getUserOrders(customer.id) : [];
  const latestOrder = getLatestOrder(orders);

  return (
    <CheckoutResult
      variant="success"
      title="支付成功，订单已确认"
      description="我们已收到您的支付请求，仓库正在安排备货。发货后会通过短信与邮箱通知物流单号。"
      primaryAction={{
        ...checkoutResultPlaceholders.continueShopping,
        href: "/search",
      }}
      secondaryActions={[
        {
          label: "返回首页",
          href: "/",
          variant: "secondary",
          prefetch: true,
        },
      ]}
      order={latestOrder}
      tips={[
        {
          title: "配送进度",
          description: "默认 1-2 个工作日内完成出库，节假日期间可能顺延。",
        },
        {
          title: "售后支持",
          description:
            "如需修改地址或开具发票，请在商品发货前联系 support@example.com。",
        },
      ]}
    />
  );
}
