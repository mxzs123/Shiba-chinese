"use client";

import Image from "next/image";
import { Trash2, UploadCloud } from "lucide-react";
import type { SurveyQuestion, SurveyUploadedFile } from "@/lib/api/types";

type UploadQuestionProps = {
  question: Extract<SurveyQuestion, { type: "upload" }>;
  files: SurveyUploadedFile[];
  onUpload: (files: FileList | null) => Promise<void>;
  onRemove: (fileId: string) => void;
  disabled?: boolean;
};

export function UploadQuestion({
  question,
  files,
  onUpload,
  onRemove,
  disabled,
}: UploadQuestionProps) {
  const allowMultiple = (question.maxFiles ?? 1) !== 1;

  return (
    <div className="space-y-4">
      {!disabled ? (
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
              await onUpload(event.target.files);
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
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => onRemove(file.id)}
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
          {disabled
            ? "暂无上传附件"
            : "暂未上传附件，提交时请一并附上凭证。"}
        </p>
      )}
    </div>
  );
}
