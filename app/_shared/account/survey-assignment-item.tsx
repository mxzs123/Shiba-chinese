import Link from "next/link";

import type { SurveyAssignment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

import {
  getAssignmentSubtitle,
  getAssignmentTitle,
  getStatusText,
} from "./survey-utils";

type SurveyAssignmentItemProps = {
  assignment: SurveyAssignment;
  highlight?: boolean;
  variant: "pending" | "submitted";
};

export function SurveyAssignmentItem({
  assignment,
  highlight = false,
  variant,
}: SurveyAssignmentItemProps) {
  const isPendingAssignment = variant === "pending";
  const actionHref = `/account/surveys/${assignment.id}`;

  return (
    <li
      className={cn(
        "rounded-2xl border border-neutral-200 bg-white/95 p-5 shadow-sm shadow-neutral-900/5",
        highlight &&
          "border-amber-400 shadow-amber-200/60 ring-2 ring-amber-200 motion-safe:animate-[pulse_1.6s_ease-in-out_2]",
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                isPendingAssignment
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-neutral-100 text-neutral-600",
              )}
            >
              {isPendingAssignment ? "待填写" : "已提交"}
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
            href={actionHref}
            prefetch
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
              isPendingAssignment
                ? "bg-primary text-primary-foreground hover:brightness-105"
                : "border border-neutral-200 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900",
            )}
          >
            {isPendingAssignment ? "继续填写" : "查看记录"}
          </Link>
          <span className="text-xs text-neutral-400">
            适用药品：{assignment.productTitles.join("、")}
          </span>
        </div>
      </div>
    </li>
  );
}
