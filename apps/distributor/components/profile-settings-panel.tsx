import type { UserRole } from "@shiba/models";

import {
  changeWorkspacePasswordAction,
  loadWorkspaceAccount,
  loadWorkspaceProfile,
  updateWorkspaceDetailsAction,
} from "../app/lib/profile";
import { WorkspaceProfileForm } from "./workspace-profile-form";
import { WorkspacePasswordForm } from "./workspace-password-form";
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
  const [profile, account] = await Promise.all([
    loadWorkspaceProfile(role),
    loadWorkspaceAccount(role),
  ]);

  async function handleDetailsUpdate(input: WorkspaceProfileInput) {
    "use server";
    return updateWorkspaceDetailsAction(role, input);
  }

  async function handlePasswordChange(
    currentPassword: string,
    newPassword: string,
  ) {
    "use server";
    return changeWorkspacePasswordAction(role, currentPassword, newPassword);
  }

  if (!profile || !account) {
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
    <section className="mx-auto space-y-8 rounded-3xl border border-neutral-100 bg-white/90 p-6 shadow-lg shadow-neutral-900/5 sm:p-8 lg:max-w-3xl">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-neutral-900">个人信息</h2>
        <p className="text-sm text-neutral-500">{roleCopy[role]}</p>
      </header>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">账户资料</h3>
        <WorkspaceProfileForm
          profile={profile}
          account={account}
          action={handleDetailsUpdate}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">密码安全</h3>
        <WorkspacePasswordForm action={handlePasswordChange} />
      </div>
    </section>
  );
}
