"use client";

import { useEffect, useMemo, useState } from "react";

import { DataTable } from "../../../../components/data-table";
import { FilterDrawer } from "../../../../components/filter-drawer";
import { Pagination } from "../../../../components/pagination";
import type {
  DistributorOrder,
  DistributorOrdersMock,
  DistributorOrderType,
} from "../../../../lib/mock/orders";

type OrderTypeFilter = DistributorOrderType | "all";
type DateRangeFilter = "30" | "90" | "180" | "all";

interface Filters {
  orderType: OrderTypeFilter;
  dateRange: DateRangeFilter;
}

const DEFAULT_FILTERS: Filters = { orderType: "all", dateRange: "180" };

const orderTypeOptions: { value: OrderTypeFilter; label: string }[] = [
  { value: "all", label: "全部订单" },
  { value: "primary", label: "一级分销" },
  { value: "secondary", label: "二级分销" },
];

const dateRangeOptions: { value: DateRangeFilter; label: string }[] = [
  { value: "30", label: "最近 30 天" },
  { value: "90", label: "最近 90 天" },
  { value: "180", label: "最近 180 天" },
  { value: "all", label: "全部时间" },
];

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const typeMeta: Record<
  DistributorOrderType,
  { label: string; className: string }
> = {
  primary: {
    label: "一级分销",
    className:
      "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600",
  },
  secondary: {
    label: "二级分销",
    className:
      "inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-600",
  },
};

function parseSubmittedAt(value: string) {
  const normalized = value.replace(" ", "T");
  return new Date(`${normalized}:00`);
}

interface DistributorOrdersClientProps {
  initialData: DistributorOrdersMock;
}

