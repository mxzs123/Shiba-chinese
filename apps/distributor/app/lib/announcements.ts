import type { Session } from "@shiba/models";

import { mockAnnouncements } from "../../lib/mock/announcements";
import { shouldUseMock } from "../../lib/mock/server-actions";

const ROLE_ENV_KEY: Record<Session["role"], string> = {
  sales: "DISTRIBUTOR_ANNOUNCEMENT_SALES",
  distributor: "DISTRIBUTOR_ANNOUNCEMENT_DISTRIBUTOR",
  secondary: "DISTRIBUTOR_ANNOUNCEMENT_SECONDARY",
};

export async function getWorkspaceAnnouncement(role: Session["role"]) {
  if (shouldUseMock()) {
    return mockAnnouncements[role] ?? mockAnnouncements.default ?? null;
  }

  const specificKey = ROLE_ENV_KEY[role];
  const specific = process.env[specificKey];
  const fallback = process.env.DISTRIBUTOR_ANNOUNCEMENT;

  return specific ?? fallback ?? null;
}
