"use client";

import type { SurveyQuestion } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type SingleChoiceQuestionProps = {
  question: Extract<SurveyQuestion, { type: "single_choice" }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SingleChoiceQuestion({
  question,
  value,
  onChange,
  disabled,
}: SingleChoiceQuestionProps) {
  return (
    <div className="space-y-2">
      {question.options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm transition hover:border-[#049e6b]",
            value === option.value
              ? "border-[#049e6b] bg-[#049e6b]/5"
              : undefined,
            disabled ? "cursor-default" : undefined,
          )}
        >
          <input
            type="radio"
            name={question.id}
            value={option.value}
            className="mt-1 h-4 w-4"
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
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
      ))}
    </div>
  );
}
