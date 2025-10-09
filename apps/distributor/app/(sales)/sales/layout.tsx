import type { ReactNode } from "react";

import { WorkspaceShell } from "../../../components/workspace-shell";
import { ensureRole } from "../../../lib/auth";
import { SALES_BREADCRUMBS, SALES_NAV_ITEMS } from "../../lib/navigation";
import { getWorkspaceAnnouncement } from "../../lib/announcements";

export default async function SalesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await ensureRole("sales");
  const announcement = await getWorkspaceAnnouncement(session.role);

  return (
    <WorkspaceShell
      title="销售中心"
      subtitle="查看销售业绩、客户动态与每日任务概览。"
      session={session}
      navItems={SALES_NAV_ITEMS}
      breadcrumbs={SALES_BREADCRUMBS}
      announcement={announcement ?? undefined}
    >
      {children}
    </WorkspaceShell>
  );
}
