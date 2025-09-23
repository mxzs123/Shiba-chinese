import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountOrdersPanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "个人中心",
  description: "查看订单、管理账户与偏好设置。",
};

export default function AccountPage() {
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
