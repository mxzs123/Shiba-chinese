"use client";

import { useState, useTransition, type FormEvent } from "react";

import { cn } from "@/lib/utils";
import { PrimaryButton } from "../PrimaryButton";

export type CouponRedeemFormProps = {
  title?: string;
  description?: string;
  inputPlaceholder?: string;
  submitLabel?: string;
  pendingLabel?: string;
  defaultErrorMessage?: string;
  onRedeem: (
    code: string,
  ) => Promise<{ success: true } | { success: false; error?: string }>;
  className?: string;
};

export function CouponRedeemForm({
  title = "兑换优惠券",
  description = "输入活动或客服提供的兑换码，成功后可在列表查看。",
  inputPlaceholder = "请输入兑换码",
  submitLabel = "立即兑换",
  pendingLabel = "兑换中...",
  defaultErrorMessage = "兑换失败，请稍后重试",
  onRedeem,
  className,
}: CouponRedeemFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("请输入优惠券兑换码");
      return;
    }

    startTransition(async () => {
      const result = await onRedeem(trimmed);

      if (!result.success) {
        setError(result.error || defaultErrorMessage);
        return;
      }

      setCode("");
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm shadow-black/[0.02]",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-neutral-700">{title}</h3>
      {description ? (
        <p className="mt-1 text-xs text-neutral-500">{description}</p>
      ) : null}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={inputPlaceholder}
          className="h-11 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:bg-neutral-100"
          disabled={pending}
        />
        <PrimaryButton
          type="submit"
          className="min-w-[7.5rem] px-5 sm:w-auto"
          loading={pending}
          loadingText={pendingLabel}
        >
          {submitLabel}
        </PrimaryButton>
      </div>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </form>
  );
}
