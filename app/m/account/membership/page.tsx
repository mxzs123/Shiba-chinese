import type { Metadata } from "next";

import { AccountMembershipPanel } from "@/app/_shared/account";

export const metadata: Metadata = {
  title: "会员权益",
  description: "查看当前会员等级、积分余额与权益信息。",
};

export default function MobileMembershipPage() {
  return (
    <div className="w-full pb-24">
      <header className="mb-4 px-4 pt-6">
        <h1 className="text-2xl font-semibold text-neutral-900">会员权益</h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          查看当前等级、积分余额与专属权益
        </p>
      </header>
      <div className="px-4">
        <AccountMembershipPanel />
      </div>
    </div>
  );
}
