import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountAddressesPanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "收货地址管理",
  description: "维护常用地址，设置默认收货信息。",
};

export default function AccountAddressesPage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="addresses"
    >
      <AccountAddressesPanel />
    </AccountShell>
  );
}
