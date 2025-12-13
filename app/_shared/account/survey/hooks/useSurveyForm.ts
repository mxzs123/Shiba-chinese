"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import type {
  SurveyAssignment,
  SurveyQuestion,
  SurveyTemplate,
  SurveyUploadedFile,
} from "@/lib/api/types";
import { saveSurveyDraftAction, submitSurveyAction } from "../../actions";
import type { AnswerState, ErrorState, ActiveAction } from "../types";
import {
  buildInitialAnswers,
  toSurveyAnswers,
  validateQuestion,
  readFileAsDataUrl,
  matchesAcceptedType,
} from "../utils";

type UseSurveyFormOptions = {
  assignment: SurveyAssignment;
  template: SurveyTemplate;
};

export function useSurveyForm({ assignment, template }: UseSurveyFormOptions) {
  const [assignmentState, setAssignmentState] = useState(assignment);
  const [answers, setAnswers] = useState<AnswerState>(() =>
    buildInitialAnswers(template, assignment),
  );
  const [errors, setErrors] = useState<ErrorState>({});
  const [activeAction, setActiveAction] = useState<ActiveAction>("idle");
  const [isPending, startTransition] = useTransition();

  const readOnly = assignmentState.status === "submitted";

  const resetStateFromAssignment = useCallback(
    (next: SurveyAssignment) => {
      setAssignmentState(next);
      setAnswers(buildInitialAnswers(template, next));
      setErrors({});
    },
    [template],
  );

  const handleTextChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  }, []);

  const handleSingleChoiceChange = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: value }));
      setErrors((prev) => ({ ...prev, [questionId]: null }));
    },
    [],
  );

  const handleMultipleChoiceToggle = useCallback(
    (
      question: Extract<SurveyQuestion, { type: "multiple_choice" }>,
      optionValue: string,
      checked: boolean,
    ) => {
      setAnswers((prev) => {
        const current = (prev[question.id] as string[]) || [];
        let next = current;

        if (checked) {
          if (
            question.maxChoices &&
            current.length >= question.maxChoices &&
            !current.includes(optionValue)
          ) {
            toast.error(`最多选择 ${question.maxChoices} 项`);
            return prev;
          }

          if (!current.includes(optionValue)) {
            next = [...current, optionValue];
          }
        } else {
          next = current.filter((value) => value !== optionValue);
        }

        return {
          ...prev,
          [question.id]: next,
        };
      });
      setErrors((prev) => ({ ...prev, [question.id]: null }));
    },
    [],
  );

  const handleDateChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  }, []);

  const handleRemoveFile = useCallback((questionId: string, fileId: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as SurveyUploadedFile[]) || [];
      return {
        ...prev,
        [questionId]: current.filter((file) => file.id !== fileId),
      };
    });
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  }, []);

  const handleUpload = useCallback(
    async (
      question: Extract<SurveyQuestion, { type: "upload" }>,
      files: FileList | null,
    ) => {
      if (!files?.length) {
        return;
      }

      const maxSizeMB = question.maxSizeMB ?? 5;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      const newFiles: SurveyUploadedFile[] = [];

      for (const file of Array.from(files)) {
        if (!matchesAcceptedType(file, question.accept)) {
          toast.error("文件类型不符合要求");
          continue;
        }

        if (file.size > maxSizeBytes) {
          toast.error(`单个文件需小于 ${maxSizeMB}MB`);
          continue;
        }

        try {
          const dataUrl = await readFileAsDataUrl(file);
          newFiles.push({
            id: `local-${crypto.randomUUID()}`,
            name: file.name,
            url: dataUrl,
            uploadedAt: new Date().toISOString(),
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "文件读取失败";
          toast.error(message);
        }
      }

      if (!newFiles.length) {
        return;
      }

      setAnswers((prev) => {
        const current = (prev[question.id] as SurveyUploadedFile[]) || [];
        const merged = [...current, ...newFiles];

        if (question.maxFiles && merged.length > question.maxFiles) {
          toast.error(`最多上传 ${question.maxFiles} 个文件`);
          return prev;
        }

        return {
          ...prev,
          [question.id]: merged,
        };
      });
      setErrors((prev) => ({ ...prev, [question.id]: null }));
    },
    [],
  );

  const validateAnswers = useCallback(
    (strict: boolean) => {
      const nextErrors: ErrorState = {};
      let hasError = false;

      template.questions.forEach((question) => {
        const { hardError, softError } = validateQuestion(question, answers);

        if (hardError) {
          nextErrors[question.id] = hardError;
          hasError = true;
          return;
        }

        if (strict && softError) {
          nextErrors[question.id] = softError;
          hasError = true;
          return;
        }

        nextErrors[question.id] = null;
      });

      setErrors(nextErrors);
      return !hasError;
    },
    [template.questions, answers],
  );

  const handleSaveDraft = useCallback(() => {
    if (readOnly) {
      return;
    }

    const isValid = validateAnswers(false);
    if (!isValid) {
      toast.error("请检查问卷内容后再试");
      return;
    }

    setActiveAction("save");
    startTransition(async () => {
      try {
        const payload = toSurveyAnswers(template.questions, answers);
        const result = await saveSurveyDraftAction(
          assignmentState.userId,
          assignmentState.id,
          payload,
        );

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        resetStateFromAssignment(result.data);
        toast.success("草稿已保存");
      } finally {
        setActiveAction("idle");
      }
    });
  }, [
    readOnly,
    validateAnswers,
    template.questions,
    answers,
    assignmentState.userId,
    assignmentState.id,
    resetStateFromAssignment,
  ]);

  const handleSubmit = useCallback(() => {
    if (readOnly) {
      return;
    }

    const isValid = validateAnswers(true);
    if (!isValid) {
      toast.error("请完善必填项后再提交问卷");
      return;
    }

    setActiveAction("submit");
    startTransition(async () => {
      try {
        const payload = toSurveyAnswers(template.questions, answers);
        const result = await submitSurveyAction(
          assignmentState.userId,
          assignmentState.id,
          payload,
        );

        if (!result.success) {
          toast.error(result.error);
          return;
        }

        resetStateFromAssignment(result.data);
        toast.success("问卷已提交，感谢配合。");
      } finally {
        setActiveAction("idle");
      }
    });
  }, [
    readOnly,
    validateAnswers,
    template.questions,
    answers,
    assignmentState.userId,
    assignmentState.id,
    resetStateFromAssignment,
  ]);

  return {
    assignmentState,
    answers,
    errors,
    activeAction,
    isPending,
    readOnly,
    handleTextChange,
    handleSingleChoiceChange,
    handleMultipleChoiceToggle,
    handleDateChange,
    handleRemoveFile,
    handleUpload,
    handleSaveDraft,
    handleSubmit,
  };
}
