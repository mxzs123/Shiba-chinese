"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Notification } from "lib/api/types";
import { NotificationLink } from "components/notifications/notification-link";
import LogoSquare from "components/logo-square";

type MobileHeaderProps = {
  notifications?: Notification[];
  showSearchInput?: boolean;
  leadingVariant?: "auto" | "logo" | "back";
  initialSearchValue?: string;
};

export function MobileHeader({
  notifications,
  showSearchInput = false,
  leadingVariant = "auto",
  initialSearchValue,
}: MobileHeaderProps) {
  // 内测阶段隐藏消息通知入口（仅 UI；客户端仅识别 NEXT_PUBLIC_*）。
  const hideNotifications =
    process.env.NEXT_PUBLIC_INTERNAL_TESTING === "1" ||
    process.env.NEXT_PUBLIC_MOCK_MODE === "1";
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(initialSearchValue ?? "");
  const [isSearching, setIsSearching] = useState(
    showSearchInput || Boolean(initialSearchValue),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const safeNotifications = useMemo(() => notifications ?? [], [notifications]);

  const resolvedLeadingVariant = useMemo(() => {
    if (leadingVariant === "auto") {
      return pathname === "/" ? "logo" : "back";
    }

    return leadingVariant;
  }, [leadingVariant, pathname]);

  const handleBack = () => {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    // 超时降级：若 back() 无效（如微信直接打开链接），则跳转首页
    let didNavigate = false;
    const onPopState = () => {
      didNavigate = true;
    };

    window.addEventListener("popstate", onPopState);
    router.back();

    setTimeout(() => {
      window.removeEventListener("popstate", onPopState);
      if (!didNavigate) {
        router.push("/");
      }
    }, 150);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    const target = trimmedQuery
      ? `/categories?q=${encodeURIComponent(trimmedQuery)}`
      : "/categories";
    router.push(target);
  };

  useEffect(() => {
    setSearchQuery(initialSearchValue ?? "");
  }, [initialSearchValue]);

  useEffect(() => {
    setIsSearching(showSearchInput || Boolean(initialSearchValue));
  }, [initialSearchValue, showSearchInput]);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  const openSearch = () => {
    setIsSearching(true);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {resolvedLeadingVariant === "logo" ? (
          <Link href="/" className="flex-none" aria-label="返回首页">
            <LogoSquare size="sm" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            aria-label="返回上一页"
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
        )}
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索商品..."
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-black placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={openSearch}
            className="flex-1"
            aria-label="搜索商品"
          >
            <div className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 text-left">
              <Search className="h-4 w-4" />
              <span>搜索商品...</span>
            </div>
          </button>
        )}
        {/* 内测阶段隐藏消息通知入口 */}
        {hideNotifications ? null : (
          <NotificationLink notifications={safeNotifications} />
        )}
      </div>
    </header>
  );
}
