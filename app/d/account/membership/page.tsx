import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountMembershipPanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "会员权益",
  description: "查看当前会员等级、积分余额与权益信息。",
};

export default function AccountMembershipPage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="membership"
    >
      <AccountMembershipPanel />
    </AccountShell>
  );
}
