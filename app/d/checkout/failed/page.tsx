import type { Metadata } from "next";

import { CheckoutResult, checkoutResultPlaceholders } from "@/app/_shared";

export const metadata: Metadata = {
  title: "支付未完成",
  description: "支付通道暂未确认付款，请重新尝试或更换方式。",
};

export default function CheckoutFailedPage() {
  return (
    <CheckoutResult
      variant="failed"
      title="支付未完成"
      description="支付请求尚未完成，可能是扫码超时或资金方未确认。您可以重新返回结算页调整支付方式。"
      primaryAction={{
        ...checkoutResultPlaceholders.retryPayment,
        href: "/checkout",
      }}
      secondaryActions={[
        {
          label: "返回购物车",
          href: "/cart",
          variant: "secondary",
          prefetch: true,
        },
        {
          label: "联系客户支持",
          href: "mailto:support@example.com",
          variant: "link",
          prefetch: false,
        },
      ]}
      tips={[
        {
          title: "常见原因",
          description:
            "微信 / 支付宝扫码超过 5 分钟会失效，建议刷新二维码重新扫码。",
        },
        {
          title: "支付限制",
          description: "若银行风控限制扫码额度，可改用其他银行卡或分次支付。",
        },
        {
          title: "仍需协助？",
          description:
            "在重新发起支付前，您也可以截图当前页面发送给客服，加速排查。",
        },
      ]}
    />
  );
}
