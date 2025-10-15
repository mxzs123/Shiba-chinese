import "server-only";

import type { UserProfile } from "@shiba/models";

import {
  fetchMockWorkspaceProfile,
  shouldUseMock,
  updateMockWorkspaceProfile,
  type WorkspaceProfileInput,
} from "../../lib/mock/server-actions";

export type WorkspaceProfileActionResult = {
  success: boolean;
  data?: UserProfile;
  error?: string;
};

function normalizeInput(input: WorkspaceProfileInput): WorkspaceProfileInput {
  return {
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
  };
}

export async function loadWorkspaceProfile(
  role: "sales" | "distributor",
): Promise<UserProfile | undefined> {
  if (!shouldUseMock()) {
    return undefined;
  }

  return fetchMockWorkspaceProfile(role);
}

export async function updateWorkspaceProfileAction(
  role: "sales" | "distributor",
  input: WorkspaceProfileInput,
): Promise<WorkspaceProfileActionResult> {
  const normalized = normalizeInput(input);

  if (!normalized.name) {
    return { success: false, error: "请输入姓名" };
  }

  if (!normalized.email) {
    return { success: false, error: "请输入邮箱" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "资料更新服务暂未接入" };
  }

  const updated = await updateMockWorkspaceProfile(role, normalized);
  return { success: true, data: updated };
}
