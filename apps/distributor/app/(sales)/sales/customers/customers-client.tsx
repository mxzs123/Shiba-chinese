"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { FilterDrawer } from "@/components/filter-drawer";
import { Pagination } from "@/components/pagination";
import type {
  Customer,
  CustomerFollowUp,
  CustomerFollowUpChannel,
  CustomerFollowUpCreateInput,
  CustomerFollowUpStatus,
  CustomerFollowUpUpdateInput,
  CustomerLevel,
  CustomerSource,
  CustomerStatus,
  CustomerType,
  Paginated,
} from "@shiba/models";

import {
  createCustomerFollowUpAction,
  deleteCustomerFollowUpAction,
  updateCustomerFollowUpAction,
} from "./actions";

interface CustomersClientProps {
  initialData: Paginated<Customer>;
}

type StatusFilter = CustomerStatus | "all";
type LevelFilter = CustomerLevel | "all";

interface FiltersState {
  status: StatusFilter;
  level: LevelFilter;
  types: Set<CustomerType>;
  sources: Set<CustomerSource>;
  regions: Set<string>;
}

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const DEFAULT_FILTERS: FiltersState = {
  status: "all",
  level: "all",
  types: new Set(),
  sources: new Set(),
  regions: new Set(),
};

const customerStatusMeta: Record<
  CustomerStatus,
  { label: string; badgeClassName: string }
> = {
  in_progress: {
    label: "跟进中",
    badgeClassName:
      "border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600",
  },
  converted: {
    label: "已成交",
    badgeClassName:
      "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600",
  },
  paused: {
    label: "暂缓跟进",
    badgeClassName:
      "border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600",
  },
  lost: {
    label: "流失",
    badgeClassName:
      "border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600",
  },
};

const customerLevelLabels: Record<CustomerLevel, string> = {
  standard: "普通",
  vip: "VIP",
  vvip: "VVIP",
  prospect: "潜在",
};

const customerTypeLabels: Record<CustomerType, string> = {
  personal: "个人客户",
  distributor: "分销商客户",
};

const customerSourceLabels: Record<CustomerSource, string> = {
  official_site: "官网",
  agency: "代理推荐",
  overseas_clinic: "海外诊所",
  sns: "SNS",
  member_event: "会员聚会",
  referral: "转介绍",
};

const followUpStatusLabels: Record<CustomerFollowUpStatus, string> = {
  pending: "待跟进",
  completed: "已完成",
  cancelled: "已取消",
};

const followUpChannelLabels: Record<CustomerFollowUpChannel, string> = {
  call: "电话",
  wechat: "微信",
  meeting: "面谈",
  message: "短信",
  email: "邮件",
  other: "其他",
};

const currencyFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
});

function formatDateTime(value?: string) {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return dateTimeFormatter.format(new Date(timestamp));
}

function formatDate(value?: string) {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }
  return dateFormatter.format(new Date(timestamp));
}

function toggleSetValue<T>(set: Set<T>, value: T) {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function normalizeSearchHaystack(customer: Customer) {
  return [
    customer.id,
    customer.name,
    customer.salesOwner,
    customer.contact.phone,
    customer.contact.wechat,
    customer.contact.email,
    customer.recentOrderId,
    ...customer.tags,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());
}

function resolveRegionLabel(customer: Customer) {
  const { province, city, country } = customer.region;
  if (province && city) {
    return `${province} · ${city}`;
  }
  if (city) {
    return `${country} · ${city}`;
  }
  return country;
}

function resolveRegionKey(customer: Customer) {
  const { province, city, country } = customer.region;
  if (province && city) {
    return `${province}-${city}`;
  }
  if (province) {
    return province;
  }
  if (city) {
    return city;
  }
  return country;
}

function formatDatetimeInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 16);
  }
  const offsetMilliseconds = date.getTimezoneOffset() * 60 * 1000;
  const local = new Date(date.getTime() - offsetMilliseconds);
  return local.toISOString().slice(0, 16);
}

