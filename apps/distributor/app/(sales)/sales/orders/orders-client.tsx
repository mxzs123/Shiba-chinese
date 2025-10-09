"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { FilterDrawer } from "@/components/filter-drawer";
import { Pagination } from "@/components/pagination";
import type {
  SalesOrder,
  SalesOrdersMock,
  SalesOrderStatus,
} from "@/lib/mock/orders";

interface OrdersClientProps {
  initialData: SalesOrdersMock;
}

type StatusFilter = SalesOrderStatus | "all";
type DateRangeFilter = "all" | "7" | "30" | "90";

interface Filters {
  status: StatusFilter;
  dateRange: DateRangeFilter;
}

const DEFAULT_FILTERS: Filters = { status: "all", dateRange: "30" };

const statusMeta: Record<
  SalesOrderStatus,
  { label: string; className: string }
> = {
  completed: {
    label: "已完成",
    className:
      "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600",
  },
  processing: {
    label: "处理中",
    className:
      "border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600",
  },
  shipped: {
    label: "已发货",
    className:
      "border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
  },
  pending: {
    label: "待确认",
    className:
      "border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-xs font-medium text-neutral-600",
  },
  refunded: {
    label: "已退款",
    className:
      "border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600",
  },
};

const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "7", label: "最近 7 天" },
  { value: "30", label: "最近 30 天" },
  { value: "90", label: "最近 90 天" },
  { value: "all", label: "全部时间" },
];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "completed", label: "已完成" },
  { value: "processing", label: "处理中" },
  { value: "shipped", label: "已发货" },
  { value: "pending", label: "待确认" },
  { value: "refunded", label: "已退款" },
];

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

function parseSubmittedAt(value: string) {
  const normalized = value.replace(" ", "T");
  return new Date(`${normalized}:00`);
}

