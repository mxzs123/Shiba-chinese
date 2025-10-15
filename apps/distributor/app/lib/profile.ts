import "server-only";

import type { UserProfile } from "@shiba/models";

import {
  changeMockWorkspacePassword,
  fetchMockWorkspaceAccount,
  fetchMockWorkspaceProfile,
  shouldUseMock,
  updateMockWorkspaceAccount,
  updateMockWorkspaceProfile,
  type WorkspaceAccount as WorkspaceAccountType,
  type WorkspaceProfileInput,
} from "../../lib/mock/server-actions";

export type WorkspaceAccount = WorkspaceAccountType;

export type WorkspaceAccountActionResult = {
  success: boolean;
  data?: WorkspaceAccount;
  error?: string;
};

export type ChangePasswordActionResult = {
  success: boolean;
  error?: string;
};

export type WorkspaceProfileActionResult = {
  success: boolean;
  data?: UserProfile;
  error?: string;
};

export type WorkspaceDetailsActionResult = {
  success: boolean;
  data?: {
    profile: UserProfile;
    account: WorkspaceAccount;
  };
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  if (!value) {
    return true;
  }

  return /^\+?[0-9\-\s]{6,20}$/.test(value);
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
  const result = await updateWorkspaceDetailsAction(role, input);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    data: result.data?.profile,
  };
}

export async function loadWorkspaceAccount(
  role: "sales" | "distributor",
): Promise<WorkspaceAccount | undefined> {
  if (!shouldUseMock()) {
    return undefined;
  }

  return fetchMockWorkspaceAccount(role);
}

export async function updateWorkspaceAccountAction(
  role: "sales" | "distributor",
  input: WorkspaceAccount,
): Promise<WorkspaceAccountActionResult> {
  const email = input.email.trim();
  const phone = input.phone?.trim() ?? "";

  if (!email) {
    return { success: false, error: "请输入登录邮箱" };
  }

  if (!isValidEmail(email)) {
    return { success: false, error: "请输入有效的邮箱地址" };
  }

  if (!isValidPhone(phone)) {
    return { success: false, error: "手机号格式不正确" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "账户信息更新服务暂未接入" };
  }

  const updated = await updateMockWorkspaceAccount(role, {
    email,
    phone: phone || undefined,
  });

  return {
    success: true,
    data: updated,
  };
}

export async function updateWorkspaceDetailsAction(
  role: "sales" | "distributor",
  input: WorkspaceProfileInput,
): Promise<WorkspaceDetailsActionResult> {
  const normalized = normalizeInput(input);

  if (!normalized.name) {
    return { success: false, error: "请输入姓名" };
  }

  if (!normalized.email) {
    return { success: false, error: "请输入登录邮箱" };
  }

  if (!isValidEmail(normalized.email)) {
    return { success: false, error: "请输入有效的邮箱地址" };
  }

  if (!isValidPhone(normalized.phone)) {
    return { success: false, error: "手机号格式不正确" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "资料更新服务暂未接入" };
  }

  const account = await updateMockWorkspaceAccount(role, {
    email: normalized.email,
    phone: normalized.phone || undefined,
  });

  const profile = await updateMockWorkspaceProfile(role, normalized);

  return {
    success: true,
    data: {
      profile,
      account,
    },
  };
}

export async function changeWorkspacePasswordAction(
  role: "sales" | "distributor",
  oldPassword: string,
  newPassword: string,
): Promise<ChangePasswordActionResult> {
  const current = oldPassword.trim();
  const next = newPassword.trim();

  if (!current) {
    return { success: false, error: "请输入当前密码" };
  }

  if (!next) {
    return { success: false, error: "请输入新密码" };
  }

  if (next.length < 6) {
    return { success: false, error: "新密码至少需要 6 位字符" };
  }

  if (current === next) {
    return { success: false, error: "新密码不能与当前密码相同" };
  }

  if (!shouldUseMock()) {
    return { success: false, error: "密码修改服务暂未接入" };
  }

  const success = await changeMockWorkspacePassword(role, current, next);

  if (!success) {
    return { success: false, error: "当前密码不正确" };
  }

  return { success: true };
}
