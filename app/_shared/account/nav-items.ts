export const ACCOUNT_NAV_ITEMS = [
  {
    key: "orders",
    label: "订单管理",
    description: "查看历史订单与物流状态",
    href: "/account",
  },
] as const;

export type AccountNavKey = (typeof ACCOUNT_NAV_ITEMS)[number]["key"];
