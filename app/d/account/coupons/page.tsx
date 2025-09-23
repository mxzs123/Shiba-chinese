import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountCouponsPanel,
  AccountShell,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "优惠券管理",
  description: "查看账户优惠券并支持输入兑换码。",
};

export default function AccountCouponsPage() {
  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="coupons"
    >
      <AccountCouponsPanel />
    </AccountShell>
  );
}
