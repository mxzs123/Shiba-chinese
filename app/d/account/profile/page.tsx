import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountProfilePanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "个人信息管理",
  description: "更新姓名与联系方式，保持账户资料最新。",
};

export default function AccountProfilePage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="profile"
    >
      <AccountProfilePanel />
    </AccountShell>
  );
}
