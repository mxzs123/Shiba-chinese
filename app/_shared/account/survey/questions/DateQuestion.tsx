"use client";

import type { SurveyQuestion } from "@/lib/api/types";

type DateQuestionProps = {
  question: Extract<SurveyQuestion, { type: "date" }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function DateQuestion({
  question,
  value,
  onChange,
  disabled,
}: DateQuestionProps) {
  return (
    <input
      type="date"
      id={question.id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:cursor-not-allowed disabled:bg-neutral-50"
      min={question.min}
      max={question.max}
      disabled={disabled}
    />
  );
}
