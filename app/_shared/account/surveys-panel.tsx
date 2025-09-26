import Link from "next/link";

import {
  getCurrentUser,
  getSurveyAssignmentsByUser,
  getUserById,
} from "@/lib/api";
import type { SurveyAssignment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return DATE_TIME_FORMAT.format(date);
}

function getAssignmentTitle(assignment: SurveyAssignment) {
  if (assignment.productTitles.length === 1) {
    return assignment.productTitles[0] ?? "处方药问卷";
  }

  return `${assignment.productTitles[0] ?? "处方药问卷"} 等`;
}

function getAssignmentSubtitle(assignment: SurveyAssignment) {
  return `关联订单 ${assignment.orderNumber}`;
}

function getStatusText(assignment: SurveyAssignment) {
  return assignment.status === "submitted"
    ? `提交于 ${formatDateTime(assignment.submittedAt)}`
    : `最后更新 ${formatDateTime(assignment.updatedAt)}`;
}

function sortAssignments(assignments: SurveyAssignment[]) {
  return assignments.slice().sort((first, second) => {
    const firstDate = new Date(first.updatedAt).getTime();
    const secondDate = new Date(second.updatedAt).getTime();
    return secondDate - firstDate;
  });
}

type AccountSurveysPanelProps = {
  highlightPending?: boolean;
};

export async function AccountSurveysPanel({
  highlightPending = false,
}: AccountSurveysPanelProps) {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    return (
      <section className="rounded-3xl border border-neutral-100 bg-white/80 p-10 text-center shadow-lg shadow-neutral-900/5">
        <h2 className="text-xl font-semibold text-neutral-900">我的问卷</h2>
        <p className="mt-3 text-sm text-neutral-500">
          暂未获取到示例用户数据，请稍后再试。
        </p>
      </section>
    );
  }

  const assignments = await getSurveyAssignmentsByUser(user.id);
  const pendingAssignments = sortAssignments(
    assignments.filter((assignment) => assignment.status !== "submitted"),
  );
  const submittedAssignments = sortAssignments(
    assignments.filter((assignment) => assignment.status === "submitted"),
  );

  const needsIdentityReminder =
    pendingAssignments.length > 0 &&
    (user.identityVerification?.status ?? "unverified") !== "verified";

  const renderAssignments = (
    items: SurveyAssignment[],
    type: "pending" | "submitted",
  ) => {
    if (!items.length) {
      return (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-500">
          {type === "pending"
            ? "当前没有需要填写的问卷，完成处方药下单后会在此生成待办。"
            : "暂未提交过问卷，完成填写后可在此查看历史记录。"}
        </div>
      );
    }

    return (
      <ul className="space-y-4">
        {items.map((assignment, index) => {
          const href = `/account/surveys/${assignment.id}`;
          const isPending = assignment.status !== "submitted";
          const shouldHighlight =
            highlightPending && type === "pending" && index === 0;

          return (
            <li
              key={assignment.id}
              className={cn(
                "rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm shadow-neutral-900/5",
                shouldHighlight &&
                  "border-amber-400 shadow-amber-200/60 ring-2 ring-amber-200 motion-safe:animate-[pulse_1.6s_ease-in-out_2]",
              )}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {isPending ? "待填写" : "已提交"}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {getStatusText(assignment)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-neutral-900">
                    {getAssignmentTitle(assignment)}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {getAssignmentSubtitle(assignment)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <Link
                    href={href}
                    prefetch
                    className={`inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition ${
                      isPending
                        ? "bg-primary text-primary-foreground hover:brightness-105"
                        : "border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
                    }`}
                  >
                    {isPending ? "继续填写" : "查看记录"}
                  </Link>
                  <span className="text-xs text-neutral-400">
                    适用药品：{assignment.productTitles.join("、")}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-100 bg-white/80 p-8 shadow-lg shadow-neutral-900/5">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">我的问卷</h2>
          <p className="text-sm text-neutral-500">
            处方药下单后会生成对应问卷，请在药师审核前完成填写。
          </p>
        </div>
        <div className="text-xs text-neutral-400">
          共 {assignments.length} 份记录
        </div>
      </header>

      {needsIdentityReminder ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-700">
          <p>为确保合规发货，请先完成身份证上传。提交身份证后即可填写问卷。</p>
          <Link
            href="/account/profile"
            prefetch
            className="mt-2 inline-flex items-center text-xs font-semibold text-amber-700 underline decoration-amber-400 underline-offset-4 hover:text-amber-800"
          >
            前往身份验证
          </Link>
        </div>
      ) : null}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">待填写</h3>
          <p className="text-xs text-neutral-500">
            包含最近未提交的问卷与需要补充证明材料的记录。
          </p>
          <div className="mt-3" id="pending">
            {renderAssignments(pendingAssignments, "pending")}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">已提交</h3>
          <p className="text-xs text-neutral-500">
            查看历史提交内容与上传的凭证，供药师与客服校对使用。
          </p>
          <div className="mt-3">
            {renderAssignments(submittedAssignments, "submitted")}
          </div>
        </div>
      </section>
    </section>
  );
}

export default AccountSurveysPanel;
