import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getCurrentUser,
  getSurveyAssignmentById,
  getSurveyTemplateById,
  getUserById,
} from "@/lib/api";
import type { IdentityVerificationStatus } from "@/lib/api/types";

import { AccountSurveyForm } from "./survey-form";

function formatDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

type AccountSurveyDetailProps = {
  assignmentId: string;
  showBackLink?: boolean;
};

export async function AccountSurveyDetail({
  assignmentId,
  showBackLink = true,
}: AccountSurveyDetailProps) {
  const assignment = await getSurveyAssignmentById(assignmentId);

  if (!assignment) {
    notFound();
  }

  const template = await getSurveyTemplateById(assignment.templateId);

  if (!template) {
    notFound();
  }

  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user || (user && user.id !== assignment.userId)) {
    notFound();
  }

  const identityStatus: IdentityVerificationStatus =
    user.identityVerification?.status ?? "unverified";

  return (
    <section className="space-y-6 rounded-3xl border border-neutral-100 bg-white/80 p-8 shadow-lg shadow-neutral-900/5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {showBackLink ? (
            <Link
              href="/account/surveys"
              prefetch
              className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 transition hover:text-neutral-900"
            >
              ← 返回我的问卷
            </Link>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              {assignment.status === "submitted" ? "已提交" : "待填写"}
            </span>
            <h1 className="text-xl font-semibold text-neutral-900">
              {assignment.productTitles.join("、")}
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            关联订单 {assignment.orderNumber} · 创建于{" "}
            {formatDate(assignment.createdAt)}
          </p>
          {assignment.status === "submitted" ? (
            <p className="text-xs text-neutral-400">
              已提交于 {formatDate(assignment.submittedAt)}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl bg-neutral-100 px-4 py-2 text-xs text-neutral-500">
          更新于 {formatDate(assignment.updatedAt)}
        </div>
      </header>

      <AccountSurveyForm
        assignment={assignment}
        template={template}
        identityStatus={identityStatus}
      />
    </section>
  );
}

export default AccountSurveyDetail;
