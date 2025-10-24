"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { ChangePasswordActionResult } from "../app/lib/profile";

type WorkspacePasswordFormProps = {
  action: (
    oldPassword: string,
    newPassword: string,
  ) => Promise<ChangePasswordActionResult>;
};

export function WorkspacePasswordForm({ action }: WorkspacePasswordFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      const message = "两次输入的新密码不一致";
      setError(message);
      toast.error(message);
      return;
    }

    startTransition(async () => {
      const result = await action(currentPassword, newPassword);

      if (!result.success) {
        const message = result.error ?? "修改失败，请稍后再试";
        setError(message);
        toast.error(message);
        return;
      }

      setSuccess("密码已更新");
      toast.success("密码已更新");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-password-current"
          >
            当前密码
          </label>
          <input
            id="workspace-password-current"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="请输入当前密码"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-password-new"
          >
            新密码
          </label>
          <input
            id="workspace-password-new"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="请输入新密码"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-password-confirm"
          >
            确认新密码
          </label>
          <input
            id="workspace-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="请再次输入新密码"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="new-password"
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
      >
        {pending ? "保存中..." : "更新密码"}
      </button>
    </form>
  );
}
