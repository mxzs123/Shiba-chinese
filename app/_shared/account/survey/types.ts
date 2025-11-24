import type { SurveyAnswerValue } from "@/lib/api/types";

export type AnswerState = Record<string, SurveyAnswerValue>;

export type ErrorState = Record<string, string | null>;

export type QuestionValidationResult = {
  hardError?: string;
  softError?: string;
};

export type ActiveAction = "idle" | "save" | "submit";
