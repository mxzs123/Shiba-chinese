import type { UserRole } from "@shiba/models";

import {
  loadWorkspaceProfile,
  updateWorkspaceProfileAction,
} from "../app/lib/profile";
import { WorkspaceProfileForm } from "./workspace-profile-form";
import type { WorkspaceProfileInput } from "../lib/mock/server-actions";

type ProfileSettingsPanelProps = {
  role: Extract<UserRole, "sales" | "distributor">;
};

const roleCopy: Record<ProfileSettingsPanelProps["role"], string> = {
  sales: "维护销售账户的基础信息，确保客户能够及时联系到你。",
  distributor: "完善分销商联系资料，方便总部与合作伙伴快速沟通。",
};

export async function ProfileSettingsPanel({
  role,
}: ProfileSettingsPanelProps) {
  const profile = await loadWorkspaceProfile(role);

  async function handleUpdate(input: WorkspaceProfileInput) {
    "use server";
    return updateWorkspaceProfileAction(role, input);
  }

  if (!profile) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white/80 p-8 text-center shadow-lg shadow-neutral-900/5">
        <h2 className="text-xl font-semibold text-neutral-900">个人信息</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到账户资料，请稍后再试。
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-100 bg-white/90 p-8 shadow-lg shadow-neutral-900/5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-neutral-900">个人信息</h2>
        <p className="text-sm text-neutral-500">{roleCopy[role]}</p>
      </header>
      <WorkspaceProfileForm profile={profile} action={handleUpdate} />
    </section>
  );
}
