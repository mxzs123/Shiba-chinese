import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";
import { AccountCouponsPanel } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "优惠券管理",
  description: "查看账户优惠券并支持输入兑换码。",
};

export default function MobileAccountCouponsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
      <MobileContentContainer className="pt-6">
        <header className="flex items-center gap-3">
          <Link
            href="/account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm active:scale-95"
            aria-label="返回我的"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">优惠券</h1>
            <p className="mt-1 text-xs text-neutral-500">
              查看优惠券状态，输入兑换码即可添加到账户。
            </p>
          </div>
        </header>
      </MobileContentContainer>

      <MobileContentContainer className="flex-1 pt-0">
        <AccountCouponsPanel
          variant="mobile"
          showTitle={false}
          showDescription={false}
        />
      </MobileContentContainer>
    </div>
  );
}
