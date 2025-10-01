import { getCurrentUser, getUserById } from "@/lib/api";
import { updateProfileAction } from "./actions";

import AccountProfileForm from "./profile/profile-form";

type AccountProfilePanelProps = {
  showHeader?: boolean;
  variant?: "default" | "mobile";
};

function getContainerClasses(variant: "default" | "mobile") {
  if (variant === "mobile") {
    return "rounded-2xl border border-neutral-100 bg-white/90 p-6 shadow-lg shadow-neutral-900/5";
  }

  return "rounded-3xl border border-neutral-100 bg-white/90 p-8 shadow-lg shadow-neutral-900/5";
}

function getFallbackClasses(variant: "default" | "mobile") {
  if (variant === "mobile") {
    return "rounded-2xl border border-neutral-100 bg-white/80 p-6 text-center shadow-lg shadow-neutral-900/5";
  }

  return "rounded-3xl border border-neutral-100 bg-white/80 p-8 text-center shadow-lg shadow-neutral-900/5";
}

export async function AccountProfilePanel({
  showHeader = true,
  variant = "default",
}: AccountProfilePanelProps = {}) {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return (
      <section className={getFallbackClasses(variant)}>
        <h2 className="text-xl font-semibold text-neutral-900">个人信息</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到账户信息，请稍后再试。
        </p>
      </section>
    );
  }

  return (
    <section className={getContainerClasses(variant)}>
      {showHeader ? (
        <header className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold text-neutral-900">个人信息</h2>
          <p className="text-sm text-neutral-500">
            修改姓名与联系方式，保持账户资料最新。
          </p>
        </header>
      ) : null}
      <AccountProfileForm user={user} action={updateProfileAction} />
    </section>
  );
}

export default AccountProfilePanel;
