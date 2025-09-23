import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountOrdersPanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "订单管理",
  description: "查看历史订单、物流状态与费用明细。",
};

export default function AccountOrdersPage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="orders"
    >
      <AccountOrdersPanel />
    </AccountShell>
  );
}
