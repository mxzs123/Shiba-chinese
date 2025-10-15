"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  DistributorPartner,
  DistributorPartnerApplication,
  DistributorPartnerStatus,
  Paginated,
} from "@shiba/models";

import { DataTable } from "../../../../components/data-table";
import { FilterDrawer } from "../../../../components/filter-drawer";
import { Pagination } from "../../../../components/pagination";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  fetchPartnerApplicationsAction,
  fetchPartnersAction,
  submitPartnerApplicationAction,
  updatePartnerStatusAction,
} from "./actions";

interface PartnersClientProps {
  initialData: Paginated<DistributorPartner>;
}

type PartnerStatusFilter = DistributorPartnerStatus | "all";
type PartnerRegionFilter = string | "all";

interface FeedbackState {
  type: "success" | "error";
  message: string;
}

interface ApplicationFormState {
  name: string;
  contact: string;
  region: string;
  note: string;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_STATUS: PartnerStatusFilter = "all";
const DEFAULT_REGION: PartnerRegionFilter = "all";

const statusMeta: Record<
  DistributorPartnerStatus,
  { label: string; tone: string }
> = {
  active: {
    label: "正常",
    tone: "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600",
  },
  paused: {
    label: "暂停",
    tone: "inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600",
  },
  disabled: {
    label: "停用",
    tone: "inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600",
  },
};

const applicationStatusMeta: Record<
  DistributorPartnerApplication["status"],
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "待审批",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "已通过",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "已退回",
    badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const APPROVAL_STEPS = [
  {
    id: "submit",
    title: "提交伙伴申请",
    description: "门店负责人填写基础信息与合作诉求，提交资质材料。",
  },
  {
    id: "review",
    title: "渠道运营初审",
    description: "渠道负责人确认资料完整性，与申请人沟通补充要点。",
  },
  {
    id: "approval",
    title: "总部审批决策",
    description: "总部根据门店条件完成准入评估，生成审批结论与备注。",
  },
  {
    id: "onboard",
    title: "账号开通与协同",
    description: "通过审批后，创建分销账号并派发培训/开业物料。",
  },
] as const;

const submissionTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function mapStatusLabel(status: PartnerStatusFilter) {
  if (status === "all") {
    return "全部状态";
  }
  return statusMeta[status].label;
}

function formatSubmissionTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return submissionTimeFormatter.format(date);
}

