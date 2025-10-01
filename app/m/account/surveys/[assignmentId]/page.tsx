import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccountSurveyDetail } from "@/app/_shared/account/survey-detail";

export const metadata: Metadata = {
  title: "问卷详情",
  description: "查看并填写处方药合规问卷。",
};

type MobileAccountSurveyDetailPageProps = {
  params: Promise<{
    assignmentId: string;
  }>;
};

export default async function MobileAccountSurveyDetailPage({
  params,
}: MobileAccountSurveyDetailPageProps) {
  const { assignmentId } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <header className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <Link
            href="/account/surveys"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm active:scale-95"
            aria-label="返回我的审核"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              问卷详情
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              补充处方药信息与凭证，确保审核顺畅。
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-6">
        <AccountSurveyDetail assignmentId={assignmentId} showBackLink={false} />
      </div>
    </div>
  );
}
