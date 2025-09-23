"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { saveSurveyDraftAction, submitSurveyAction } from "./actions";
import type {
  IdentityVerificationStatus,
  SurveyAnswer,
  SurveyAnswerValue,
  SurveyAssignment,
  SurveyQuestion,
  SurveyTemplate,
  SurveyUploadedFile,
} from "@/lib/api/types";
import { cn } from "@/lib/utils";

type AnswerState = Record<string, SurveyAnswerValue>;

type ErrorState = Record<string, string | null>;

type AccountSurveyFormProps = {
  assignment: SurveyAssignment;
  template: SurveyTemplate;
  identityStatus: IdentityVerificationStatus;
};

type QuestionValidationResult = {
  hardError?: string;
  softError?: string;
};

function getDefaultValueForQuestion(
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

function cloneAnswerValue(
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

function buildInitialAnswers(
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

function toSurveyAnswers(
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

function validateQuestion(
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

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function matchesAcceptedType(file: File, accept?: string[]) {
  if (!accept || accept.length === 0) {
    return true;
  }

  return accept.some((type) => {
    if (type.endsWith("/*")) {
      const prefix = type.slice(0, type.length - 1);
      return file.type.startsWith(prefix);
    }

    return file.type === type;
  });
}

export function AccountSurveyForm({
  assignment,
  template,
  identityStatus,
}: AccountSurveyFormProps) {
  const [assignmentState, setAssignmentState] = useState(assignment);
  const [answers, setAnswers] = useState<AnswerState>(() =>
    buildInitialAnswers(template, assignment),
  );
  const [errors, setErrors] = useState<ErrorState>({});
  const [activeAction, setActiveAction] = useState<"idle" | "save" | "submit">(
    "idle",
  );
  const [isPending, startTransition] = useTransition();

  const readOnly = assignmentState.status === "submitted";

  const hasPendingIdentity =
    identityStatus !== "verified" && assignmentState.status !== "submitted";

  const resetStateFromAssignment = (next: SurveyAssignment) => {
    setAssignmentState(next);
    setAnswers(buildInitialAnswers(template, next));
    setErrors({});
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleSingleChoiceChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleMultipleChoiceToggle = (
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
  };

  const handleDateChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleRemoveFile = (questionId: string, fileId: string) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as SurveyUploadedFile[]) || [];
      return {
        ...prev,
        [questionId]: current.filter((file) => file.id !== fileId),
      };
    });
    setErrors((prev) => ({ ...prev, [questionId]: null }));
  };

  const handleUpload = async (
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
        const message = error instanceof Error ? error.message : "文件读取失败";
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
  };

  const validateAnswers = (strict: boolean) => {
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
  };

  const handleSaveDraft = () => {
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
  };

  const handleSubmit = () => {
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
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const error = errors[question.id];

    switch (question.type) {
      case "text": {
        const value = (answers[question.id] as string) ?? "";
        return (
          <textarea
            id={question.id}
            aria-required={question.required}
            value={value}
            onChange={(event) =>
              handleTextChange(question.id, event.target.value)
            }
            placeholder={question.placeholder}
            className="min-h-[120px] w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:cursor-not-allowed disabled:bg-neutral-50"
            maxLength={question.maxLength}
            disabled={readOnly}
          />
        );
      }
      case "single_choice": {
        const value = (answers[question.id] as string) ?? "";
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
                  readOnly ? "cursor-default" : undefined,
                )}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  className="mt-1 h-4 w-4"
                  checked={value === option.value}
                  disabled={readOnly}
                  onChange={() =>
                    handleSingleChoiceChange(question.id, option.value)
                  }
                />
                <div className="space-y-1">
                  <span className="font-semibold text-neutral-800">
                    {option.label}
                  </span>
                  {option.description ? (
                    <p className="text-xs text-neutral-500">
                      {option.description}
                    </p>
                  ) : null}
                </div>
              </label>
            ))}
          </div>
        );
      }
      case "multiple_choice": {
        const value = (answers[question.id] as string[]) ?? [];
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
                    readOnly ? "cursor-default" : undefined,
                  )}
                >
                  <input
                    type="checkbox"
                    value={option.value}
                    className="mt-1 h-4 w-4"
                    checked={checked}
                    disabled={readOnly}
                    onChange={(event) =>
                      handleMultipleChoiceToggle(
                        question,
                        option.value,
                        event.target.checked,
                      )
                    }
                  />
                  <div className="space-y-1">
                    <span className="font-semibold text-neutral-800">
                      {option.label}
                    </span>
                    {option.description ? (
                      <p className="text-xs text-neutral-500">
                        {option.description}
                      </p>
                    ) : null}
                  </div>
                </label>
              );
            })}
          </div>
        );
      }
      case "date": {
        const value = (answers[question.id] as string) ?? "";
        return (
          <input
            type="date"
            id={question.id}
            value={value}
            onChange={(event) =>
              handleDateChange(question.id, event.target.value)
            }
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-700 transition focus:border-[#049e6b] focus:outline-none focus:ring-2 focus:ring-[#049e6b]/20 disabled:cursor-not-allowed disabled:bg-neutral-50"
            min={question.min}
            max={question.max}
            disabled={readOnly}
          />
        );
      }
      case "upload": {
        const files = (answers[question.id] as SurveyUploadedFile[]) ?? [];
        const allowMultiple = (question.maxFiles ?? 1) !== 1;
        return (
          <div className="space-y-4">
            {!readOnly ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-sm text-neutral-500 transition hover:border-[#049e6b] hover:bg-[#049e6b]/5">
                <UploadCloud className="h-6 w-6 text-neutral-400" aria-hidden />
                <span>点击上传{allowMultiple ? "（可多选）" : ""}</span>
                {question.maxSizeMB ? (
                  <span className="text-xs text-neutral-400">
                    单个文件小于 {question.maxSizeMB}MB
                  </span>
                ) : null}
                <input
                  type="file"
                  className="hidden"
                  accept={question.accept?.join(",")}
                  multiple={allowMultiple}
                  onChange={async (event) => {
                    await handleUpload(question, event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            ) : null}
            {files.length ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {files.map((file) => (
                  <li
                    key={file.id}
                    className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
                  >
                    <div className="relative h-40 w-full">
                      <Image
                        src={file.url}
                        alt={file.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 50vw, 100vw"
                        unoptimized
                      />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 text-xs text-neutral-500">
                      <span className="truncate" title={file.name}>
                        {file.name}
                      </span>
                      {!readOnly ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(question.id, file.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-[11px] font-semibold text-neutral-500 transition hover:border-red-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden /> 删除
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-neutral-400">
                {readOnly
                  ? "暂无上传附件"
                  : "暂未上传附件，提交时请一并附上凭证。"}
              </p>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {hasPendingIdentity ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
          请先完成身份证上传，药师将在身份验证通过后审核问卷内容。
        </div>
      ) : null}
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <ol className="space-y-6">
          {template.questions.map((question, index) => (
            <li
              key={question.id}
              className="space-y-3 rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-neutral-900/5"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#049e6b]/10 text-xs font-semibold text-[#03583b]">
                    {index + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-neutral-900">
                    {question.title}
                  </h2>
                  {question.required ? (
                    <span className="text-xs text-red-500">*</span>
                  ) : null}
                </div>
                {question.description ? (
                  <p className="text-xs text-neutral-500">
                    {question.description}
                  </p>
                ) : null}
              </div>
              {renderQuestion(question)}
              {errors[question.id] ? (
                <p className="text-xs text-red-500">{errors[question.id]}</p>
              ) : null}
            </li>
          ))}
        </ol>
        {readOnly ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-sm text-neutral-500">
            问卷已提交，如需修改请联系药师或客服协助重新开启编辑。
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isPending || readOnly}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-400"
            >
              {activeAction === "save" && isPending ? "保存中..." : "保存草稿"}
            </button>
            <button
              type="submit"
              disabled={isPending || readOnly}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              {activeAction === "submit" && isPending
                ? "提交中..."
                : "提交问卷"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default AccountSurveyForm;
