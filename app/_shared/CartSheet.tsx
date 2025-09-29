"use client";

import { X } from "lucide-react";
import { type ReactNode } from "react";

import { cn } from "lib/utils";

export type CartSheetProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function CartSheet({
  open,
  onOpenChange,
  title = "购物车",
  children,
  footer,
  className,
}: CartSheetProps) {
  const handleOverlayClick = () => {
    onOpenChange?.(false);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex justify-end",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={handleOverlayClick}
      />
      <aside
        className={cn(
          "relative flex h-full w-full max-w-md translate-x-full flex-col bg-white shadow-xl transition-transform duration-300",
          open && "translate-x-0",
          className,
        )}
        role="dialog"
        aria-modal={open}
        aria-label={title}
      >
        <header className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="关闭购物车"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer ? (
          <footer className="border-t px-6 py-4">{footer}</footer>
        ) : null}
      </aside>
    </div>
  );
}
