import type { UserRole } from "@shiba/models";

import { getMockProfile, updateMockProfile } from "./profile";

type ManagedRole = Extract<UserRole, "sales" | "distributor">;

type AccountRecord = {
  role: ManagedRole;
  email: string;
  phone?: string;
  password: string;
};

type AccountSnapshot = Pick<AccountRecord, "email" | "phone">;

const accountStore: Record<ManagedRole, AccountRecord> = {
  sales: {
    role: "sales",
    email: "sales.lead@example.com",
    phone: "+86 13800138000",
    password: "sales123",
  },
  distributor: {
    role: "distributor",
    email: "distributor.partner@example.com",
    phone: "+81 80-1234-5678",
    password: "distributor123",
  },
};

export function getMockAccount(role: ManagedRole): AccountSnapshot {
  const account = accountStore[role];
  return {
    email: account.email,
    phone: account.phone,
  };
}

export function updateMockAccount(
  role: ManagedRole,
  input: Partial<AccountSnapshot>,
): AccountSnapshot {
  const current = accountStore[role];
  const next: AccountRecord = {
    ...current,
    ...input,
  };

  accountStore[role] = next;
  updateMockProfile(role, {
    email: next.email,
    phone: next.phone,
  });

  return {
    email: next.email,
    phone: next.phone,
  };
}

export function changeMockPassword(
  role: ManagedRole,
  oldPassword: string,
  newPassword: string,
): boolean {
  const account = accountStore[role];

  if (account.password !== oldPassword) {
    return false;
  }

  accountStore[role] = {
    ...account,
    password: newPassword,
  };

  return true;
}

export function findMockAccountByEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  const record = Object.values(accountStore).find(
    (account) => account.email.trim().toLowerCase() === normalized,
  );

  if (!record) {
    return undefined;
  }

  return {
    role: record.role,
    email: record.email,
    phone: record.phone,
    password: record.password,
    profile: getMockProfile(record.role),
  };
}
