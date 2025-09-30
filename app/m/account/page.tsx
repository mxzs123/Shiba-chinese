import Link from "next/link";
import { ChevronRight, User as UserIcon } from "lucide-react";

import { getCurrentUser, getUserById } from "lib/api";
import { ACCOUNT_NAV_ITEMS } from "app/_shared/account/nav-items";
import { cn } from "lib/utils";

export const metadata = {
  title: "我的",
  description: "个人中心",
};

export default async function MobileAccountPage() {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-neutral-50">
      {/* 用户信息卡片 */}
      <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              {user.firstName || user.lastName
                ? `${user.lastName || ""}${user.firstName || ""}`
                : user.email || "用户"}
            </h1>
            <p className="mt-1 text-sm text-white/80">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div className="mt-4 space-y-3 px-4 pb-24">
        {ACCOUNT_NAV_ITEMS.map((item, index) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-xl bg-white p-4 transition-shadow hover:shadow-md",
              index === 0 && "mt-0",
            )}
          >
            <div className="flex-1">
              <h2 className="font-medium text-neutral-900">{item.label}</h2>
              <p className="mt-1 text-xs text-neutral-500">
                {item.description}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 flex-none text-neutral-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}
