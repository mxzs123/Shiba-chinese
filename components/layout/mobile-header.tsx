"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

import type { Notification } from "lib/api/types";
import { NotificationLink } from "components/notifications/notification-link";

type MobileHeaderProps = {
  notifications: Notification[];
  showSearchInput?: boolean;
};

export function MobileHeader({
  notifications,
  showSearchInput = false,
}: MobileHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {showSearchInput ? (
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <input
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
          <Link href="/search" className="flex-1">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
              <Search className="h-4 w-4" />
              <span>搜索商品...</span>
            </div>
          </Link>
        )}
        <NotificationLink notifications={notifications} />
      </div>
    </header>
  );
}
