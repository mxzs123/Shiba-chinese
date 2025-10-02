"use client";

import type { ReactNode } from "react";
import { BadgeCheck, Clock, Gift, PartyPopper } from "lucide-react";

import type { Coupon, CustomerCouponState } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const STATE_LABEL: Record<
  CustomerCouponState | "available",
  { label: string; tone: "positive" | "warning" | "muted" }
> = {
  active: { label: "可用", tone: "positive" },
  available: { label: "可用", tone: "positive" },
  scheduled: { label: "待生效", tone: "warning" },
  used: { label: "已使用", tone: "muted" },
  expired: { label: "已过期", tone: "muted" },
};

const STATE_ICON = {
  active: PartyPopper,
  available: PartyPopper,
  scheduled: Clock,
  used: BadgeCheck,
  expired: Gift,
} as const;

export type CouponCardDetail = {
  label: string;
  value: ReactNode;
};

export type CouponCardProps = {
  coupon: Coupon;
  state?: CustomerCouponState | "available";
  descriptionOverride?: string;
  sourceLabel?: string;
  minimumLabel?: string;
  actionSlot?: ReactNode;
  actionDescription?: ReactNode;
  details?: CouponCardDetail[];
  layout?: "default" | "compact";
  className?: string;
};

export function CouponCard({
  coupon,
  state,
  descriptionOverride,
  sourceLabel,
  minimumLabel,
  actionSlot,
  actionDescription,
  details,
  layout = "default",
  className,
}: CouponCardProps) {
  const stateMeta = state ? STATE_LABEL[state] : undefined;
  const StateIcon = state ? STATE_ICON[state] : undefined;

  const valueLabel =
    coupon.type === "percentage"
      ? `${coupon.value}%`
      : coupon.type === "free_shipping"
        ? "免运费"
        : coupon.currencyCode
          ? `${coupon.currencyCode}${coupon.value}`
          : `¥${coupon.value}`;

  const minimum = minimumLabel
    ? minimumLabel
    : coupon.minimumSubtotal
      ? `满 ${coupon.minimumSubtotal.amount}${coupon.minimumSubtotal.currencyCode}`
      : "无门槛";

  const metaItems = [minimum, sourceLabel].filter(
    (item): item is string => Boolean(item),
  );

  const paddingClass = layout === "compact" ? "p-4" : "p-6";
  const titleClass = layout === "compact" ? "text-base" : "text-lg";

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white/95 shadow-sm shadow-black/[0.02]",
        paddingClass,
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className={cn("font-semibold text-neutral-900", titleClass)}>
            {coupon.title}
          </p>
          {descriptionOverride ?? coupon.description ? (
            <p className="text-sm text-neutral-500">
              {descriptionOverride ?? coupon.description}
            </p>
          ) : null}
        </div>
        {stateMeta && StateIcon ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              stateMeta.tone === "positive" && "bg-emerald-50 text-emerald-600",
              stateMeta.tone === "warning" && "bg-amber-50 text-amber-600",
              stateMeta.tone === "muted" && "bg-neutral-100 text-neutral-500",
            )}
          >
            <StateIcon className="h-4 w-4" aria-hidden />
            {stateMeta.label}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
          {valueLabel}
        </span>
        {metaItems.map((entry) => (
          <span key={entry} className="text-xs text-neutral-400">
            {entry}
          </span>
        ))}
      </div>

      {actionSlot ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {actionDescription === null ? null : (
            <div className="text-xs text-neutral-400">
              {actionDescription ?? "使用规则以结算页提示为准。"}
            </div>
          )}
          <div className="flex flex-1 justify-end">{actionSlot}</div>
        </div>
      ) : null}

      {details && details.length > 0 ? (
        <div className="mt-4 grid gap-2 text-xs text-neutral-400 sm:grid-cols-2">
          {details.map((detail) => (
            <div key={detail.label} className="flex items-center gap-2">
              <span className="text-neutral-400">{detail.label}</span>
              <span className="text-neutral-600">{detail.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
