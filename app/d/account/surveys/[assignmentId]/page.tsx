import type { Metadata } from "next";

import { ACCOUNT_NAV_ITEMS, AccountShell } from "@/app/_shared/account";
import { AccountSurveyDetail } from "@/app/_shared/account/survey-detail";

export const metadata: Metadata = {
  title: "问卷详情",
  description: "查看并填写处方药合规问卷。",
};

type AccountSurveyDetailPageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export default async function AccountSurveyDetailPage({
  params,
}: AccountSurveyDetailPageProps) {
  const { assignmentId } = await params;

  return (
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="surveys"
    >
      <AccountSurveyDetail assignmentId={assignmentId} />
    </AccountShell>
  );
}
