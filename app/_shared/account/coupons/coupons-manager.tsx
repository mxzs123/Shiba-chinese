"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { CustomerCoupon } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import {
  CouponCard,
  CouponRedeemForm,
  type CouponCardDetail,
} from "@/app/_shared/coupons";
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
          {filteredCoupons.map((entry) => {
            const definition = entry.coupon;
            const expiresAt = entry.expiresAt || definition.expiresAt;
            const details: CouponCardDetail[] = [
              { label: "领取时间", value: formatDate(entry.assignedAt) },
              {
                label: "有效期",
                value: expiresAt ? formatDate(expiresAt) : "长期有效",
              },
            ];

            if (entry.usedAt) {
              details.push({ label: "使用时间", value: formatDate(entry.usedAt) });
            }

            if (entry.orderId) {
              details.push({ label: "关联订单", value: entry.orderId });
            }

            return (
              <li key={entry.id}>
                <CouponCard
                  coupon={definition}
                  state={entry.state}
                  sourceLabel={
                    entry.source ? `来源：${entry.source}` : undefined
                  }
                  details={details}
                />
              </li>
            );
          })}
        </ul>
      )}
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
