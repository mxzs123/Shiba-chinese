"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ComponentType,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BadgeCheck, Clock, Gift, PartyPopper } from "lucide-react";

import type { CustomerCoupon, CustomerCouponState } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { CouponRedeemForm } from "@/app/_shared/coupons";
import { redeemCouponAction } from "../actions";
import { useAuthStore } from "@/hooks/useAuthStore";

const FILTERS: Array<{
  key: FilterKey;
  label: string;
}> = [
  { key: "all", label: "全部" },
  { key: "unused", label: "未使用" },
  { key: "used", label: "已使用" },
  { key: "expired", label: "过期" },
];

type FilterKey = "all" | "unused" | "used" | "expired";

type CouponsManagerProps = {
  userId: string;
  coupons: CustomerCoupon[];
};

export default function CouponsManager({
  userId,
  coupons,
}: CouponsManagerProps) {
  const router = useRouter();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [items, setItems] = useState(coupons);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [, startTransition] = useTransition();

  useEffect(() => {
    setItems(coupons);
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return items.filter((entry) => {
      if (filter === "all") {
        return true;
      }

      if (filter === "unused") {
        return entry.state === "active" || entry.state === "scheduled";
      }

      return entry.state === filter;
    });
  }, [items, filter]);

  const handleRedeem = (code: string) => {
    return new Promise<{ success: true } | { success: false; error?: string }>(
      (resolve) => {
        startTransition(async () => {
          const result = await redeemCouponAction(userId, code);

          if (!result.success) {
            toast.error(result.error);
            resolve({ success: false, error: result.error });
            return;
          }

          const nextCoupons = result.data.coupons;
          setItems(nextCoupons);
          toast.success("兑换成功，优惠券已添加到账户");
          updateUser((current) => ({
            ...current,
            coupons: nextCoupons,
          }));
          router.refresh();
          resolve({ success: true });
        });
      },
    );
  };

  return (
    <div className="space-y-6">
      <CouponRedeemForm
        onRedeem={handleRedeem}
        pendingLabel="兑换中..."
        submitLabel="立即兑换"
        description="输入活动或客服提供的兑换码，成功后可在下方列表查看。"
      />

      <div className="flex w-full items-center rounded-full border border-neutral-200 bg-neutral-100 p-1 text-sm">
        {FILTERS.map((option) => {
          const isActive = filter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 font-medium transition",
                isActive
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filteredCoupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-16 text-center text-sm text-neutral-500">
          暂无符合条件的优惠券。
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredCoupons.map((entry) => (
            <li key={entry.id}>
              <CouponCard coupon={entry} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type CouponCardProps = {
  coupon: CustomerCoupon;
};

const STATE_LABEL: Record<
  CustomerCouponState,
  { label: string; tone: "positive" | "warning" | "muted" }
> = {
  active: { label: "可用", tone: "positive" },
  scheduled: { label: "待生效", tone: "warning" },
  used: { label: "已使用", tone: "muted" },
  expired: { label: "已过期", tone: "muted" },
};

const STATE_ICON: Record<
  CustomerCouponState,
  ComponentType<{ className?: string }>
> = {
  active: PartyPopper,
  scheduled: Clock,
  used: BadgeCheck,
  expired: Gift,
};

function CouponCard({ coupon }: CouponCardProps) {
  const { coupon: definition, state } = coupon;
  const stateMeta = STATE_LABEL[state];
  const Icon = STATE_ICON[state];

  const minimum = definition.minimumSubtotal
    ? `满 ${definition.minimumSubtotal.amount}${definition.minimumSubtotal.currencyCode}`
    : "无门槛";

  const expiresAt = coupon.expiresAt || definition.expiresAt;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-neutral-900">
            {definition.title}
          </p>
          {definition.description ? (
            <p className="text-sm text-neutral-500">{definition.description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
            stateMeta.tone === "positive" && "bg-emerald-50 text-emerald-600",
            stateMeta.tone === "warning" && "bg-amber-50 text-amber-600",
            stateMeta.tone === "muted" && "bg-neutral-100 text-neutral-500",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {stateMeta.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-500">
          {definition.type === "percentage"
            ? `${definition.value}%`
            : definition.type === "free_shipping"
              ? "免运费"
              : `¥${definition.value}`}
        </span>
        <span className="text-xs text-neutral-400">{minimum}</span>
        {coupon.source ? (
          <span className="text-xs text-neutral-400">
            来源：{coupon.source}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 text-xs text-neutral-400 sm:grid-cols-2">
        <Detail label="领取时间" value={formatDate(coupon.assignedAt)} />
        <Detail
          label="有效期"
          value={expiresAt ? formatDate(expiresAt) : "长期有效"}
        />
        {coupon.usedAt ? (
          <Detail label="使用时间" value={formatDate(coupon.usedAt)} />
        ) : null}
        {coupon.orderId ? (
          <Detail label="关联订单" value={coupon.orderId} />
        ) : null}
      </div>
    </div>
  );
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-neutral-400">{label}</span>
      <span className="text-neutral-600">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch (error) {
    return "--";
  }
}
