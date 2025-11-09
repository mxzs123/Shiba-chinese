"use client";

import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="relative w-full">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-neutral-500">
        排序方式
      </label>
      <div className="group relative">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 shadow-sm transition hover:border-neutral-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        >
          <span>{getSortLabel(activeSort.title)}</span>
          <ChevronDownIcon className="h-4 w-4 text-neutral-500 transition group-hover:text-neutral-700" />
        </button>
        <div className="absolute left-0 top-full z-50 mt-2 hidden w-full min-w-[200px] rounded-lg border border-neutral-200 bg-white shadow-lg group-focus-within:block group-hover:block">
          <ul className="py-1">
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
                <li key={item.title}>
                  <Link
                    href={href}
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
      </div>
    </div>
  );
}

export default SortDropdown;
