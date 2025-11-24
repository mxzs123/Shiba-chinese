"use client";

import type { SurveyQuestion } from "@/lib/api/types";

type TextQuestionProps = {
  question: Extract<SurveyQuestion, { type: "text" }>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function TextQuestion({
  question,
  value,
  onChange,
  disabled,
}: TextQuestionProps) {
  return (
    <textarea
      id={question.id}
      aria-required={question.required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={question.placeholder}
      className="min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:cursor-not-allowed disabled:bg-neutral-50"
      maxLength={question.maxLength}
      disabled={disabled}
    />
  );
}
