import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccountSurveysPanel } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "我的问卷",
  description: "查看处方药问卷的待办与历史记录。",
};

type MobileAccountSurveysPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MobileAccountSurveysPage({
  searchParams,
}: MobileAccountSurveysPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const highlightParam = resolvedSearchParams?.highlight;
  const highlightPending = Array.isArray(highlightParam)
    ? highlightParam.includes("pending")
    : highlightParam === "pending";
  const highlightIdentity = Array.isArray(highlightParam)
    ? highlightParam.includes("identity")
    : highlightParam === "identity";

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <header className="px-4 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm active:scale-95"
            aria-label="返回我的"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              我的审核
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              查看处方药问卷待办，补充资料加速药师审核。
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-6">
        <AccountSurveysPanel
          highlightPending={highlightPending}
          highlightIdentity={highlightIdentity}
        />
      </div>
    </div>
  );
}
