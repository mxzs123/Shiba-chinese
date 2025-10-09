"use client";

import { useMemo, useState } from "react";

import type { Task } from "@shiba/models";

import { fetchTasksAction, updateTaskStatusAction } from "./actions";

interface TasksClientProps {
  initialTasks: Task[];
}

const priorityMeta: Record<
  Task["priority"],
  { label: string; badgeClass: string }
> = {
  high: {
    label: "高优先级",
    badgeClass:
      "bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 text-xs font-medium",
  },
  medium: {
    label: "中优先级",
    badgeClass:
      "bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-xs font-medium",
  },
  low: {
    label: "低优先级",
    badgeClass:
      "bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 text-xs font-medium",
  },
};

const statusMeta: Record<
  Task["status"],
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "待完成",
    badgeClass:
      "border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600",
  },
  in_progress: {
    label: "进行中",
    badgeClass:
      "border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary",
  },
  completed: {
    label: "已完成",
    badgeClass:
      "border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600",
  },
};

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
  if (Number.isNaN(timestamp)) return value;
  return dateTimeFormatter.format(new Date(timestamp));
}

function formatDate(value?: string) {
  if (!value) return "-";
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return value;
  return dateFormatter.format(new Date(timestamp));
}

export function TasksClient({ initialTasks }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedId, setExpandedId] = useState<string | null>(
    initialTasks[0]?.id ?? null,
  );
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const aDue = Date.parse(a.dueDate);
      const bDue = Date.parse(b.dueDate);
      if (Number.isNaN(aDue) && Number.isNaN(bDue)) return 0;
      if (Number.isNaN(aDue)) return 1;
      if (Number.isNaN(bDue)) return -1;
      return aDue - bDue;
    });
  }, [tasks]);

  const pendingCount = useMemo(
    () => sortedTasks.filter((task) => task.status !== "completed").length,
    [sortedTasks],
  );

  const completedCount = sortedTasks.length - pendingCount;

  const handleToggleDetails = (taskId: string) => {
    setExpandedId((current) => (current === taskId ? null : taskId));
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    setSubmittingId(task.id);
    setGlobalError(null);

    try {
      const result = await updateTaskStatusAction(task.id, nextStatus);
      if (!result.success) {
        setGlobalError(result.error);
        return;
      }

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? result.data : item)),
      );
    } catch (error) {
      setGlobalError((error as Error).message ?? "任务状态更新失败");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setGlobalError(null);
    try {
      const result = await fetchTasksAction();
      if (!result.success) {
        setGlobalError(result.error);
        return;
      }
      setTasks(result.data);
      if (!result.data.some((task) => task.id === expandedId)) {
        setExpandedId(result.data[0]?.id ?? null);
      }
    } catch (error) {
      setGlobalError((error as Error).message ?? "任务列表刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">任务中心</h1>
          <p className="mt-1 text-sm text-neutral-500">
            统一管理销售每日待办、审批与协作事项，支持查看详情并同步完成状态。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
            <span>
              待完成
              <span className="ml-1 font-semibold text-primary">
                {pendingCount}
              </span>
              条
            </span>
            <span>
              已完成
              <span className="ml-1 font-semibold text-emerald-600">
                {completedCount}
              </span>
              条
            </span>
            <span>全部任务 {sortedTasks.length} 条</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "正在刷新..." : "刷新列表"}
          </button>
        </div>
      </header>

      {globalError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {globalError}
        </div>
      ) : null}

      <div className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-200 bg-white px-6 py-12 text-center text-sm text-neutral-400">
            暂无任务，创建后即可在此跟踪每日待办。
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isExpanded = expandedId === task.id;
            const statusBadge = statusMeta[task.status];
            const priorityBadge = priorityMeta[task.priority];

            return (
              <article
                key={task.id}
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-primary/40"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleDetails(task.id)}
                      className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 text-sm font-medium text-neutral-500 transition hover:bg-neutral-50"
                      aria-label={isExpanded ? "折叠详情" : "展开详情"}
                    >
                      {isExpanded ? "−" : "+"}
                    </button>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-neutral-900">
                          {task.title}
                        </h2>
                        <span className={priorityBadge.badgeClass}>
                          {priorityBadge.label}
                        </span>
                        <span className={statusBadge.badgeClass}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                        <span>截止 {formatDateTime(task.dueDate)}</span>
                        {task.owner ? <span>负责人：{task.owner}</span> : null}
                        {task.relatedCustomerName ? (
                          <span>
                            关联客户：{task.relatedCustomerName}
                            {task.relatedCustomerId
                              ? `（${task.relatedCustomerId}）`
                              : ""}
                          </span>
                        ) : null}
                        {task.relatedOrderId ? (
                          <span>关联订单：{task.relatedOrderId}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDetails(task.id)}
                      className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
                    >
                      {isExpanded ? "收起详情" : "查看详情"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(task)}
                      disabled={submittingId === task.id}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-neutral-300"
                    >
                      {submittingId === task.id
                        ? "处理中..."
                        : task.status === "completed"
                          ? "重新打开"
                          : "标记完成"}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-4 space-y-4 border-t border-dashed border-neutral-200 pt-4 text-sm text-neutral-600">
                    <p>{task.description}</p>
                    {task.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
                        {task.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <dl className="grid gap-4 text-xs text-neutral-500 md:grid-cols-2">
                      <div>
                        <dt className="uppercase tracking-[0.18em] text-neutral-400">
                          创建时间
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {formatDateTime(task.createdAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.18em] text-neutral-400">
                          最近更新
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {formatDateTime(task.updatedAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.18em] text-neutral-400">
                          截止日期
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {formatDate(task.dueDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-[0.18em] text-neutral-400">
                          完成时间
                        </dt>
                        <dd className="mt-1 text-neutral-900">
                          {task.completedAt
                            ? formatDateTime(task.completedAt)
                            : "-"}
                        </dd>
                      </div>
                    </dl>
                    {task.notes ? (
                      <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
                        {task.notes}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
