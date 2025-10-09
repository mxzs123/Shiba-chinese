import type { UserProfile, UserRole } from "@shiba/models";

type EditableProfileFields = Pick<
  UserProfile,
  "name" | "email" | "phone" | "address"
>;

type ProfileRecord = EditableProfileFields & {
  id: string;
  role: UserRole;
};

const profileStore: Record<UserRole, ProfileRecord> = {
  sales: {
    id: "mock-sales-user",
    role: "sales",
    name: "王晓",
    email: "sales.lead@example.com",
    phone: "+86 13800138000",
    address: "上海市黄浦区南京东路 100 号",
  },
  distributor: {
    id: "mock-distributor-user",
    role: "distributor",
    name: "佐藤太郎",
    email: "distributor.partner@example.com",
    phone: "+81 80-1234-5678",
    address: "东京都中央区银座 3-2-1",
  },
  secondary: {
    id: "mock-secondary-user",
    role: "secondary",
    name: "二级分销占位",
    email: "secondary.partner@example.com",
    phone: "",
    address: "",
  },
};

export function getMockProfile(role: UserRole): UserProfile {
  return { ...profileStore[role] };
}

export function updateMockProfile(
  role: Extract<UserRole, "sales" | "distributor">,
  input: Partial<EditableProfileFields>,
): UserProfile {
  const current = profileStore[role];
  const next: ProfileRecord = {
    ...current,
    ...input,
  };

  profileStore[role] = next;
  return { ...next };
}
