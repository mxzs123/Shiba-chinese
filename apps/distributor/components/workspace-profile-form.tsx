"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { UserProfile } from "@shiba/models";

import type {
  WorkspaceAccount,
  WorkspaceDetailsActionResult,
} from "../app/lib/profile";
import type { WorkspaceProfileInput } from "../lib/mock/server-actions";

type WorkspaceProfileFormProps = {
  profile: UserProfile;
  account: WorkspaceAccount;
  action: (
    input: WorkspaceProfileInput,
  ) => Promise<WorkspaceDetailsActionResult>;
};

export function WorkspaceProfileForm({
  profile,
  account,
  action,
}: WorkspaceProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(account.email ?? profile.email ?? "");
  const [phone, setPhone] = useState(account.phone ?? profile.phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await action({ name, email, phone, address });

      if (!result.success) {
        const message = result.error ?? "保存失败，请稍后再试";
        setError(message);
        toast.error(message);
        return;
      }

      if (result.data) {
        setName(result.data.profile.name ?? "");
        setEmail(result.data.account.email ?? "");
        setPhone(result.data.account.phone ?? "");
        setAddress(result.data.profile.address ?? "");
      }

      setSuccess("资料已更新");
      toast.success("资料已更新");
      router.refresh();
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-profile-name"
          >
            姓名
          </label>
          <input
            id="workspace-profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入姓名"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-profile-email"
          >
            登录邮箱
          </label>
          <input
            id="workspace-profile-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="请输入登录邮箱"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-profile-phone"
          >
            绑定手机号
          </label>
          <input
            id="workspace-profile-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="请输入绑定手机号"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="tel"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-neutral-700"
            htmlFor="workspace-profile-address"
          >
            联系地址
          </label>
          <input
            id="workspace-profile-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="请输入联系地址"
            disabled={pending}
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoComplete="street-address"
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
        {pending ? "保存中..." : "保存修改"}
      </button>
    </form>
  );
}
