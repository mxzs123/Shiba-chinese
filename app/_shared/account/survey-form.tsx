"use client";

import type {
  IdentityVerificationStatus,
  SurveyAssignment,
  SurveyQuestion,
  SurveyTemplate,
  SurveyUploadedFile,
} from "@/lib/api/types";
import { useSurveyForm } from "./survey/hooks";
import {
  TextQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  DateQuestion,
  UploadQuestion,
} from "./survey/questions";

type AccountSurveyFormProps = {
  assignment: SurveyAssignment;
  template: SurveyTemplate;
  identityStatus: IdentityVerificationStatus;
};

export function AccountSurveyForm({
  assignment,
  template,
  identityStatus,
}: AccountSurveyFormProps) {
  const {
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
  } = useSurveyForm({ assignment, template });

  const hasPendingIdentity =
    identityStatus !== "verified" && assignmentState.status !== "submitted";

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case "text": {
        const value = (answers[question.id] as string) ?? "";
        return (
          <TextQuestion
            question={question}
            value={value}
            onChange={(v) => handleTextChange(question.id, v)}
            disabled={readOnly}
          />
        );
      }
      case "single_choice": {
        const value = (answers[question.id] as string) ?? "";
        return (
          <SingleChoiceQuestion
            question={question}
            value={value}
            onChange={(v) => handleSingleChoiceChange(question.id, v)}
            disabled={readOnly}
          />
        );
      }
      case "multiple_choice": {
        const value = (answers[question.id] as string[]) ?? [];
        return (
          <MultipleChoiceQuestion
            question={question}
            value={value}
            onToggle={(optionValue, checked) =>
              handleMultipleChoiceToggle(question, optionValue, checked)
            }
            disabled={readOnly}
          />
        );
      }
      case "date": {
        const value = (answers[question.id] as string) ?? "";
        return (
          <DateQuestion
            question={question}
            value={value}
            onChange={(v) => handleDateChange(question.id, v)}
            disabled={readOnly}
          />
        );
      }
      case "upload": {
        const files = (answers[question.id] as SurveyUploadedFile[]) ?? [];
        return (
          <UploadQuestion
            question={question}
            files={files}
            onUpload={(f) => handleUpload(question, f)}
            onRemove={(fileId) => handleRemoveFile(question.id, fileId)}
            disabled={readOnly}
          />
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
