import type {
  SurveyAnswer,
  SurveyAnswerValue,
  SurveyAssignment,
  SurveyQuestion,
  SurveyTemplate,
  SurveyUploadedFile,
} from "@/lib/api/types";
import type { AnswerState } from "../types";
import { getDefaultValueForQuestion } from "./survey-validation";

export function cloneAnswerValue(
  question: SurveyQuestion,
  value: SurveyAnswerValue | undefined,
): SurveyAnswerValue {
  if (value === undefined) {
    return getDefaultValueForQuestion(question);
  }

  if (Array.isArray(value)) {
    if (question.type === "upload") {
      return (value as SurveyUploadedFile[]).map((file) => ({ ...file }));
    }

    return [...(value as string[])];
  }

  return value;
}

export function buildInitialAnswers(
  template: SurveyTemplate,
  assignment: SurveyAssignment,
): AnswerState {
  const initial: AnswerState = {};
  const answerMap = new Map(
    assignment.answers.map((answer) => [answer.questionId, answer.value]),
  );

  template.questions.forEach((question) => {
    const existing = answerMap.get(question.id);
    initial[question.id] = cloneAnswerValue(question, existing);
  });

  return initial;
}

export function toSurveyAnswers(
  questions: SurveyQuestion[],
  state: AnswerState,
): SurveyAnswer[] {
  return questions.map((question) => {
    const value = state[question.id];

    if (Array.isArray(value)) {
      if (question.type === "upload") {
        return {
          questionId: question.id,
          value: (value as SurveyUploadedFile[]).map((file) => ({ ...file })),
        };
      }

      return {
        questionId: question.id,
        value: [...(value as string[])],
      };
    }

    return {
      questionId: question.id,
      value: value ?? "",
    };
  });
}
