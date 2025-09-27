import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "lib/utils";

import type { HomeCategoryLink } from "./categories";
import { HOME_CATEGORY_GRID_LINKS } from "./categories";

type HomeCategoryNavigationProps = {
  categories?: HomeCategoryLink[];
  viewAllHref?: string;
  className?: string;
};

const DEFAULT_CATEGORIES: HomeCategoryLink[] = HOME_CATEGORY_GRID_LINKS;

const DEFAULT_VIEW_ALL = "/search";

export function HomeCategoryNavigation({
  categories = DEFAULT_CATEGORIES,
  viewAllHref = DEFAULT_VIEW_ALL,
  className,
}: HomeCategoryNavigationProps) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-(--breakpoint-2xl) px-4",
        "sm:px-6 lg:px-8",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-4 pb-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            品类导航
          </p>
          <h2 className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            常见需求一站式直达
          </h2>
        </div>
        <Link
          href={viewAllHref}
          className="hidden shrink-0 rounded-full border border-[#049e6b] px-4 py-2 text-sm font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 lg:inline-flex"
        >
          查看全部
        </Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.label}
            href={category.href}
            className="group flex h-full items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition hover:border-[#049e6b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="flex flex-col gap-1">
              <span className="text-base font-medium text-neutral-900 transition-colors group-hover:text-[#049e6b] dark:text-neutral-100">
                {category.label}
              </span>
              {category.description ? (
                <span className="text-sm text-neutral-500 line-clamp-2 dark:text-neutral-400">
                  {category.description}
                </span>
              ) : null}
            </div>
            <span className="flex size-10 items-center justify-center rounded-full border border-[#049e6b]/40 bg-[#049e6b]/10 text-[#049e6b] transition group-hover:bg-[#049e6b] group-hover:text-white">
              <ArrowUpRight className="size-5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 lg:hidden">
        <Link
          href={viewAllHref}
          className="inline-flex w-full items-center justify-center rounded-full border border-[#049e6b] px-4 py-2 text-sm font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
        >
          查看全部品类
        </Link>
      </div>
    </section>
  );
}

export default HomeCategoryNavigation;
