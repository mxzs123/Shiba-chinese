import type { Metadata } from "next";

import {
  ACCOUNT_NAV_ITEMS,
  AccountShell,
  AccountSurveysPanel,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "我的问卷",
  description: "查看处方药问卷的待办与历史记录。",
};

type AccountSurveysPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AccountSurveysPage({
  searchParams,
}: AccountSurveysPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const highlightParam = resolvedSearchParams?.highlight;
  const highlightPending = Array.isArray(highlightParam)
    ? highlightParam.includes("pending")
    : highlightParam === "pending";

  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="surveys"
    >
      <AccountSurveysPanel highlightPending={highlightPending} />
    </AccountShell>
  );
}
