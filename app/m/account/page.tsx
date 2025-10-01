import Link from "next/link";
import {
  User as UserIcon,
  MapPin,
  Ticket,
  FileCheck,
  Crown,
  Package,
} from "lucide-react";

import { getCurrentUser, getUserById } from "lib/api";

export const metadata = {
  title: "我的",
  description: "个人中心",
};

const ACCOUNT_FEATURES = [
  {
    key: "orders",
    label: "订单管理",
    icon: Package,
    href: "/account/orders",
  },
  {
    key: "addresses",
    label: "收货地址",
    icon: MapPin,
    href: "/account/addresses",
  },
  {
    key: "coupons",
    label: "优惠券",
    icon: Ticket,
    href: "/account/coupons",
  },
  {
    key: "profile",
    label: "个人信息",
    icon: UserIcon,
    href: "/account/profile",
  },
  {
    key: "surveys",
    label: "我的审核",
    icon: FileCheck,
    href: "/account/surveys",
  },
  {
    key: "membership",
    label: "会员权益",
    icon: Crown,
    href: "/account/membership",
  },
] as const;

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

      {/* 我的服务 */}
      <div className="mx-4 mt-4 rounded-2xl bg-white px-4 py-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          我的服务
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {ACCOUNT_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.key}
                href={feature.href}
                className="flex flex-col items-center transition-opacity active:opacity-60"
              >
                <Icon className="h-10 w-10 text-[#049e6b]" strokeWidth={1.5} />
                <span className="mt-2 text-sm text-neutral-600">
                  {feature.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 底部留白 */}
      <div className="pb-24"></div>
    </div>
  );
}
