import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "登录",
};

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-sm font-medium text-primary">芝园分销平台</p>
        <h1 className="text-2xl font-semibold text-neutral-900">登录账号</h1>
        <p className="text-sm text-neutral-500">
          使用内部发放的账号密码登录，以访问销售或分销工作台。
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
