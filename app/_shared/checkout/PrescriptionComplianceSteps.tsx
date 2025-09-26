import Link from "next/link";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CircleAlert } from "lucide-react";

type PrescriptionComplianceStepsProps = {
  identityCompleted: boolean;
  identityHref: string;
  surveyCompleted: boolean;
  surveyHref: string;
  pendingSurveyCount?: number;
  className?: string;
  variant?: "default" | "minimal";
};

export function PrescriptionComplianceSteps({
  identityCompleted,
  identityHref,
  surveyCompleted,
  surveyHref,
  pendingSurveyCount,
  className,
  variant = "default",
}: PrescriptionComplianceStepsProps) {
  const steps = [
    {
      key: "identity",
      title: "上传身份证",
      description: identityCompleted
        ? "身份证信息已通过审核，可直接进入下一步。"
        : "按照法规要求，处方药需完成实名认证后方可发货。",
      href: identityHref,
      actionLabel: identityCompleted ? "查看身份证" : "前往上传",
      completed: identityCompleted,
      statusLabel: identityCompleted ? "已完成" : "待完成",
    },
    {
      key: "survey",
      title: "确认问卷内容",
      description: surveyCompleted
        ? "最新一次处方药问卷已确认提交。"
        : buildPendingSurveyDescription(pendingSurveyCount),
      href: surveyHref,
      actionLabel: surveyCompleted ? "查看我的问卷" : "立即确认",
      completed: surveyCompleted,
      statusLabel: surveyCompleted ? "已完成" : "待完成",
    },
  ];

  const isMinimal = variant === "minimal";
  const containerClassName = cn(
    isMinimal
      ? "space-y-6 text-left"
      : "rounded-3xl border border-amber-200/60 bg-amber-50/80 p-8 text-left",
    isMinimal ? className : className ?? "mt-12",
  );

  return (
    <section className={containerClassName}>
      <header className="flex flex-col gap-2">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <CircleAlert className="h-4 w-4" aria-hidden />
            处方药审核提示
          </p>
          <h2 className="mt-4 text-xl font-semibold text-neutral-900">
            补充以下步骤，完成处方药审核
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            我们会在收到身份证与问卷信息后尽快安排药师复核，审核通过即进入配送流程。
          </p>
        </div>
      </header>

      <ol className="mt-8 space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/90 p-5 shadow-sm shadow-amber-200/30 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-700"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 whitespace-nowrap text-base font-semibold text-neutral-900">
                {step.title}
                <StatusBadge completed={step.completed} label={step.statusLabel} />
              </p>
              <p className="mt-2 text-sm text-neutral-600">{step.description}</p>
            </div>
            <Link
              href={step.href}
              prefetch
              className={cn(
                "inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition sm:justify-self-end",
                step.completed
                  ? "border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900"
                  : "bg-amber-500 text-white shadow-sm hover:brightness-105",
              )}
            >
              {step.actionLabel}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatusBadge({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  const Icon = completed ? CheckCircle2 : Circle;
  const colorClasses = completed
    ? "text-emerald-600"
    : "text-amber-600";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold",
        colorClasses,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </span>
  );
}

function buildPendingSurveyDescription(count: number | undefined): string {
  if (!count || count <= 0) {
    return "确认问卷信息后即可提交审核结果。";
  }

  return `共有 ${count} 份处方问卷待确认，请核对答案后提交。`;
}

export default PrescriptionComplianceSteps;