export function PartnersClient({ initialData }: PartnersClientProps) {
  const [partners, setPartners] = useState<DistributorPartner[]>(
    initialData.items,
  );
  const [page, setPage] = useState(initialData.page || 1);
  const pageSize = initialData.pageSize || DEFAULT_PAGE_SIZE;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<PartnerStatusFilter>(DEFAULT_STATUS);
  const [regionFilter, setRegionFilter] =
    useState<PartnerRegionFilter>(DEFAULT_REGION);

  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [creatingApplication, setCreatingApplication] = useState(false);
  const [pendingApplications, setPendingApplications] = useState<
    DistributorPartnerApplication[]
  >([]);
  const [applicationForm, setApplicationForm] = useState<ApplicationFormState>({
    name: "",
    contact: "",
    region: "",
    note: "",
  });

  const totalPendingApplications = pendingApplications.length;
  const pendingApplicationsPreview = useMemo(() => {
    return [...pendingApplications]
      .sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() -
          new Date(a.submittedAt).getTime(),
      )
      .slice(0, 3);
  }, [pendingApplications]);
  const hasMorePendingApplications =
    totalPendingApplications > pendingApplicationsPreview.length;
  const latestPendingSubmission = pendingApplicationsPreview[0]?.submittedAt;

  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    partners.forEach((partner) => {
      if (partner.region) {
        set.add(partner.region);
      }
    });
    return ["all", ...Array.from(set.values()).sort()];
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    return partners.filter((partner) => {
      if (statusFilter !== "all" && partner.status !== statusFilter) {
        return false;
      }

      if (regionFilter !== "all" && partner.region !== regionFilter) {
        return false;
      }

      if (!normalizedTerm) {
        return true;
      }

      const haystack = [
        partner.id,
        partner.name,
        partner.contact,
        partner.region,
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      return haystack.some((value) => value.includes(normalizedTerm));
    });
  }, [partners, searchTerm, statusFilter, regionFilter]);

  const total = filteredPartners.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, regionFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredPartners.slice(start, end);
  }, [filteredPartners, page, pageSize]);

  const handleResetFilters = () => {
    setStatusFilter(DEFAULT_STATUS);
    setRegionFilter(DEFAULT_REGION);
  };

  const handleStatusChange = async (
    partner: DistributorPartner,
    status: DistributorPartnerStatus,
  ) => {
    setSubmittingId(partner.id);
    setFeedback(null);

    try {
      const result = await updatePartnerStatusAction(partner.id, status);
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        return;
      }

      setPartners((prev) =>
        prev.map((item) => (item.id === partner.id ? result.data : item)),
      );
      setFeedback({
        type: "success",
        message: `${partner.name} 状态已更新为 ${statusMeta[status].label}`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: (error as Error).message ?? "状态更新失败，请稍后重试",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setFeedback(null);
    try {
      const result = await fetchPartnersAction();
      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        return;
      }
      setPartners(result.data.items);
      setPage(result.data.page || 1);
    } catch (error) {
      setFeedback({
        type: "error",
        message: (error as Error).message ?? "伙伴列表刷新失败",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplicationFieldChange = <K extends keyof ApplicationFormState>(
    key: K,
    value: ApplicationFormState[K],
  ) => {
    setApplicationForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitApplication = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setCreatingApplication(true);
    setFeedback(null);

    try {
      const result = await submitPartnerApplicationAction({
        name: applicationForm.name,
        contact: applicationForm.contact,
        region: applicationForm.region,
        note: applicationForm.note,
      });

      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        return;
      }

      setPendingApplications((prev) => [result.data, ...prev]);
      setFeedback({
        type: "success",
        message: "申请已提交，待总部审批处理",
      });
      setApplicationForm({ name: "", contact: "", region: "", note: "" });
      setShowApplicationForm(false);
    } catch (error) {
      setFeedback({
        type: "error",
        message: (error as Error).message ?? "申请提交失败，请稍后重试",
      });
    } finally {
      setCreatingApplication(false);
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      const result = await fetchPartnerApplicationsAction();
      if (result.success) {
        setPendingApplications(result.data);
      }
    };

    loadApplications();
  }, []);

  return (
    <section className="space-y-6">
      <Card className="border border-primary/20 bg-white shadow-sm">
        <CardHeader className="gap-2 pb-4">
          <CardTitle className="text-lg font-semibold text-neutral-900">
            伙伴审批流程
          </CardTitle>
          <p className="text-sm text-neutral-500">
            跟踪二级伙伴申请的审批进度，并快速查看当前待处理事项。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                审批步骤
              </p>
              <ol className="space-y-4">
                {APPROVAL_STEPS.map((step, index) => (
                  <li key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center self-stretch">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {index + 1}
                      </span>
                      {index < APPROVAL_STEPS.length - 1 ? (
                        <span className="mt-2 w-px flex-1 bg-primary/20" />
                      ) : null}
                    </div>
                    <div className="space-y-1 pt-1">
                      <p className="text-sm font-semibold text-neutral-900">
                        {step.title}
                      </p>
                      <p className="text-xs leading-relaxed text-neutral-500">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    待审批事项
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-neutral-900">
                      {totalPendingApplications}
                    </span>
                    <span className="text-sm text-neutral-500">
                      份等待总部处理
                    </span>
                  </div>
                  {latestPendingSubmission ? (
                    <p className="text-xs text-neutral-500">
                      最新申请提交于 {formatSubmissionTime(latestPendingSubmission)}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      当前没有排队中的伙伴申请。
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${applicationStatusMeta.pending.badgeClass}`}
                >
                  {applicationStatusMeta.pending.label}
                </Badge>
              </div>
              {totalPendingApplications === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-4 text-sm text-neutral-500">
                  提交首个伙伴申请后，可在此跟踪审批节点与处理建议。
                </div>
              ) : (
                <ul className="space-y-3">
                  {pendingApplicationsPreview.map((application) => (
                    <li
                      key={application.id}
                      className="rounded-lg border border-neutral-200 bg-white p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-neutral-900">
                          {application.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`border px-2 py-0.5 text-[11px] ${applicationStatusMeta[application.status].badgeClass}`}
                        >
                          {applicationStatusMeta[application.status].label}
                        </Badge>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                        <span>{application.contact}</span>
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                        <span>{application.region}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-400">
                        提交时间：{formatSubmissionTime(application.submittedAt)}
                      </p>
                      {application.note ? (
                        <p className="mt-2 text-xs text-neutral-500">
                          备注：{application.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                  {hasMorePendingApplications ? (
                    <li className="text-xs text-neutral-400">
                      其余 {totalPendingApplications - pendingApplicationsPreview.length} 份申请将在审批台上线后展示完整列表。
                    </li>
                  ) : null}
                </ul>
              )}
              {!showApplicationForm ? (
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(true)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary/90"
                >
                  发起新增伙伴申请
                </button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-neutral-900">
            二级分销商管理
          </h1>
          <p className="text-sm text-neutral-500">
            搜索、筛选并管理二级伙伴状态，及时掌握启停情况与审批进展。
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <span>当前展示 {total} 家伙伴</span>
            {statusFilter !== "all" ? (
              <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                状态：{mapStatusLabel(statusFilter)}
              </span>
            ) : null}
            {regionFilter !== "all" ? (
              <span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-primary">
                地区：{regionFilter}
              </span>
            ) : null}
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
          <FilterDrawer
            title="筛选伙伴"
            onReset={handleResetFilters}
            onApply={() => undefined}
          >
            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  状态
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {["all", "active", "paused", "disabled"].map((value) => {
                    const label = mapStatusLabel(value as PartnerStatusFilter);
                    return (
                      <label key={value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="partner-status"
                          value={value}
                          checked={statusFilter === value}
                          onChange={() =>
                            setStatusFilter(value as PartnerStatusFilter)
                          }
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  地区
                </h3>
                <div className="mt-3 space-y-2 text-sm">
                  {regionOptions.map((value) => (
                    <label key={value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="partner-region"
                        value={value}
                        checked={regionFilter === value}
                        onChange={() =>
                          setRegionFilter(value as PartnerRegionFilter)
                        }
                      />
                      <span>{value === "all" ? "全部地区" : value}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </FilterDrawer>
          <button
            type="button"
            onClick={() => setShowApplicationForm((prev) => !prev)}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            {showApplicationForm ? "收起申请" : "申请新增伙伴"}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="search"
            placeholder="搜索分销商编号、名称或联系方式"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        {feedback ? (
          <div
            className={`rounded-md px-3 py-2 text-xs ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}
      </div>

      {showApplicationForm ? (
        <form
          onSubmit={handleSubmitApplication}
          className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-5"
        >
          <div>
            <h2 className="text-sm font-semibold text-primary">新增伙伴申请</h2>
            <p className="mt-1 text-xs text-primary/70">
              填写伙伴基本信息后提交，总部将完成资质审核与账号创建。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">伙伴名称 *</span>
              <input
                name="name"
                value={applicationForm.name}
                onChange={(event) =>
                  handleApplicationFieldChange("name", event.target.value)
                }
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">联系方式 *</span>
              <input
                name="contact"
                value={applicationForm.contact}
                onChange={(event) =>
                  handleApplicationFieldChange("contact", event.target.value)
                }
                placeholder="电话 / 微信 / 邮箱"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">所在地区 *</span>
              <input
                name="region"
                value={applicationForm.region}
                onChange={(event) =>
                  handleApplicationFieldChange("region", event.target.value)
                }
                placeholder="例如 广东 · 深圳"
                required
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="space-y-1 text-sm text-neutral-600">
              <span className="font-medium text-neutral-900">备注说明</span>
              <input
                name="note"
                value={applicationForm.note}
                onChange={(event) =>
                  handleApplicationFieldChange("note", event.target.value)
                }
                placeholder="可补充门店规模、支持诉求等"
                className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowApplicationForm(false)}
              className="rounded-md border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={creatingApplication}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {creatingApplication ? "提交中..." : "提交申请"}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable<DistributorPartner>
        data={paginatedItems}
        rowKey={(row) => row.id}
        emptyMessage="暂无符合条件的伙伴"
        columns={[
          {
            header: "分销商编号",
            cell: (row) => (
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-neutral-900">{row.id}</p>
                <p className="text-xs text-neutral-500">
                  加入时间：{row.joinedAt ?? "--"}
                </p>
              </div>
            ),
          },
          {
            header: "分销商名称",
            cell: (row) => (
              <div className="space-y-1 text-sm">
                <p className="font-medium text-neutral-900">{row.name}</p>
                {row.note ? (
                  <p className="text-xs text-amber-600">{row.note}</p>
                ) : null}
              </div>
            ),
          },
          {
            header: "联系方式",
            cell: (row) => (
              <p className="text-sm text-neutral-600">{row.contact}</p>
            ),
          },
          {
            header: "地区",
            cell: (row) => (
              <p className="text-sm text-neutral-600">{row.region}</p>
            ),
          },
          {
            header: "状态",
            cell: (row) => (
              <span className={statusMeta[row.status].tone}>
                {statusMeta[row.status].label}
              </span>
            ),
          },
          {
            header: "操作",
            align: "right",
            cell: (row) => (
              <div className="flex justify-end">
                <select
                  value={row.status}
                  disabled={submittingId === row.id}
                  onChange={(event) =>
                    handleStatusChange(
                      row,
                      event.target.value as DistributorPartnerStatus,
                    )
                  }
                  className="min-w-[120px] rounded-md border border-neutral-200 px-2 py-1.5 text-xs text-neutral-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed"
                >
                  <option value="active">设为正常</option>
                  <option value="paused">设为暂停</option>
                  <option value="disabled">设为停用</option>
                </select>
              </div>
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
    </section>
  );
}
