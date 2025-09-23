"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Order } from "@/lib/api/types";
import { PackageCheck, Truck } from "lucide-react";

const ORDER_STAGES = [
  { key: "created", label: "创建" },
  { key: "pending", label: "待支付" },
  { key: "paid", label: "已支付待确认" },
  { key: "fulfilled", label: "已发货" },
] as const;

type OrderStage = (typeof ORDER_STAGES)[number]["key"];

type OrderEntry = {
  order: Order;
  stage: OrderStage;
};

type AccountOrdersViewProps = {
  orders: Order[];
  customerName?: string;
};

export function AccountOrdersView({ orders, customerName }: AccountOrdersViewProps) {
  const entries = useMemo<OrderEntry[]>(
    () =>
      orders.map((order) => ({
        order,
        stage: resolveOrderStage(order),
      })),
    [orders],
  );

  const stageCounts = useMemo(() => {
    const counts: Record<OrderStage, number> = {
      created: 0,
      pending: 0,
      paid: 0,
      fulfilled: 0,
    };

    entries.forEach((entry) => {
      counts[entry.stage] += 1;
    });

    return counts;
  }, [entries]);

  const initialStage = useMemo<OrderStage>(() => {
    const firstWithOrders = ORDER_STAGES.find((stage) => stageCounts[stage.key] > 0);
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
          {filteredEntries.map(({ order, stage }) => (
            <OrderCard key={order.id} order={order} stage={stage} />
          ))}
        </div>
      )}
    </div>
  );
}

type OrderCardProps = {
  order: Order;
  stage: OrderStage;
};

function OrderCard({ order, stage }: OrderCardProps) {
  const createdAt = formatDate(order.createdAt);
  const totalAmount = formatMoney(
    order.totalPrice.amount,
    order.totalPrice.currencyCode,
  );
  const trackingNumber = order.tracking?.trackingNumber ?? "待更新";

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1 text-sm text-neutral-500">
          <p className="font-mono text-sm font-semibold text-neutral-900">
            订单号 {order.number}
          </p>
          <p className="text-xs text-neutral-400">创建于 {createdAt}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <PackageCheck className="h-4 w-4" aria-hidden />
            {getStageLabel(stage)}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
          <h3 className="text-sm font-semibold text-neutral-800">商品明细</h3>
          <ul className="mt-3 divide-y divide-neutral-200">
            {order.lineItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3">
                {item.image ? (
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    <Image
                      fill
                      sizes="56px"
                      src={item.image.url}
                      alt={item.image.altText || item.productTitle}
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white text-xs text-neutral-400">
                    无图
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-semibold text-neutral-900">
                    {item.productTitle}
                  </p>
                  {item.variantTitle ? (
                    <p className="truncate text-xs text-neutral-500">
                      {item.variantTitle}
                    </p>
                  ) : null}
                  <p className="text-xs text-neutral-400">数量 × {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatMoney(item.totalPrice.amount, item.totalPrice.currencyCode)}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="space-y-3">
          <div className="rounded-2xl border border-neutral-100 bg-white/80 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              实付金额
            </p>
            <p className="mt-2 text-lg font-semibold text-neutral-900">{totalAmount}</p>
          </div>
          <div className="rounded-2xl border border-neutral-100 bg-white/80 px-4 py-3 text-sm text-neutral-600">
            <div className="flex items-center gap-2 text-neutral-500">
              <Truck className="h-4 w-4 text-neutral-400" aria-hidden />
              <span>运单号</span>
            </div>
            <p className="mt-3 font-medium text-neutral-900">{trackingNumber}</p>
            <p className="mt-1 text-xs text-neutral-400">
              若需查看实时轨迹，请通过客服查询。
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
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

function resolveOrderStage(order: Order): OrderStage {
  if (order.fulfillmentStatus === "fulfilled" || order.status === "fulfilled") {
    return "fulfilled";
  }

  if (
    order.status === "paid" ||
    order.financialStatus === "paid" ||
    order.financialStatus === "authorized" ||
    order.status === "processing"
  ) {
    return "paid";
  }

  if (order.status === "pending" || order.financialStatus === "pending") {
    return "pending";
  }

  return "created";
}

function getStageLabel(stage: OrderStage) {
  return ORDER_STAGES.find((entry) => entry.key === stage)?.label ?? stage;
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
