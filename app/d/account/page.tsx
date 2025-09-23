import type { Metadata } from "next";

import { AccountOrdersPanel, AccountShell } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "个人中心",
  description: "查看订单、管理账户与偏好设置。",
};

const NAV_ITEMS = [
  {
    key: "orders",
    label: "订单管理",
    description: "查看历史订单与物流状态",
    href: "/account",
  },
];

export default function AccountPage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={NAV_ITEMS}
      activeItem="orders"
    >
      <AccountOrdersPanel />
    </AccountShell>
  );
}
