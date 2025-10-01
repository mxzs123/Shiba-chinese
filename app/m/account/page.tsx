import Link from "next/link";
import {
  ArrowRight,
  Crown,
  FileCheck,
  MapPin,
  Package,
  Ticket,
  User as UserIcon,
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

  const membership = user.membership;
  const loyalty = user.loyalty;
  const displayName = [user.lastName, user.firstName]
    .filter(Boolean)
    .join("")
    .trim();


  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-neutral-50">
      <section className="relative px-4 pb-6 pt-4">
        <div className="absolute inset-x-0 top-0 h-[220px] rounded-b-3xl bg-gradient-to-br from-[#0c8c66] via-[#0fa37f] to-[#2ab39b]" />
        <div className="relative z-10 space-y-5">
          <div className="space-y-1 text-white">
            <p className="text-sm text-white/70">欢迎回来</p>
            <h1 className="text-2xl font-semibold">
              {displayName || "尊贵会员"}
            </h1>
            <p className="text-xs text-white/80">{user.email}</p>
          </div>

          <div className="grid gap-4 rounded-3xl bg-white/95 p-4 shadow-lg shadow-emerald-900/10 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">积分余额</p>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {loyalty?.balance?.toLocaleString() ?? "0"}
                </p>
                {membership ? (
                  <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    <Crown className="h-4 w-4" />
                    {membership.tier}
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                      Lv.{membership.level}
                    </span>
                  </span>
                ) : null}
              </div>
              <Link
                href="/account/membership"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-500"
              >
                积分账单
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
              <p className="text-xs text-emerald-600/80">距离下一等级</p>
              <p className="mt-1 text-sm font-semibold">
                {membership?.next?.title ?? "继续保持即可解锁新权益"}
              </p>
              <p className="mt-2 text-xs text-emerald-600">
                {membership?.next?.requirement ?? "年度消费满 ¥5,000 或积分累计 5,000 以上"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-4 mt-2 rounded-2xl bg-white px-4 py-6 shadow-sm">
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

      <div className="pb-24" />
    </div>
  );
}
