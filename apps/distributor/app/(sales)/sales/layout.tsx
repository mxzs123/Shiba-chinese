import type { ReactNode } from "react";

import { ensureRole } from "../../../lib/auth";

export default async function SalesLayout({
  children,
}: {
  children: ReactNode;
}) {
  await ensureRole("sales");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            芝园分销平台
          </p>
          <h1 className="text-xl font-semibold text-neutral-900">销售中心</h1>
        </div>
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
