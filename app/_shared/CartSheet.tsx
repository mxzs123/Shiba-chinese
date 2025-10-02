"use client";

import { Dialog, DialogBackdrop, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const historyEntryRef = useRef(false);
  const skipHistoryBackRef = useRef(false);
  const pendingHistoryBackRef = useRef<number | null>(null);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (typeof window === "undefined" || !onOpenChange) {
      return;
    }

    const handlePopState = () => {
      if (!historyEntryRef.current) {
        return;
      }

      skipHistoryBackRef.current = true;
      historyEntryRef.current = false;
      onOpenChange(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onOpenChange]);

  useEffect(() => {
    if (typeof window === "undefined" || !onOpenChange) {
      return undefined;
    }

    if (open) {
      if (!historyEntryRef.current) {
        window.history.pushState(
          { ...(window.history.state ?? {}), __cartSheet: true },
          "",
        );
        historyEntryRef.current = true;
      }

      return undefined;
    }

    if (pendingHistoryBackRef.current !== null) {
      window.clearTimeout(pendingHistoryBackRef.current);
      pendingHistoryBackRef.current = null;
    }

    if (skipHistoryBackRef.current) {
      skipHistoryBackRef.current = false;
      return undefined;
    }

    if (historyEntryRef.current) {
      historyEntryRef.current = false;
      pendingHistoryBackRef.current = window.setTimeout(() => {
        window.history.back();
        pendingHistoryBackRef.current = null;
      }, 0);

      return () => {
        if (pendingHistoryBackRef.current !== null) {
          window.clearTimeout(pendingHistoryBackRef.current);
          pendingHistoryBackRef.current = null;
        }
      };
    }

    return undefined;
  }, [open, onOpenChange]);

  return (
    <Transition show={open} as={Fragment} appear>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleClose}
        initialFocus={closeButtonRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-200"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                className={cn(
                  "flex h-full w-full max-w-md flex-col bg-white shadow-xl",
                  className,
                )}
              >
                <header className="flex items-center justify-between border-b px-6 py-4">
                  <Dialog.Title className="text-lg font-semibold text-neutral-900">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    ref={closeButtonRef}
                    onClick={handleClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    aria-label="关闭购物车"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </header>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {children}
                </div>
                {footer ? (
                  <footer className="border-t px-6 py-4">{footer}</footer>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