export function OrdersClient({ initialData }: OrdersClientProps) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(initialData.page);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const pageSize = initialData.pageSize || 10;
  const referenceDate = useMemo(() => {
    if (initialData.items.length === 0) {
      return new Date();
    }
    return initialData.items.reduce((latest, order) => {
      const submittedAt = parseSubmittedAt(order.submittedAt);
      return submittedAt > latest ? submittedAt : latest;
    }, parseSubmittedAt(initialData.items[0].submittedAt));
  }, [initialData.items]);

  const filteredOrders = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const daysLimit =
      filters.dateRange === "all" ? undefined : Number(filters.dateRange);

    return initialData.items.filter((order) => {
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }

      if (normalizedTerm) {
        const haystack = [
          order.id,
          order.customer.name,
          order.customer.id,
          order.customer.phone,
          order.shipment.trackingNo,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        const matchesSearch = haystack.some((value) =>
          value.includes(normalizedTerm),
        );

        if (!matchesSearch) {
          return false;
        }
      }

      if (daysLimit) {
        const submittedAt = parseSubmittedAt(order.submittedAt);
        const diff = referenceDate.getTime() - submittedAt.getTime();
        const diffDays = diff / (1000 * 60 * 60 * 24);
        if (diffDays > daysLimit) {
          return false;
        }
      }

      return true;
    });
  }, [initialData.items, filters, searchTerm, referenceDate]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.dateRange, searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, page, pageSize]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== "all") count += 1;
    if (filters.dateRange !== DEFAULT_FILTERS.dateRange) count += 1;
    return count;
  }, [filters]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 justify-between lg:flex-row lg:items-end">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-neutral-900">订单列表</h1>
          <p className="text-sm text-neutral-500">
            查看近 6 个月订单履约情况，支持快速筛选、明细核对与抽屉详情。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterDrawer
            title="筛选订单"
            onReset={() => setFilters({ ...DEFAULT_FILTERS })}
            onApply={() => undefined}
          >
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  订单状态
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="order-status"
                        value={option.value}
                        checked={filters.status === option.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            status: option.value,
                          }))
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  时间范围
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {dateRangeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="order-date-range"
                        value={option.value}
                        checked={filters.dateRange === option.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            dateRange: option.value,
                          }))
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </FilterDrawer>
          <button
            type="button"
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            导出报表
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            placeholder="搜索订单编号、客户姓名或手机号"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>当前筛选：共 {total} 笔订单</span>
          {activeFiltersCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
              {activeFiltersCount} 项筛选生效
            </span>
          ) : null}
        </div>
      </div>

      <DataTable<SalesOrder>
        data={pageItems}
        rowKey={(row) => row.id}
        columns={[
          { header: "订单编号", accessor: "id" },
          { header: "提交时间", accessor: "submittedAt" },
          {
            header: "订单金额",
            align: "right",
            cell: (row) => (
              <span className="font-semibold text-neutral-900">
                {currencyFormatter.format(row.amount)}
              </span>
            ),
          },
          { header: "支付方式", accessor: "paymentMethod" },
          {
            header: "订单状态",
            cell: (row) => (
              <span className={statusMeta[row.status].className}>
                {statusMeta[row.status].label}
              </span>
            ),
          },
          {
            header: "客户信息",
            cell: (row) => (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-neutral-900">
                  {row.customer.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {row.customer.type} · {row.customer.id}
                </p>
              </div>
            ),
          },
          {
            header: "联系方式",
            cell: (row) => (
              <div className="text-sm text-neutral-600">
                <p>{row.customer.phone}</p>
                <p className="text-xs text-neutral-400">
                  {row.customer.address}
                </p>
              </div>
            ),
          },
          {
            header: "发货日期",
            accessor: "shipment",
            cell: (row) => row.shipment.date,
          },
          {
            header: "快递单号",
            cell: (row) => row.shipment.trackingNo,
          },
          {
            header: "操作",
            cell: (row) => {
              const disabled = row.status === "refunded";

              return (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(row)}
                    className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                  >
                    查看详情
                  </button>
                  <Link
                    href={`/sales/orders/${row.id}/refund`}
                    className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${disabled ? "cursor-not-allowed border-neutral-200 text-neutral-400 pointer-events-none" : "border-primary/40 text-primary hover:bg-primary/5"}`}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : undefined}
                  >
                    {disabled ? "已申请退款" : "申请退款"}
                  </Link>
                </div>
              );
            },
          },
        ]}
        emptyMessage="暂无符合条件的订单"
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          正在查看第 {page} / {totalPages} 页（每页 {pageSize} 条）
        </p>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      </div>

      <OrderDetailDrawer
        order={selectedOrder ?? undefined}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

function OrderDetailDrawer({
  order,
  onClose,
}: {
  order?: SalesOrder;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!order) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [order]);

  if (!order) {
    return null;
  }

  const canApplyRefund = order.status !== "refunded";

  const merchandiseTotal = order.items.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const finalAmount = merchandiseTotal + order.shippingFee - order.discount;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-neutral-900/40" onClick={onClose} aria-hidden />
      <section className="flex h-full w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
              订单详情
            </p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">
              {order.id}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              <span>{order.submittedAt}</span>
              <span>·</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={statusMeta[order.status].className}>
              {statusMeta[order.status].label}
            </span>
            <Link
              href={`/sales/orders/${order.id}/refund`}
              className={`inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold transition ${canApplyRefund ? "border-primary/40 text-primary hover:bg-primary/5" : "cursor-not-allowed border-neutral-200 text-neutral-400 pointer-events-none"}`}
              aria-disabled={!canApplyRefund}
              tabIndex={canApplyRefund ? undefined : -1}
            >
              {canApplyRefund ? "申请退款" : "已申请退款"}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              关闭
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">概要信息</h3>
            <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-400">客户</p>
                <p className="mt-1 font-medium text-neutral-900">
                  {order.customer.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {order.customer.type} · {order.customer.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">联系方式</p>
                <p className="mt-1">{order.customer.phone}</p>
                <p className="text-xs text-neutral-500">
                  收货地址：{order.customer.address}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">物流信息</p>
                <p className="mt-1">{order.shipment.carrier}</p>
                <p className="text-xs text-neutral-500">
                  发货日期：{order.shipment.date}
                </p>
                <p className="text-xs text-neutral-500">
                  运单号：{order.shipment.trackingNo}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">金额摘要</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  {currencyFormatter.format(finalAmount)}
                </p>
                <p className="text-xs text-neutral-500">
                  含运费 {currencyFormatter.format(order.shippingFee)} · 优惠{" "}
                  {currencyFormatter.format(order.discount)}
                </p>
              </div>
            </div>
            {order.note ? (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                {order.note}
              </p>
            ) : null}
          </section>

          <section className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">商品明细</h3>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3 text-left">商品</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-right">数量</th>
                    <th className="px-4 py-3 text-right">单价</th>
                    <th className="px-4 py-3 text-right">小计</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-neutral-900">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {item.sku}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {currencyFormatter.format(item.unitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-neutral-900">
                        {currencyFormatter.format(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <span>商品金额</span>
                <span>{currencyFormatter.format(merchandiseTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>运费</span>
                <span>{currencyFormatter.format(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>优惠</span>
                <span>-{currencyFormatter.format(order.discount)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 text-base font-semibold text-neutral-900">
                <span>应付金额</span>
                <span>{currencyFormatter.format(finalAmount)}</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
