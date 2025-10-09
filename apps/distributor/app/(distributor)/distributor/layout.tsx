import type { ReactNode } from "react";

import { WorkspaceShell } from "../../../components/workspace-shell";
import { ensureRole } from "../../../lib/auth";
import {
  DISTRIBUTOR_BREADCRUMBS,
  DISTRIBUTOR_NAV_ITEMS,
} from "../../lib/navigation";
import { getWorkspaceAnnouncement } from "../../lib/announcements";

export default async function DistributorLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await ensureRole("distributor");
  const announcement = await getWorkspaceAnnouncement(session.role);

  return (
    <WorkspaceShell
      title="分销商中心"
      subtitle="掌握分销业绩与二级伙伴的最新进展。"
      session={session}
      navItems={DISTRIBUTOR_NAV_ITEMS}
      breadcrumbs={DISTRIBUTOR_BREADCRUMBS}
      announcement={announcement ?? undefined}
    >
      {children}
    </WorkspaceShell>
  );
}
