import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AccountProfilePanel } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "个人信息管理",
  description: "更新姓名与联系方式，保持账户资料最新。",
};

export default function MobileAccountProfilePage() {
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
              个人信息
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              更新姓名与联系方式，保持账户资料最新。
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pb-6">
        <AccountProfilePanel showHeader={false} />
      </div>
    </div>
  );
}
