"use client";

import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

import { sorting } from "lib/constants";
import { createUrl } from "lib/utils";

import { createSearchParams } from "./utils";

function getSortLabel(title: string): string {
  switch (title) {
    case "Relevance":
      return "综合排序";
    case "Trending":
      return "热度优先";
    case "Latest arrivals":
      return "上新优先";
    case "Price: Low to high":
      return "价格从低到高";
    case "Price: High to low":
      return "价格从高到低";
    default:
      return title;
  }
}

export type SortDropdownProps = {
  currentSort: string | null;
  basePath: string;
  searchValue?: string;
};

export function SortDropdown({
  currentSort,
  basePath,
  searchValue,
}: SortDropdownProps) {
  const activeSort =
    sorting.find((item) => item.slug === currentSort) ?? sorting[0]!;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        排序方式
      </label>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          <span>{getSortLabel(activeSort.title)}</span>
          <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
        </button>
        {open ? (
          <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[200px] rounded-lg border border-neutral-200 bg-white shadow-lg">
            <ul role="listbox" aria-label="排序方式" className="py-1">
              {sorting.map((item) => {
                const isActive =
                  currentSort === item.slug || (!currentSort && !item.slug);
                const href = createUrl(
                  basePath,
                  createSearchParams({
                    ...(searchValue ? { q: searchValue } : null),
                    ...(item.slug ? { sort: item.slug } : null),
                    page: undefined,
                  }),
                );

                return (
                  <li key={item.title} role="option" aria-selected={isActive}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`block px-4 py-2.5 text-sm transition hover:bg-neutral-50 ${
                        isActive
                          ? "bg-teal-50 font-medium text-teal-700"
                          : "text-neutral-700"
                      }`}
                    >
                      {getSortLabel(item.title)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default SortDropdown;
