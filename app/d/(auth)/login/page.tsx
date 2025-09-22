import type { Metadata } from "next";

import { AuthPageShell, LoginForm } from "@/app/_shared/auth";
import { sanitizeRedirect } from "@/lib/utils";

export const metadata: Metadata = {
  title: "登录",
  description: "使用邮箱或手机号登录芝园商城账户。",
};

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function buildRegisterHref(next?: string) {
  if (!next) {
    return "/register";
  }
  const search = new URLSearchParams({ next }).toString();
  return `/register?${search}`;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
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
      title="欢迎回来"
      description="登录后即可同步购物车、管理收货地址并完成结算。"
      secondaryAction={{
        label: "立即注册",
        href: buildRegisterHref(redirectTo),
        description: "还没有账号？使用邮箱或手机号一分钟完成注册。",
      }}
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthPageShell>
  );
}
