export const ACCOUNT_NAV_ITEMS = [
  {
    key: "profile",
    label: "个人信息",
    description: "更新联系信息，保持账户资料准确。",
    href: "/account/profile",
  },
  {
    key: "addresses",
    label: "收货地址",
    description: "维护常用地址，快速选择默认收货信息。",
    href: "/account/addresses",
  },
  {
    key: "coupons",
    label: "优惠券",
    description: "查看账户可用优惠券并输入兑换码。",
    href: "/account/coupons",
  },
  {
    key: "membership",
    label: "会员权益",
    description: "了解当前等级、积分余额与专属权益。",
    href: "/account/membership",
  },
  {
    key: "orders",
    label: "订单管理",
    description: "查看历史订单与物流状态",
    href: "/account/orders",
  },
] as const;

export type AccountNavKey = (typeof ACCOUNT_NAV_ITEMS)[number]["key"];