function toISOStringWithTimezone(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

export function CustomersClient({ initialData }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialData.items);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    status: DEFAULT_FILTERS.status,
    level: DEFAULT_FILTERS.level,
    types: new Set(DEFAULT_FILTERS.types),
    sources: new Set(DEFAULT_FILTERS.sources),
    regions: new Set(DEFAULT_FILTERS.regions),
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(initialData.page || 1);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [autoCreateMode, setAutoCreateMode] = useState(false);

  const pageSize = useMemo(() => {
    const size = initialData.pageSize || 10;
    if (size >= 10) return 10;
    return size || 10;
  }, [initialData.pageSize]);

  const regionOptions = useMemo(() => {
    const entries = new Map<string, string>();
    customers.forEach((customer) => {
      const key = resolveRegionKey(customer);
      entries.set(key, resolveRegionLabel(customer));
    });
    return Array.from(entries.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      if (filters.status !== "all" && customer.status !== filters.status) {
        return false;
      }

      if (filters.level !== "all" && customer.level !== filters.level) {
        return false;
      }

      if (filters.types.size > 0 && !filters.types.has(customer.type)) {
        return false;
      }

      if (filters.sources.size > 0 && !filters.sources.has(customer.source)) {
        return false;
      }

      if (filters.regions.size > 0) {
        const key = resolveRegionKey(customer);
        if (!filters.regions.has(key)) {
          return false;
        }
      }

      if (normalizedTerm) {
        const haystack = normalizeSearchHaystack(customer);
        const hit = haystack.some((value) => value.includes(normalizedTerm));
        if (!hit) {
          return false;
        }
      }

      return true;
    });
  }, [customers, filters, searchTerm]);

  const total = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [
    filters.status,
    filters.level,
    filters.types,
    filters.sources,
    filters.regions,
    searchTerm,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, page, pageSize]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.status !== DEFAULT_FILTERS.status) count += 1;
    if (filters.level !== DEFAULT_FILTERS.level) count += 1;
    if (filters.types.size > 0) count += 1;
    if (filters.sources.size > 0) count += 1;
    if (filters.regions.size > 0) count += 1;
    return count;
  }, [filters]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return undefined;
    return customers.find((customer) => customer.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const consumeAutoCreate = useCallback(() => {
    setAutoCreateMode(false);
  }, []);

  const resetFilters = () => {
    setFilters({
      status: DEFAULT_FILTERS.status,
      level: DEFAULT_FILTERS.level,
      types: new Set(DEFAULT_FILTERS.types),
      sources: new Set(DEFAULT_FILTERS.sources),
      regions: new Set(DEFAULT_FILTERS.regions),
    });
  };

  const applyCustomerUpdate = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === updated.id ? updated : customer)),
    );
    setSelectedCustomerId(updated.id);
  };

  const handleCreateFollowUp = async (
    customerId: string,
    payload: CustomerFollowUpCreateInput,
  ): Promise<ActionResult<Customer>> => {
    const result = await createCustomerFollowUpAction(customerId, payload);
    if (result.success) {
      applyCustomerUpdate(result.data);
    }
    return result;
  };

  const handleUpdateFollowUp = async (
    customerId: string,
    followUpId: string,
    payload: CustomerFollowUpUpdateInput,
  ): Promise<ActionResult<Customer>> => {
    const result = await updateCustomerFollowUpAction(
      customerId,
      followUpId,
      payload,
    );
    if (result.success) {
      applyCustomerUpdate(result.data);
    }
    return result;
  };

  const handleDeleteFollowUp = async (
    customerId: string,
    followUpId: string,
  ): Promise<ActionResult<Customer>> => {
    const result = await deleteCustomerFollowUpAction(customerId, followUpId);
    if (result.success) {
      applyCustomerUpdate(result.data);
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-neutral-900">顾客管理</h1>
          <p className="text-sm text-neutral-500">
            维护客户画像、标签与跟进计划，支持快速分组筛选与抽屉详情管理。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterDrawer title="筛选客户" onReset={resetFilters}>
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  客户状态
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    { value: "all" as StatusFilter, label: "全部状态" },
                    { value: "in_progress" as StatusFilter, label: "跟进中" },
                    { value: "converted" as StatusFilter, label: "已成交" },
                    { value: "paused" as StatusFilter, label: "暂缓跟进" },
                    { value: "lost" as StatusFilter, label: "流失" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="customer-status"
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
                  客户等级
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {[
                    { value: "all" as LevelFilter, label: "全部等级" },
                    { value: "standard" as LevelFilter, label: "普通" },
                    { value: "vip" as LevelFilter, label: "VIP" },
                    { value: "vvip" as LevelFilter, label: "VVIP" },
                    { value: "prospect" as LevelFilter, label: "潜在" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="radio"
                        name="customer-level"
                        value={option.value}
                        checked={filters.level === option.value}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            level: option.value,
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
                  客户类型
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {(
                    Object.entries(customerTypeLabels) as Array<
                      [CustomerType, string]
                    >
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={`customer-type-${value}`}
                        value={value}
                        checked={filters.types.has(value)}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            types: toggleSetValue(prev.types, value),
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  客户来源
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {(
                    Object.entries(customerSourceLabels) as Array<
                      [CustomerSource, string]
                    >
                  ).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={`customer-source-${value}`}
                        value={value}
                        checked={filters.sources.has(value)}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            sources: toggleSetValue(prev.sources, value),
                          }))
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  所属地区
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {regionOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        name={`customer-region-${option.value}`}
                        value={option.value}
                        checked={filters.regions.has(option.value)}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            regions: toggleSetValue(prev.regions, option.value),
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
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            保存筛选视图（即将上线）
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            placeholder="搜索姓名、编号、联系方式或标签"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span>当前筛选：共 {total} 位客户</span>
          {activeFiltersCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
              {activeFiltersCount} 项筛选生效
            </span>
          ) : null}
        </div>
      </div>

      <DataTable<Customer>
        data={pageItems}
        rowKey={(row) => row.id}
        columns={[
          {
            header: "客户",
            cell: (row) => (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-900">
                    {row.name}
                  </p>
                  <span className="text-xs text-neutral-400">{row.id}</span>
                </div>
                {row.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {row.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ),
          },
          {
            header: "类型 · 等级",
            cell: (row) => (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-neutral-900">
                  {customerTypeLabels[row.type]}
                </p>
                <p className="text-xs text-neutral-500">
                  {customerLevelLabels[row.level]}
                </p>
              </div>
            ),
          },
          {
            header: "地区",
            cell: (row) => (
              <div className="text-sm text-neutral-600">
                {resolveRegionLabel(row)}
              </div>
            ),
          },
          {
            header: "来源",
            cell: (row) => (
              <span className="text-sm text-neutral-600">
                {customerSourceLabels[row.source]}
              </span>
            ),
          },
          {
            header: "联系方式",
            cell: (row) => (
              <div className="space-y-1 text-xs text-neutral-500">
                {row.contact.phone ? <p>电话：{row.contact.phone}</p> : null}
                {row.contact.wechat ? <p>微信：{row.contact.wechat}</p> : null}
                {row.contact.email ? <p>邮箱：{row.contact.email}</p> : null}
              </div>
            ),
          },
          {
            header: "状态",
            cell: (row) => (
              <span className={customerStatusMeta[row.status].badgeClassName}>
                {customerStatusMeta[row.status].label}
              </span>
            ),
          },
          {
            header: "跟进",
            cell: (row) => (
              <div className="space-y-1 text-xs text-neutral-500">
                <p>
                  上次：
                  <span className="text-neutral-900">
                    {formatDateTime(row.lastFollowUpAt)}
                  </span>
                </p>
                <p>
                  下次：
                  <span className="text-primary">
                    {formatDateTime(row.nextFollowUpAt)}
                  </span>
                </p>
              </div>
            ),
          },
          {
            header: "负责人",
            cell: (row) => (
              <div className="text-sm text-neutral-600">{row.salesOwner}</div>
            ),
          },
          {
            header: "操作",
            cell: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(row.id);
                    setAutoCreateMode(false);
                  }}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                >
                  查看详情
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId(row.id);
                    setAutoCreateMode(true);
                  }}
                  className="rounded-md border border-primary/30 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/5"
                >
                  新增跟进
                </button>
              </div>
            ),
          },
        ]}
        emptyMessage="暂无符合条件的客户"
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

      <CustomerDetailDrawer
        customer={selectedCustomer}
        autoCreate={autoCreateMode}
        onAutoCreateHandled={consumeAutoCreate}
        onClose={() => {
          setSelectedCustomerId(null);
          setAutoCreateMode(false);
        }}
        onCreateFollowUp={handleCreateFollowUp}
        onUpdateFollowUp={handleUpdateFollowUp}
        onDeleteFollowUp={handleDeleteFollowUp}
      />
    </div>
  );
}

interface CustomerDetailDrawerProps {
  customer?: Customer;
  autoCreate?: boolean;
  onAutoCreateHandled: () => void;
  onClose: () => void;
  onCreateFollowUp: (
    customerId: string,
    payload: CustomerFollowUpCreateInput,
  ) => Promise<ActionResult<Customer>>;
  onUpdateFollowUp: (
    customerId: string,
    followUpId: string,
    payload: CustomerFollowUpUpdateInput,
  ) => Promise<ActionResult<Customer>>;
  onDeleteFollowUp: (
    customerId: string,
    followUpId: string,
  ) => Promise<ActionResult<Customer>>;
}

function CustomerDetailDrawer({
  customer,
  autoCreate,
  onAutoCreateHandled,
  onClose,
  onCreateFollowUp,
  onUpdateFollowUp,
  onDeleteFollowUp,
}: CustomerDetailDrawerProps) {
  const [creationError, setCreationError] = useState<string | null>(null);
  const [editingFollowUp, setEditingFollowUp] =
    useState<CustomerFollowUp | null>(null);
  const [editingError, setEditingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!customer) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [customer]);

  useEffect(() => {
    if (!customer) {
      setEditingFollowUp(null);
      setCreationError(null);
      setEditingError(null);
    }
  }, [customer]);

  useEffect(() => {
    if (customer && autoCreate) {
      setEditingFollowUp({
        id: "__new__",
        title: "",
        plannedAt: new Date().toISOString(),
        channel: "call",
        status: "pending",
        notes: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setCreationError(null);
      onAutoCreateHandled();
    }
  }, [customer, autoCreate, onAutoCreateHandled]);

  if (!customer) {
    return null;
  }

  const handleCreate = async (payload: CustomerFollowUpCreateInput) => {
    setSubmitting(true);
    setCreationError(null);
    try {
      const result = await onCreateFollowUp(customer.id, payload);
      if (!result.success) {
        setCreationError(result.error);
        return false;
      }
      return true;
    } finally {
      setSubmitting(false);
    }
    return true;
  };

  const handleUpdate = async (
    followUpId: string,
    payload: CustomerFollowUpUpdateInput,
  ) => {
    setSubmitting(true);
    setEditingError(null);
    try {
      const result = await onUpdateFollowUp(customer.id, followUpId, payload);
      if (!result.success) {
        setEditingError(result.error);
        return;
      }
      setEditingFollowUp(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (followUpId: string) => {
    setSubmitting(true);
    setEditingError(null);
    try {
      const result = await onDeleteFollowUp(customer.id, followUpId);
      if (!result.success) {
        setEditingError(result.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-neutral-900/40" onClick={onClose} aria-hidden />
      <section className="flex h-full w-full max-w-2xl flex-col border-l border-neutral-200 bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-neutral-200 px-6 py-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-neutral-400">
              客户详情
            </p>
            <h2 className="text-lg font-semibold text-neutral-900">
              {customer.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span>{customer.id}</span>
              <span>·</span>
              <span>{customerTypeLabels[customer.type]}</span>
              <span>·</span>
              <span>{customerLevelLabels[customer.level]}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span
              className={customerStatusMeta[customer.status].badgeClassName}
            >
              {customerStatusMeta[customer.status].label}
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
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">基础档案</h3>
            <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-400">客户地区</p>
                <p className="mt-1 text-neutral-900">
                  {resolveRegionLabel(customer)}
                </p>
                {customer.address ? (
                  <p className="text-xs text-neutral-500">{customer.address}</p>
                ) : null}
              </div>
              <div>
                <p className="text-xs text-neutral-400">联系方式</p>
                <div className="mt-1 space-y-1 text-xs text-neutral-500">
                  {customer.contact.phone ? (
                    <p>电话：{customer.contact.phone}</p>
                  ) : null}
                  {customer.contact.wechat ? (
                    <p>微信：{customer.contact.wechat}</p>
                  ) : null}
                  {customer.contact.email ? (
                    <p>邮箱：{customer.contact.email}</p>
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-400">注册时间</p>
                <p className="mt-1 text-neutral-900">
                  {formatDate(customer.registeredAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">负责人</p>
                <p className="mt-1 text-neutral-900">{customer.salesOwner}</p>
              </div>
            </div>
            {customer.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            {customer.notes ? (
              <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                {customer.notes}
              </p>
            ) : null}
          </section>

          <section className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-900">业务概览</h3>
            <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-3">
              <div>
                <p className="text-xs text-neutral-400">累计订单</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  {customer.totalOrders ?? 0} 笔
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">累计成交额</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  {currencyFormatter.format(customer.totalAmount ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">最近订单</p>
                <p className="mt-1 text-base font-semibold text-neutral-900">
                  {customer.recentOrderId ?? "-"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 text-sm text-neutral-600 md:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-400">上次跟进时间</p>
                <p className="mt-1 text-neutral-900">
                  {formatDateTime(customer.lastFollowUpAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">下次跟进计划</p>
                <p className="mt-1 text-primary">
                  {formatDateTime(customer.nextFollowUpAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900">
                跟进计划
              </h3>
              <button
                type="button"
                className="rounded-md border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/5"
                onClick={() => {
                  setCreationError(null);
                  setEditingFollowUp({
                    id: "__new__",
                    title: "",
                    plannedAt: new Date().toISOString(),
                    channel: "call",
                    status: "pending",
                    notes: "",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  });
                }}
              >
                新增跟进计划
              </button>
            </div>

            {editingFollowUp && editingFollowUp.id === "__new__" ? (
              <FollowUpForm
                key="create-follow-up"
                titlePlaceholder="请输入跟进主题"
                followUp={editingFollowUp}
                submitting={submitting}
                error={creationError ?? undefined}
                onCancel={() => {
                  setEditingFollowUp(null);
                  setCreationError(null);
                }}
                onSubmit={async (input) => {
                  const success = await handleCreate({
                    title: input.title,
                    plannedAt: input.plannedAt,
                    channel: input.channel,
                    notes: input.notes,
                  });
                  if (success) {
                    setEditingFollowUp(null);
                  }
                }}
              />
            ) : null}

            <div className="space-y-3">
              {customer.followUps.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-200 px-3 py-4 text-center text-sm text-neutral-400">
                  暂无跟进记录，点击上方按钮创建第一条计划。
                </p>
              ) : (
                customer.followUps.map((followUp) => {
                  const isEditing = editingFollowUp?.id === followUp.id;
                  return (
                    <div
                      key={followUp.id}
                      className="rounded-lg border border-neutral-200 p-4 shadow-sm"
                    >
                      {isEditing ? (
                        <FollowUpForm
                          followUp={followUp}
                          submitting={submitting}
                          error={editingError ?? undefined}
                          onCancel={() => {
                            setEditingFollowUp(null);
                            setEditingError(null);
                          }}
                          onSubmit={async (input) => {
                            await handleUpdate(followUp.id, input);
                          }}
                        />
                      ) : (
                        <FollowUpPreview
                          followUp={followUp}
                          onEdit={() => {
                            setEditingFollowUp(followUp);
                            setEditingError(null);
                          }}
                          onDelete={() => handleDelete(followUp.id)}
                          onComplete={() =>
                            handleUpdate(followUp.id, { status: "completed" })
                          }
                          submitting={submitting}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

interface FollowUpFormProps {
  followUp: CustomerFollowUp;
  submitting: boolean;
  error?: string;
  onCancel: () => void;
  onSubmit: (
    input: CustomerFollowUpCreateInput & Partial<CustomerFollowUpUpdateInput>,
  ) => Promise<void>;
  titlePlaceholder?: string;
}

function FollowUpForm({
  followUp,
  submitting,
  error,
  onCancel,
  onSubmit,
  titlePlaceholder,
}: FollowUpFormProps) {
  const [title, setTitle] = useState(followUp.title);
  const [plannedAt, setPlannedAt] = useState(
    formatDatetimeInputValue(followUp.plannedAt),
  );
  const [channel, setChannel] = useState<CustomerFollowUpChannel>(
    followUp.channel,
  );
  const [notes, setNotes] = useState(followUp.notes ?? "");

  useEffect(() => {
    setTitle(followUp.title);
    setPlannedAt(formatDatetimeInputValue(followUp.plannedAt));
    setChannel(followUp.channel);
    setNotes(followUp.notes ?? "");
  }, [followUp]);

  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSubmit({
          title,
          plannedAt: toISOStringWithTimezone(plannedAt),
          channel,
          notes,
        });
      }}
    >
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500">主题</label>
        <input
          required
          type="text"
          value={title}
          placeholder={titlePlaceholder}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500">计划时间</label>
        <input
          required
          type="datetime-local"
          value={plannedAt}
          onChange={(event) => setPlannedAt(event.target.value)}
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500">沟通渠道</label>
        <select
          value={channel}
          onChange={(event) =>
            setChannel(event.target.value as CustomerFollowUpChannel)
          }
          className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {(
            Object.entries(followUpChannelLabels) as Array<
              [CustomerFollowUpChannel, string]
            >
          ).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-neutral-500">备注</label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="min-h-[88px] w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          disabled={submitting}
        >
          取消
        </button>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-neutral-300"
          disabled={submitting}
        >
          保存
        </button>
      </div>
    </form>
  );
}

interface FollowUpPreviewProps {
  followUp: CustomerFollowUp;
  submitting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

function FollowUpPreview({
  followUp,
  submitting,
  onEdit,
  onDelete,
  onComplete,
}: FollowUpPreviewProps) {
  const canComplete = followUp.status === "pending";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-neutral-900">
            {followUp.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span>{formatDateTime(followUp.plannedAt)}</span>
            <span>·</span>
            <span>{followUpChannelLabels[followUp.channel]}</span>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
              {followUpStatusLabels[followUp.status]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canComplete ? (
            <button
              type="button"
              onClick={onComplete}
              disabled={submitting}
              className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
            >
              标记完成
            </button>
          ) : null}
          <button
            type="button"
            onClick={onEdit}
            disabled={submitting}
            className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed"
          >
            编辑
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={submitting}
            className="rounded-md border border-rose-300 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400"
          >
            删除
          </button>
        </div>
      </div>
      {followUp.notes ? (
        <p className="rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
          {followUp.notes}
        </p>
      ) : null}
    </div>
  );
}
