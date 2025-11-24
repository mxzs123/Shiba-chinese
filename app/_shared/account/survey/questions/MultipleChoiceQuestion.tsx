"use client";

import type { SurveyQuestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type MultipleChoiceQuestionProps = {
  question: Extract<SurveyQuestion, { type: "multiple_choice" }>;
  value: string[];
  onToggle: (optionValue: string, checked: boolean) => void;
  disabled?: boolean;
};

export function MultipleChoiceQuestion({
  question,
  value,
  onToggle,
  disabled,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const checked = value.includes(option.value);
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm transition hover:border-[#049e6b]",
              checked ? "border-[#049e6b] bg-[#049e6b]/5" : undefined,
              disabled ? "cursor-default" : undefined,
            )}
          >
            <input
              type="checkbox"
              value={option.value}
              className="mt-1 h-4 w-4"
              checked={checked}
              disabled={disabled}
              onChange={(event) => onToggle(option.value, event.target.checked)}
            />
            <div className="space-y-1">
              <span className="font-semibold text-neutral-800">
                {option.label}
              </span>
              {option.description ? (
                <p className="text-xs text-neutral-500">{option.description}</p>
              ) : null}
            </div>
          </label>
        );
      })}
    </div>
  );
}
