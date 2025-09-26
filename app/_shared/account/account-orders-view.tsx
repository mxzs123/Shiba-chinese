"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Order } from "@/lib/api/types";
import type {
  PrescriptionComplianceByOrder,
  PrescriptionOrderCompliance,
} from "@/lib/prescription";
import { AlertCircle, ArrowRight, PackageCheck } from "lucide-react";

import {
  ORDER_STAGES,
  type OrderStage,
  getStageLabel,
  resolveOrderStage,
} from "./order-stages";

type OrderEntry = {
  order: Order;
  stage: OrderStage;
  compliance?: PrescriptionOrderCompliance;
};

type AccountOrdersViewProps = {
  orders: Order[];
  customerName?: string;
  prescriptionCompliance?: PrescriptionComplianceByOrder;
};

export function AccountOrdersView({
  orders,
  customerName,
  prescriptionCompliance,
}: AccountOrdersViewProps) {
  const entries = useMemo<OrderEntry[]>(
    () =>
      orders.map((order) => ({
        order,
        compliance: prescriptionCompliance?.[order.id],
        stage: prescriptionCompliance?.[order.id]
          ? "pending"
          : resolveOrderStage(order),
      })),
    [orders, prescriptionCompliance],
  );

  const stageCounts = useMemo(() => {
    const initialCounts = ORDER_STAGES.reduce<Record<OrderStage, number>>(
      (acc, stage) => {
        acc[stage.key] = 0;
        return acc;
      },
      {} as Record<OrderStage, number>,
    );

    return entries.reduce((acc, entry) => {
      acc[entry.stage] += 1;
      return acc;
    }, initialCounts);
  }, [entries]);

  const initialStage = useMemo<OrderStage>(() => {
    const firstWithOrders = ORDER_STAGES.find(
      (stage) => stageCounts[stage.key] > 0,
    );
    return (firstWithOrders ?? ORDER_STAGES[0]!).key;
  }, [stageCounts]);

  const [activeStage, setActiveStage] = useState<OrderStage>(initialStage);

  useEffect(() => {
    setActiveStage(initialStage);
  }, [initialStage]);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.stage === activeStage),
    [entries, activeStage],
  );

  const hasOrders = entries.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-neutral-100 bg-white/70 px-5 py-4 text-sm text-neutral-600 shadow-inner shadow-white/40">
        <p>
          {customerName ? `${customerName}，` : ""}
          当前可在这里查看所有订单进度，筛选不同状态并获取最新运单号。
        </p>
      </div>

      <div className="flex w-full items-center rounded-full border border-neutral-200 bg-neutral-100 p-1 text-sm">
        {ORDER_STAGES.map((stage) => {
          const isActive = stage.key === activeStage;

          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => setActiveStage(stage.key)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 font-medium transition",
                isActive
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700",
              )}
              aria-pressed={isActive}
            >
              {stage.label}
            </button>
          );
        })}
      </div>

      {!hasOrders ? (
        <EmptyState />
      ) : filteredEntries.length === 0 ? (
        <StageEmptyState stage={activeStage} />
      ) : (
        <div className="space-y-4">
          {filteredEntries.map(({ order, stage, compliance }) => (
            <OrderCard
              key={order.id}
              order={order}
              stage={stage}
              compliance={compliance}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type OrderCardProps = {
  order: Order;
  stage: OrderStage;
  compliance?: PrescriptionOrderCompliance;
};

function OrderCard({ order, stage, compliance }: OrderCardProps) {
  const createdAt = formatDate(order.createdAt);
  const totalAmount = formatMoney(
    order.totalPrice.amount,
    order.totalPrice.currencyCode,
  );
  const firstItem = order.lineItems[0];
  const totalQuantity = order.lineItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const extraItems = order.lineItems.length - 1;
  const summaryTitle = firstItem
    ? `${firstItem.productTitle}${extraItems > 0 ? ` 等 ${order.lineItems.length} 款` : ""}`
    : "商品信息待确认";
  const complianceMeta = compliance
    ? resolveComplianceMeta(compliance)
    : null;

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="block rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-900/5"
    >
      <div className="flex flex-col gap-4">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1 text-sm text-neutral-500">
            <p className="font-mono text-sm font-semibold text-neutral-900">
              订单号 {order.number}
            </p>
            <p className="text-xs text-neutral-400">创建于 {createdAt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {complianceMeta ? <ComplianceBadge meta={complianceMeta} /> : null}
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <PackageCheck className="h-4 w-4" aria-hidden />
              {getStageLabel(stage)}
            </span>
          </div>
        </header>

        <div className="flex gap-4">
          {firstItem?.image ? (
            <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <Image
                fill
                sizes="56px"
                src={firstItem.image.url}
                alt={firstItem.image.altText || firstItem.productTitle}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white text-xs text-neutral-400">
              无图
            </div>
          )}
          <div className="flex-1 space-y-2 text-sm text-neutral-600">
            <p className="font-semibold text-neutral-900">{summaryTitle}</p>
            {firstItem?.variantTitle ? (
              <p className="text-xs text-neutral-500">
                {firstItem.variantTitle}
              </p>
            ) : null}
            <p className="text-xs text-neutral-400">
              共 {totalQuantity} 件 · 实付 {totalAmount}
            </p>
          </div>
        </div>

        {complianceMeta ? <ComplianceNotice meta={complianceMeta} /> : null}

        <footer className="flex items-center justify-between text-xs text-neutral-400">
          <span>点击查看订单详情</span>
          <span className="inline-flex items-center gap-1 text-[#049e6b]">
            查看详情
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </footer>
      </div>
    </Link>
  );
}

type ComplianceMeta = {
  productLabel: string;
  description: string;
  details: string;
};

type ComplianceBadgeProps = {
  meta: ComplianceMeta;
};

function ComplianceBadge({ meta }: ComplianceBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
      title={`处方审核未完成：${meta.details}`}
    >
      <AlertCircle className="h-4 w-4" aria-hidden />
      <span className="flex items-center gap-1">
        订单异常
        <span className="hidden sm:inline">· {meta.productLabel}</span>
      </span>
      <span className="sr-only">{meta.description}</span>
    </span>
  );
}

type ComplianceNoticeProps = {
  meta: ComplianceMeta;
};

function ComplianceNotice({ meta }: ComplianceNoticeProps) {
  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-xs text-amber-700">
      <p className="font-semibold">处方审核未完成，暂无法发货</p>
      <p className="mt-1 text-[11px] text-amber-600">{meta.details}</p>
    </div>
  );
}

function resolveComplianceMeta(
  compliance: PrescriptionOrderCompliance,
): ComplianceMeta {
  const needsIdentity = !compliance.identityCompleted;
  const needsSurvey = compliance.pendingSurveyCount > 0;

  const descriptionParts = [
    needsIdentity ? "身份证待上传" : null,
    needsSurvey
      ? `${compliance.pendingSurveyCount} 份问卷待确认`
      : null,
  ].filter(Boolean);

  const description = descriptionParts.join(" · ") || "处方审核未完成";

  const productLabel = compliance.productTitles[0] ?? "处方药";

  return {
    productLabel,
    description,
    details: `${productLabel}：${description}`,
  };
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white/70 px-10 py-16 text-center shadow-inner shadow-white/40">
      <p className="text-base font-semibold text-neutral-900">暂无订单</p>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        当前账号还没有创建任何订单。前往商品详情页添加心仪商品并完成下单吧。
      </p>
    </div>
  );
}

type StageEmptyStateProps = {
  stage: OrderStage;
};

function StageEmptyState({ stage }: StageEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-white/70 px-6 py-10 text-center text-sm text-neutral-500 shadow-inner shadow-white/40">
      暂无处于「{getStageLabel(stage)}」阶段的订单。
    </div>
  );
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(amount: string, currencyCode: string) {
  const numeric = Number(amount);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(safeAmount);
}

export default AccountOrdersView;
