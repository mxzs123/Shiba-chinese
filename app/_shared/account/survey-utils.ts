import type { SurveyAssignment } from "@/lib/api/types";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("zh-CN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDateTime(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return DATE_TIME_FORMAT.format(date);
}

export function getAssignmentTitle(assignment: SurveyAssignment) {
  if (assignment.productTitles.length === 1) {
    return assignment.productTitles[0] ?? "处方药问卷";
  }

  return `${assignment.productTitles[0] ?? "处方药问卷"} 等`;
}

export function getAssignmentSubtitle(assignment: SurveyAssignment) {
  return `关联订单 ${assignment.orderNumber}`;
}

export function getStatusText(assignment: SurveyAssignment) {
  return assignment.status === "submitted"
    ? `提交于 ${formatDateTime(assignment.submittedAt)}`
    : `最后更新 ${formatDateTime(assignment.updatedAt)}`;
}

export function sortAssignments(assignments: SurveyAssignment[]) {
  return assignments.slice().sort((first, second) => {
    const firstDate = new Date(first.updatedAt).getTime();
    const secondDate = new Date(second.updatedAt).getTime();
    return secondDate - firstDate;
  });
}
