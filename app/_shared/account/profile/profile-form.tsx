"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PrimaryButton } from "@/app/_shared";
import type { User } from "@/lib/api/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import type { updateProfileAction } from "../actions";

type AccountProfileFormProps = {
  user: User;
  action: typeof updateProfileAction;
};

const PHONE_PLACEHOLDER = "例如：+86 13800000000";

function buildInitialFullName(user: User) {
  const parts = [user.lastName, user.firstName].filter(Boolean).join("");
  return parts || user.email.split("@")[0] || "";
}

export default function AccountProfileForm({
  user,
  action,
}: AccountProfileFormProps) {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const [fullName, setFullName] = useState(() => buildInitialFullName(user));
  const [phone, setPhone] = useState(() => user.phone ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await action(user.id, {
        fullName,
        phone,
      });

      if (!result.success) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      setUser(result.data);
      setSuccess("资料已更新");
      toast.success("资料已更新");
      router.refresh();
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="account-full-name"
          >
            姓名
          </label>
          <input
            id="account-full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="请输入姓名"
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="account-phone"
          >
            手机号
          </label>
          <input
            id="account-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={PHONE_PLACEHOLDER}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20"
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">登录邮箱</label>
        <div className="h-11 rounded-xl border border-neutral-100 bg-neutral-50 px-4 text-sm leading-[44px] text-neutral-500">
          {user.email}
        </div>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <PrimaryButton type="submit" loading={pending} loadingText="保存中...">
        保存修改
      </PrimaryButton>
    </form>
  );
}
