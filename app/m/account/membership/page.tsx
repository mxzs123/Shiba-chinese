import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";
import { AccountMembershipPanel } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "会员权益",
  description: "查看当前会员等级、积分余额与权益信息。",
};

export default function MobileMembershipPage() {
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
            <h1 className="text-2xl font-semibold text-neutral-900">
              会员权益
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              查看当前等级、积分余额与专属权益
            </p>
          </div>
        </header>
      </MobileContentContainer>
      <MobileContentContainer className="flex-1 pt-0">
        <AccountMembershipPanel variant="mobile" />
      </MobileContentContainer>
    </div>
  );
}
