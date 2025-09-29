"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ComplianceType = "prescription" | "shipping";

type PrescriptionComplianceReminderProps = {
  orderId: string;
  orderNumber?: string;
  productTitles?: string[];
  pendingSurveyCount?: number;
  identityCompleted: boolean;
  identityHref: string;
  surveyHref?: string;
  type?: ComplianceType;
};

const STORAGE_PREFIX = "compliance-reminder";

export function PrescriptionComplianceReminder({
  orderId,
  orderNumber,
  productTitles = [],
  pendingSurveyCount = 0,
  identityCompleted,
  identityHref,
  surveyHref,
  type = "prescription",
}: PrescriptionComplianceReminderProps) {
  const storageKey = `${STORAGE_PREFIX}:${orderId}`;
  const [collapsed, setCollapsed] = useState(false);

  const isPrescription = type === "prescription";
  const surveyCompleted = pendingSurveyCount === 0;
  const allCompleted =
    identityCompleted && (isPrescription ? surveyCompleted : true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (stored === "collapsed") {
      setCollapsed(true);
    }
  }, [storageKey]);

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

  const getTitle = () => {
    if (isPrescription) {
      return orderNumber ? `订单 ${orderNumber}` : "处方药订单";
    }
    return "顺丰国际物流";
  };

  const getDescription = () => {
    if (isPrescription) {
      return "处方药审核待完成";
    }
    return "需要完成实名认证";
  };

  const renderCollapsedBadge = () => {
    return (
      <button
        type="button"
        onClick={handleExpand}
        className={cn(
          "group inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg transition-all",
          allCompleted
            ? "border border-green-200 bg-white text-green-700 hover:border-green-300 hover:shadow-xl"
            : "border border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400 hover:bg-amber-100 hover:shadow-xl",
        )}
        aria-label="查看合规提醒"
      >
        {allCompleted ? (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        ) : (
          <AlertCircle className="h-4 w-4" aria-hidden />
        )}
        <span>
          {allCompleted
            ? isPrescription
              ? "处方审核已完成"
              : "实名认证已完成"
            : isPrescription
              ? "待完成处方审核"
              : "待完成实名认证"}
        </span>
        <ChevronUp
          className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]"
          aria-hidden
        />
      </button>
    );
  };

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-3">
      <div className="pointer-events-auto w-full max-w-md">
        {collapsed ? (
          renderCollapsedBadge()
        ) : (
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl">
            {/* Header */}
            <div
              className={cn(
                "relative overflow-hidden px-6 py-4",
                allCompleted
                  ? "bg-gradient-to-br from-green-50 to-emerald-50"
                  : "bg-gradient-to-br from-amber-50 to-orange-50",
              )}
            >
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {allCompleted ? (
                      <CheckCircle2
                        className="h-5 w-5 text-green-600"
                        aria-hidden
                      />
                    ) : (
                      <AlertCircle
                        className="h-5 w-5 text-amber-600"
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        allCompleted ? "text-green-700" : "text-amber-700",
                      )}
                    >
                      {getDescription()}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {getTitle()}
                  </h3>
                  {isPrescription && productTitles.length > 0 && (
                    <p className="text-xs text-neutral-600">
                      {productTitles.length === 1
                        ? productTitles[0]
                        : `${productTitles[0]} 等 ${productTitles.length} 件`}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/80 hover:text-neutral-700"
                  aria-label="收起提醒"
                >
                  <ChevronDown className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3 p-6">
              {/* Identity Step */}
              <ComplianceItem
                title="上传身份证"
                description={
                  identityCompleted
                    ? "身份信息已通过审核"
                    : isPrescription
                      ? "处方药需完成实名认证"
                      : "国际物流需完成实名认证"
                }
                completed={identityCompleted}
                href={identityHref}
                actionLabel={identityCompleted ? "查看" : "前往上传"}
              />

              {/* Survey Step - Only for prescription type */}
              {isPrescription && surveyHref && (
                <ComplianceItem
                  title="确认问卷内容"
                  description={
                    surveyCompleted
                      ? "问卷已确认提交"
                      : pendingSurveyCount > 0
                        ? `${pendingSurveyCount} 份问卷待确认`
                        : "确认问卷信息后可提交审核"
                  }
                  completed={surveyCompleted}
                  href={surveyHref}
                  actionLabel={surveyCompleted ? "查看" : "立即确认"}
                />
              )}
            </div>

            {/* Footer */}
            {orderNumber && (
              <div className="border-t border-neutral-100 px-6 py-4">
                <Link
                  href="/account/orders"
                  prefetch
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900"
                >
                  <span>查看订单详情</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ComplianceItem({
  title,
  description,
  completed,
  href,
  actionLabel,
}: {
  title: string;
  description: string;
  completed: boolean;
  href: string;
  actionLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border p-4 transition",
        completed
          ? "border-green-100 bg-green-50/50"
          : "border-neutral-200 bg-neutral-50",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          completed
            ? "bg-green-100 text-green-600"
            : "bg-amber-100 text-amber-600",
        )}
      >
        {completed ? (
          <CheckCircle2 className="h-5 w-5" aria-hidden />
        ) : (
          <AlertCircle className="h-5 w-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="text-xs text-neutral-600">{description}</p>
      </div>
      <Link
        href={href}
        prefetch
        className={cn(
          "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition",
          completed
            ? "border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-white"
            : "bg-amber-500 text-white hover:bg-amber-600",
        )}
      >
        {actionLabel}
      </Link>
    </div>
  );
}

export default PrescriptionComplianceReminder;
