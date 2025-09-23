import type { Metadata } from "next";

import { AuthPageShell, RegisterForm } from "@/app/_shared/auth";
import { sanitizeRedirect } from "@/lib/utils";

export const metadata: Metadata = {
  title: "注册",
  description: "创建芝园商城账号，解锁个性化推荐与快捷结算。",
};

type RegisterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildLoginHref(next?: string) {
  if (!next) {
    return "/login";
  }
  const search = new URLSearchParams({ next }).toString();
  return `/login?${search}`;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const rawNext = resolvedSearchParams?.next;
  const nextCandidate = Array.isArray(rawNext)
    ? rawNext[0]
    : typeof rawNext === "string"
      ? rawNext
      : undefined;
  const redirectTo = sanitizeRedirect(nextCandidate);

  return (
    <AuthPageShell
      title="创建账户"
      description="注册账号即可保存收货地址、同步购物车，并获取新人优惠。"
      secondaryAction={{
        label: "已有账号？去登录",
        href: buildLoginHref(redirectTo),
        description: "已经注册过？直接前往登录页面。",
      }}
    >
      <RegisterForm redirectTo={redirectTo} />
    </AuthPageShell>
  );
}
