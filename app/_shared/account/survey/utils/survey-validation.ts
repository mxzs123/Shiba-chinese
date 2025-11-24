import type {
  SurveyAnswerValue,
  SurveyQuestion,
  SurveyUploadedFile,
} from "@/lib/api/types";
import type { AnswerState, QuestionValidationResult } from "../types";

export function getDefaultValueForQuestion(
  question: SurveyQuestion,
): SurveyAnswerValue {
  switch (question.type) {
    case "text":
    case "single_choice":
    case "date":
      return "";
    case "multiple_choice":
      return [];
    case "upload":
      return [];
    default:
      return "";
  }
}

export function validateQuestion(
  question: SurveyQuestion,
  state: AnswerState,
): QuestionValidationResult {
  const value = state[question.id];

  switch (question.type) {
    case "text": {
      if (typeof value !== "string") {
        return { hardError: "数据格式不正确" };
      }

      if (question.maxLength && value.length > question.maxLength) {
        return { hardError: `字数需在 ${question.maxLength} 字以内` };
      }

      if (question.required && value.trim().length === 0) {
        return { softError: "请填写此题目" };
      }

      return {};
    }
    case "single_choice": {
      if (typeof value !== "string") {
        return { hardError: "数据格式不正确" };
      }

      if (!value) {
        return question.required ? { softError: "请选择一个选项" } : {};
      }

      const exists = question.options.some((option) => option.value === value);
      if (!exists) {
        return { hardError: "选项无效" };
      }

      return {};
    }
    case "multiple_choice": {
      if (!Array.isArray(value)) {
        return { hardError: "数据格式不正确" };
      }

      const selections = value as string[];

      if (question.maxChoices && selections.length > question.maxChoices) {
        return { hardError: `最多选择 ${question.maxChoices} 项` };
      }

      if (question.minChoices && selections.length < question.minChoices) {
        return { softError: `至少选择 ${question.minChoices} 项` };
      }

      if (question.required && selections.length === 0) {
        return { softError: "请选择至少一项" };
      }

      return {};
    }
    case "date": {
      if (typeof value !== "string") {
        return { hardError: "数据格式不正确" };
      }

      if (!value) {
        return question.required ? { softError: "请选择日期" } : {};
      }

      const timestamp = new Date(value).getTime();
      if (Number.isNaN(timestamp)) {
        return { hardError: "日期格式不正确" };
      }

      if (question.min && value < question.min) {
        return { hardError: `请选择不早于 ${question.min} 的日期` };
      }

      if (question.max && value > question.max) {
        return { hardError: `请选择不晚于 ${question.max} 的日期` };
      }

      return {};
    }
    case "upload": {
      if (!Array.isArray(value)) {
        return { hardError: "数据格式不正确" };
      }

      const files = value as SurveyUploadedFile[];

      if (question.maxFiles && files.length > question.maxFiles) {
        return { hardError: `最多上传 ${question.maxFiles} 个文件` };
      }

      if (question.required && files.length === 0) {
        return { softError: "请上传至少一个文件" };
      }

      return {};
    }
    default:
      return {};
  }
}
