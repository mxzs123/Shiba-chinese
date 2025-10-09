"use client";

import { useTransition } from "react";

import { logoutAction } from "@/app/lib/session-actions";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      className="inline-flex items-center justify-center rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isPending}
    >
      {isPending ? "退出中..." : "退出登录"}
    </button>
  );
}
