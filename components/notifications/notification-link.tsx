"use client";

import { Popover, Transition } from "@headlessui/react";
import { Bell, X } from "lucide-react";
import { Fragment, useCallback, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { Notification, NotificationCategory } from "lib/api/types";

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  system: "系统通知",
  order: "订单通知",
};

const CATEGORY_ORDER: NotificationCategory[] = ["system", "order"];

type NotificationLinkProps = {
  notifications: Notification[];
};

export function NotificationLink({ notifications }: NotificationLinkProps) {
  const [items, setItems] = useState(() =>
    notifications.map((entry) => ({ ...entry })),
  );
  const grouped = useMemo(() => groupNotifications(items), [items]);
  const unreadCount = useMemo(
    () => items.filter((entry) => !entry.readAt).length,
    [items],
  );

  const markAsRead = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === id && !entry.readAt
          ? { ...entry, readAt: new Date().toISOString() }
          : entry,
      ),
    );
  }, []);

  return (
    <Popover as="div" className="relative inline-flex">
      {({ open, close }) => (
        <>
          <Popover.Button
            aria-label="查看通知"
            className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <span
              className={cn(
                "group relative flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#049e6b] transition hover:border-[#049e6b]",
                open && "border-[#049e6b] bg-[#049e6b]/10",
              )}
            >
              <Bell className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:scale-110" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#049e6b] text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </span>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Overlay
              className="fixed inset-0 z-10 bg-transparent"
              aria-hidden="true"
            />
          </Transition>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 top-full z-20 mt-3 w-[22rem] origin-top-right rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg focus:outline-none">
              <NotificationContent
                grouped={grouped}
                hasNotifications={items.length > 0}
                onItemSelect={(id) => {
                  markAsRead(id);
                }}
                onClose={close}
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

type GroupedNotifications = Array<{
  category: NotificationCategory;
  items: Notification[];
}>;

function groupNotifications(
  notifications: Notification[],
): GroupedNotifications {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: notifications.filter((entry) => entry.category === category),
  }));
}

type NotificationContentProps = {
  grouped: GroupedNotifications;
  hasNotifications: boolean;
  onItemSelect: (id: string) => void;
  onClose: () => void;
};

function NotificationContent({
  grouped,
  hasNotifications,
  onItemSelect,
  onClose,
}: NotificationContentProps) {
  if (!hasNotifications) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-neutral-500">
        暂无新的通知，欢迎稍后再来查看。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-neutral-900">消息通知</p>
          <p className="text-xs text-neutral-500">包含系统提醒与订单动态</p>
        </div>
        <button
          type="button"
          aria-label="关闭通知"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-neutral-400 transition hover:border-neutral-200 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {grouped.map(({ category, items }) => {
          if (!items.length) {
            return null;
          }

          return (
            <section key={category} className="space-y-2">
              <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                {CATEGORY_LABELS[category]}
              </h3>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onItemSelect(item.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                        item.readAt
                          ? "border-transparent bg-white hover:border-[#049e6b1a]"
                          : "border-neutral-100 bg-neutral-50/60 hover:border-[#049e6b1a] hover:bg-white",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {item.title}
                        </p>
                        {!item.readAt ? (
                          <span className="mt-0.5 h-2 w-2 flex-none rounded-full bg-[#049e6b]" />
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                        {item.description}
                      </p>
                      <time
                        className="mt-2 block text-[11px] text-neutral-400"
                        dateTime={item.createdAt}
                      >
                        {formatTimestamp(item.createdAt)}
                      </time>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export default NotificationLink;
