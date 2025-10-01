import type { Metadata } from "next";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { MobileContentContainer } from "@/app/_shared/layouts/mobile-content-container";
import { AccountOrdersView } from "@/app/_shared/account/account-orders-view";
import {
  loadAccountOrdersState,
  type AccountOrdersState,
} from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "订单管理",
  description: "查看历史订单、物流状态与费用明细。",
};

export default async function MobileAccountOrdersPage() {
  const state = await loadAccountOrdersState();

  if (!state) {
    return (
      <div className="flex min-h-screen flex-col bg-neutral-50 pb-24">
        <MobileContentContainer className="flex flex-1 items-center justify-center pt-12 text-center text-sm text-neutral-500">
          暂未获取到示例用户数据，请稍后再试。
        </MobileContentContainer>
      </div>
    );
  }

  const { orders, displayName, compliance }: AccountOrdersState = state;

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
          <h1 className="text-2xl font-semibold text-neutral-900">订单管理</h1>
        </header>
      </MobileContentContainer>

      <MobileContentContainer className="flex-1 pt-0">
        <AccountOrdersView
          orders={orders}
          customerName={displayName}
          prescriptionCompliance={compliance}
        />
      </MobileContentContainer>
    </div>
  );
}
