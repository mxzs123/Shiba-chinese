import {
  getCurrentUser,
  getSurveyAssignmentsByUser,
  getUserById,
} from "@/lib/api";
import type { SurveyAssignment } from "@/lib/api/types";

import { SurveyAssignmentItem } from "./survey-assignment-item";
import { SurveyBulkSubmit } from "./survey-bulk-submit";
import { sortAssignments } from "./survey-utils";
import { IdentityVerificationCard } from "./profile/identity-verification-card";
import { submitIdentityVerificationAction } from "./actions";

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
        <h2 className="text-xl font-semibold text-neutral-900">我的审核</h2>
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
          return (
            <SurveyAssignmentItem
              key={assignment.id}
              assignment={assignment}
              variant={type}
              highlight={highlightPending && type === "pending" && index === 0}
            />
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <IdentityVerificationCard
        userId={user.id}
        verification={user.identityVerification}
        action={submitIdentityVerificationAction}
      />

      <section className="space-y-6 rounded-3xl border border-neutral-100 bg-white/80 p-8 shadow-lg shadow-neutral-900/5">
        <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              处方药问卷
            </h2>
            <p className="text-sm text-neutral-500">
              处方药下单后会生成对应问卷，请在药师审核前完成填写。
            </p>
          </div>
          <div className="text-xs text-neutral-400">
            共 {assignments.length} 份记录
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">待填写</h3>
            <p className="text-xs text-neutral-500">
              包含最近未提交的问卷与需要补充证明材料的记录。
            </p>
            <div className="mt-3" id="pending">
              {pendingAssignments.length ? (
                <div className="space-y-4">
                  <SurveyBulkSubmit assignments={pendingAssignments} />
                  {renderAssignments(pendingAssignments, "pending")}
                </div>
              ) : (
                renderAssignments(pendingAssignments, "pending")
              )}
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
    </div>
  );
}

export default AccountSurveysPanel;