export function DistributorOrdersClient({
  initialData,
}: DistributorOrdersClientProps) {
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(initialData.page);
  const [selectedOrder, setSelectedOrder] = useState<DistributorOrder | null>(
    null,
  );

  const pageSize = initialData.pageSize || 10;

  const sortedOrders = useMemo(() => {
    return [...initialData.items].sort((a, b) => {
      const diff =
        parseSubmittedAt(b.submittedAt).getTime() -
        parseSubmittedAt(a.submittedAt).getTime();
      return diff;
    });
  }, [initialData.items]);

  const referenceDate = useMemo(() => {
    if (sortedOrders.length === 0) return new Date();
    return sortedOrders.reduce((latest, order) => {
      const submittedAt = parseSubmittedAt(order.submittedAt);
      return submittedAt > latest ? submittedAt : latest;
    }, parseSubmittedAt(sortedOrders[0]!.submittedAt));
  }, [sortedOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    const daysLimit =
      filters.dateRange === "all" ? undefined : Number(filters.dateRange);

    return sortedOrders.filter((order) => {
      if (filters.orderType !== "all" && order.type !== filters.orderType) {
        return false;
      }

      if (normalizedTerm) {
        const haystack = [
          order.id,
          order.customer.name,
          order.customer.id,
          order.customer.phone,
          order.secondaryDistributor?.name,
          order.secondaryDistributor?.phone,
          order.shipment?.trackingNo,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());

        const matches = haystack.some((value) =>
          value.includes(normalizedTerm),
        );
        if (!matches) {
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
  }, [sortedOrders, filters, searchTerm, referenceDate]);

  const total = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filters.orderType, filters.dateRange, searchTerm]);

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
    if (filters.orderType !== DEFAULT_FILTERS.orderType) count += 1;
    if (filters.dateRange !== DEFAULT_FILTERS.dateRange) count += 1;
    if (searchTerm.trim()) count += 1;
    return count;
  }, [filters, searchTerm]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-neutral-900">订单列表</h1>
          <p className="text-sm text-neutral-500">
            查看近半年内的一级/二级分销订单，按层级筛选并快速核对履约信息。
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
                  订单层级
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {orderTypeOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="order-type"
                        value={option.value}
                        checked={filters.orderType === option.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            orderType: option.value,
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

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex flex-nowrap items-center gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
            {orderTypeOptions.map((option) => {
              const isActive = filters.orderType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      orderType: option.value,
                    }))
                  }
                  aria-pressed={isActive}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition whitespace-nowrap ${isActive ? "bg-primary/10 text-primary shadow-inner" : "text-neutral-600 hover:bg-neutral-50"}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="relative w-full max-w-sm">
            <input
              type="search"
              placeholder="搜索订单编号、客户或伙伴"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>当前筛选：共 {total} 笔订单</span>
            {activeFiltersCount > 0 ? (
              <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                {activeFiltersCount} 项筛选生效
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <DataTable<DistributorOrder>
        data={pageItems}
        rowKey={(row) => row.id}
        emptyMessage="暂无符合条件的订单"
        columns={[
          {
            header: "订单层级",
            cell: (row) => (
              <span className={typeMeta[row.type].className}>
                {typeMeta[row.type].label}
              </span>
            ),
          },
          {
            header: "订单编号",
            cell: (row) => (
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-neutral-900">{row.id}</p>
                <p className="text-xs text-neutral-500">
                  {row.type === "secondary"
                    ? `由 ${row.secondaryDistributor?.name ?? "—"} 提交`
                    : `所属：${row.distributorName}`}
                </p>
              </div>
            ),
          },
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
            cell: (row) => {
              if (row.type === "secondary" && row.secondaryDistributor) {
                return (
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p className="font-medium text-neutral-900">
                      {row.secondaryDistributor.contact}
                    </p>
                    <p>{row.secondaryDistributor.phone}</p>
                    <p className="text-xs text-neutral-500">
                      {row.secondaryDistributor.region}
                    </p>
                  </div>
                );
              }

              return (
                <div className="text-sm text-neutral-600">
                  <p>{row.customer.phone}</p>
                </div>
              );
            },
          },
          {
            header: "收货地址",
            cell: (row) => (
              <p className="text-sm text-neutral-600">{row.customer.address}</p>
            ),
          },
          {
            header: "发货日期",
            cell: (row) => row.shipment?.date ?? "—",
          },
          {
            header: "快递单号",
            cell: (row) =>
              row.shipment ? (
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-neutral-900">
                    {row.shipment.trackingNo}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {row.shipment.carrier}
                  </p>
                </div>
              ) : (
                <span className="text-sm text-neutral-400">
                  由二级伙伴自配送
                </span>
              ),
          },
          {
            header: "操作",
            cell: (row) => (
              <button
                type="button"
                onClick={() => setSelectedOrder(row)}
                className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                查看详情
              </button>
            ),
          },
        ]}
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
  order?: DistributorOrder;
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

  const merchandiseTotal = order.items.reduce(
    (sum, item) => sum + item.total,
    0,
  );
  const shippingFee = order.shippingFee ?? 0;
  const discount = order.discount ?? 0;
  const finalAmount = merchandiseTotal + shippingFee - discount;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-neutral-900/40" onClick={onClose} aria-hidden />
      <section className="flex h-full w-full max-w-xl flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={typeMeta[order.type].className}>
                {typeMeta[order.type].label}
              </span>
              <h2 className="text-lg font-semibold text-neutral-900">
                {order.id}
              </h2>
            </div>
            <div className="text-xs text-neutral-500">
              <p>{order.submittedAt}</p>
              <p className="mt-1">
                归属分销商：{order.distributorName}（{order.distributorId}）
              </p>
              {order.type === "secondary" && order.secondaryDistributor ? (
                <p className="mt-1">
                  由 {order.secondaryDistributor.name} 提交
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className="text-base font-semibold text-neutral-900">
              {currencyFormatter.format(order.amount)}
            </span>
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
          <section className="space-y-4">
            <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-400">客户</p>
                <p className="mt-1 font-medium text-neutral-900">
                  {order.customer.name}
                </p>
                <p className="text-xs text-neutral-500">
                  {order.customer.type} · {order.customer.id}
                </p>
                <p className="text-xs text-neutral-500">
                  电话：{order.customer.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">收货地址</p>
                <p className="mt-1 leading-relaxed text-neutral-600">
                  {order.customer.address}
                </p>
              </div>
              {order.secondaryDistributor ? (
                <div>
                  <p className="text-xs text-neutral-400">二级分销伙伴</p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {order.secondaryDistributor.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    联系人：{order.secondaryDistributor.contact}
                  </p>
                  <p className="text-xs text-neutral-500">
                    电话：{order.secondaryDistributor.phone}
                  </p>
                  <p className="text-xs text-neutral-500">
                    区域：{order.secondaryDistributor.region}
                  </p>
                </div>
              ) : null}
              {order.shipment ? (
                <div>
                  <p className="text-xs text-neutral-400">物流信息</p>
                  <p className="mt-1 font-medium text-neutral-900">
                    {order.shipment.carrier}
                  </p>
                  <p className="text-xs text-neutral-500">
                    发货日期：{order.shipment.date}
                  </p>
                  <p className="text-xs text-neutral-500">
                    运单号：{order.shipment.trackingNo}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-neutral-400">物流信息</p>
                  <p className="mt-1 text-neutral-600">
                    由二级分销伙伴负责配送或自提。
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-neutral-400">金额摘要</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  {currencyFormatter.format(finalAmount)}
                </p>
                <p className="text-xs text-neutral-500">
                  商品金额 {currencyFormatter.format(merchandiseTotal)} · 运费{" "}
                  {currencyFormatter.format(shippingFee)} · 优惠 -
                  {currencyFormatter.format(discount)}
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
                <span>{currencyFormatter.format(shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>优惠</span>
                <span>-{currencyFormatter.format(discount)}</span>
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
