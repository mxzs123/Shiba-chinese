"use client";

import { useCallback, useEffect, useState } from "react";

interface FilterDrawerProps {
  title: string;
  children: React.ReactNode;
  triggerLabel?: string;
  onReset?: () => void;
  onApply?: () => void;
}

export function FilterDrawer({
  title,
  children,
  triggerLabel = "筛选",
  onReset,
  onApply,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const handleApply = () => {
    onApply?.();
    close();
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50"
      >
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-neutral-900/30"
            onClick={close}
            aria-hidden
          />
          <section className="flex h-full w-[360px] flex-col border-l border-neutral-200 bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  {title}
                </h2>
                <p className="text-xs text-neutral-500">
                  设定筛选条件后点击应用。
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="关闭筛选"
              >
                ×
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-neutral-700">
              {children}
            </div>
            <footer className="flex items-center justify-between border-t border-neutral-200 px-5 py-3">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
              >
                重置
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm font-medium transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary/90"
                >
                  应用
                </button>
              </div>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}
