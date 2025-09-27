"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AlertCircle, ArrowUpRight, ChevronUp, X } from "lucide-react";

type PrescriptionComplianceReminderProps = {
  orderId: string;
  orderNumber: string;
  productTitles: string[];
  pendingSurveyCount: number;
  identityCompleted: boolean;
  children: React.ReactNode;
};

const STORAGE_PREFIX = "rx-reminder";

export function PrescriptionComplianceReminder({
  orderId,
  orderNumber,
  productTitles,
  pendingSurveyCount,
  identityCompleted,
  children,
}: PrescriptionComplianceReminderProps) {
  const storageKey = `${STORAGE_PREFIX}:${orderId}`;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === "collapsed") {
      setCollapsed(true);
    }
  }, [storageKey]);

  const productLabel = useMemo(() => {
    if (!productTitles.length) {
      return "处方药";
    }

    if (productTitles.length === 1) {
      return productTitles[0];
    }

    return `${productTitles[0]} 等 ${productTitles.length} 件处方药`;
  }, [productTitles]);

  const handleCollapse = () => {
    setCollapsed(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "collapsed");
    }
  };

  const handleExpand = () => {
    setCollapsed(false);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
  };

  const renderCollapsedBadge = () => {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-700 shadow-lg shadow-amber-200/40 transition hover:border-amber-400 hover:text-amber-800"
        aria-label="查看处方审核提醒"
      >
        <AlertCircle className="h-4 w-4" aria-hidden />
        处方审核未完成
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>
    );
  };

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3 px-4 sm:px-0">
      <div className="pointer-events-auto w-full max-w-sm">
        {collapsed ? (
          <div className="flex justify-end">{renderCollapsedBadge()}</div>
        ) : (
          <div className="rounded-3xl border border-amber-200 bg-white/95 shadow-xl shadow-amber-200/50">
            <header className="flex items-start justify-between gap-4 border-b border-amber-100 px-5 py-4">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                  处方审核待完成
                </p>
                <h2 className="text-base font-semibold text-neutral-900">
                  订单 {orderNumber} 正在等待审核
                </h2>
                <p className="text-xs text-neutral-500">{productLabel}</p>
              </div>
              <button
                type="button"
                onClick={handleCollapse}
                className="rounded-full p-1 text-neutral-400 transition hover:text-neutral-700"
                aria-label="暂时收起处方审核提醒"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </header>
            <div className="px-5 pb-5">{children}</div>
            <footer className="flex items-center justify-between gap-4 border-t border-amber-100 px-5 py-4 text-xs text-neutral-500">
              <span>
                {identityCompleted ? "身份证已通过" : "身份证待上传"} ·{" "}
                {pendingSurveyCount > 0
                  ? `${pendingSurveyCount} 份问卷待确认`
                  : "问卷已确认"}
              </span>
              <Link
                href="/account/orders"
                prefetch
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 underline-offset-4 transition hover:text-amber-800 hover:underline"
              >
                查看订单
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionComplianceReminder;
