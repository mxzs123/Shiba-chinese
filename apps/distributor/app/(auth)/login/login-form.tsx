"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { LoginState } from "./actions";
import { loginAction } from "./actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "登录中..." : "登录"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form className="flex flex-col gap-4" action={formAction}>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-700">
          账号
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="name@example.com"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-neutral-700"
        >
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="请输入密码"
        />
      </div>
      {state?.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.message}
        </p>
      ) : null}
      <SubmitButton />
      <p className="text-xs text-neutral-400">
        未配置真实登录时，将根据账号自动匹配 Mock 角色：包含 distributor
        的账号会进入分销商中心。
      </p>
    </form>
  );
}
