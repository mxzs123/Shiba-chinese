"use client";

import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { Fragment, useState } from "react";

import type { ProductOption } from "lib/api/types";
import { cn } from "lib/utils";

export type SkuSelectorProps = {
  options: ProductOption[];
  value: Record<string, string | undefined>;
  onChange: (optionName: string, optionValue: string) => void;
  isDisabled?: (optionName: string, optionValue: string) => boolean;
  className?: string;
  presentation?: "inline" | "sheet";
  triggerLabel?: string;
};

/**
 * Inline 模式 - 桌面端直接展示选项
 */
function SkuSelectorInline({
  options,
  value,
  onChange,
  isDisabled,
  className,
}: Omit<SkuSelectorProps, "presentation" | "triggerLabel">) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {options.map((option) => (
        <fieldset key={option.id} className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-neutral-900">
            {option.name}
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.values.map((optionValue) => {
              const selected = value?.[option.name] === optionValue;
              const disabled = isDisabled?.(option.name, optionValue) ?? false;

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => onChange(option.name, optionValue)}
                  disabled={disabled}
                  className={cn(
                    "rounded-full border px-4 py-1 text-sm transition",
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-neutral-200 text-neutral-600 hover:border-neutral-400",
                    disabled &&
                      "cursor-not-allowed border-dashed text-neutral-400 opacity-60",
                  )}
                  aria-pressed={selected}
                >
                  {optionValue}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/**
 * Sheet 模式 - 移动端底部抽屉
 */
function SkuSelectorSheet({
  options,
  value,
  onChange,
  isDisabled,
  triggerLabel = "选择规格",
  className,
}: Omit<SkuSelectorProps, "presentation">) {
  const [open, setOpen] = useState(false);

  // 构建已选择的规格文案
  const selectedLabels = options
    .map((option) => value?.[option.name])
    .filter(Boolean);
  const displayText =
    selectedLabels.length > 0 ? selectedLabels.join(" / ") : triggerLabel;

  const handleOptionChange = (optionName: string, optionValue: string) => {
    onChange(optionName, optionValue);
  };

  return (
    <>
      {/* 触发器按钮 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 text-sm transition active:bg-neutral-50",
          className,
        )}
      >
        <span className="truncate text-neutral-900">{displayText}</span>
        <svg
          className="ml-2 h-4 w-4 shrink-0 text-neutral-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* 底部抽屉 */}
      <Transition show={open} as={Fragment}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          {/* 背景遮罩 */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          {/* 抽屉面板 */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-start justify-between">
                <Dialog.Title className="text-lg font-semibold text-neutral-900">
                  选择规格
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 选项列表 */}
              <div className="space-y-6">
                {options.map((option) => (
                  <fieldset key={option.id}>
                    <legend className="mb-3 text-sm font-medium text-neutral-900">
                      {option.name}
                    </legend>
                    <div className="flex flex-col gap-3">
                      {option.values.map((optionValue) => {
                        const selected = value?.[option.name] === optionValue;
                        const disabled =
                          isDisabled?.(option.name, optionValue) ?? false;

                        return (
                          <button
                            key={optionValue}
                            type="button"
                            onClick={() =>
                              handleOptionChange(option.name, optionValue)
                            }
                            disabled={disabled}
                            className={cn(
                              "rounded-lg border px-4 py-3 text-sm transition",
                              selected
                                ? "border-teal-500 bg-teal-50 text-teal-700"
                                : "border-neutral-200 text-neutral-600 active:border-neutral-400",
                              disabled &&
                                "cursor-not-allowed border-dashed text-neutral-400 opacity-60",
                            )}
                            aria-pressed={selected}
                          >
                            {optionValue}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>

              {/* 确认按钮 */}
              <div className="mt-6 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-lg bg-teal-600 py-3 text-sm font-medium text-white transition hover:bg-teal-700 active:bg-teal-800"
                >
                  确认
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

/**
 * SKU 选择器 - 支持 inline 和 sheet 两种展示模式
 *
 * @param presentation - 展示模式：inline（默认，桌面端）| sheet（移动端底部抽屉）
 * @param triggerLabel - sheet 模式下触发器的默认文案（默认"选择规格"）
 */
export function SkuSelector({
  presentation = "inline",
  ...props
}: SkuSelectorProps) {
  if (!props.options.length) {
    return null;
  }

  if (presentation === "sheet") {
    return <SkuSelectorSheet {...props} />;
  }

  return <SkuSelectorInline {...props} />;
}
