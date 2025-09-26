"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import type { SurveyAssignment } from "@/lib/api/types";

import { submitSurveyAction } from "./actions";
import { PrimaryButton } from "../PrimaryButton";

type SurveyBulkSubmitProps = {
  assignments: SurveyAssignment[];
};

export function SurveyBulkSubmit({ assignments }: SurveyBulkSubmitProps) {
  const router = useRouter();
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  const pendingCount = assignments.length;

  const handleSubmit = () => {
    if (!agreeChecked || !pendingCount) {
      return;
    }

    startTransition(async () => {
      const successes: string[] = [];
      const failures: { id: string; message: string }[] = [];

      for (const assignment of assignments) {
        try {
          const result = await submitSurveyAction(
            assignment.userId,
            assignment.id,
            assignment.answers ?? [],
          );

          if (result.success) {
            successes.push(assignment.id);
          } else {
            failures.push({
              id: assignment.id,
              message: result.error ?? "提交失败，请稍后再试",
            });
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "提交失败，请稍后再试";
          failures.push({ id: assignment.id, message });
        }
      }

      if (successes.length) {
        toast.success(`已提交 ${successes.length} 份问卷`);
        router.refresh();
      }

      if (failures.length) {
        const firstError = failures[0]?.message ?? "提交失败，请稍后再试";
        toast.error(firstError);
      }

      setAgreeChecked(false);
    });
  };

  return (
    <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2 text-sm text-neutral-600">
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed md:text-sm">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-[#049e6b] focus:ring-2 focus:ring-offset-2"
              checked={agreeChecked}
              onChange={(event) => setAgreeChecked(event.target.checked)}
            />
            <span>我已确认所有问卷内容无误，可直接提交由药师审核。</span>
          </label>
        </div>
        <PrimaryButton
          className="h-10 px-5 text-sm"
          onClick={handleSubmit}
          disabled={!agreeChecked || !pendingCount}
          loading={isSubmitting}
          loadingText="提交中..."
          leadingIcon={<ShieldCheck className="h-4 w-4" aria-hidden />}
        >
          提交
        </PrimaryButton>
      </div>
    </div>
  );
}

export default SurveyBulkSubmit;
