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

type AccountProfilePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountProfilePage({
  searchParams,
}: AccountProfilePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const highlightParam = resolvedSearchParams?.highlight;
  const highlightIdentity = Array.isArray(highlightParam)
    ? highlightParam.includes("identity")
    : highlightParam === "identity";

  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="profile"
    >
      <AccountProfilePanel highlightIdentity={highlightIdentity} />
    </AccountShell>
  );
}
