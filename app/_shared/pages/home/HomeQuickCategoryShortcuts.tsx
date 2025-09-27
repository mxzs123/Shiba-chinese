import Link from "next/link";

import { cn } from "lib/utils";

import type { HomeCategoryLink } from "./categories";
import { POPULAR_CATEGORY_LINKS } from "./categories";

const DEFAULT_VIEW_ALL = "/search";

type HomeQuickCategoryShortcutsProps = {
  categories?: HomeCategoryLink[];
  viewAllHref?: string;
  className?: string;
};

export function HomeQuickCategoryShortcuts({
  categories = POPULAR_CATEGORY_LINKS,
  viewAllHref = DEFAULT_VIEW_ALL,
  className,
}: HomeQuickCategoryShortcutsProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "border-b border-neutral-200 bg-white",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#049e6b]">
            <span className="h-px w-6 bg-[#049e6b]" aria-hidden="true" />
            热门品类快速直达
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.label}
                href={category.href}
                className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-[#049e6b] hover:bg-white hover:text-[#049e6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
              >
                {category.label}
              </Link>
            ))}
          </div>
          <div className="hidden shrink-0 lg:block">
            <Link
              href={viewAllHref}
              className="inline-flex items-center justify-center rounded-full border border-[#049e6b]/50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
            >
              浏览全部品类
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeQuickCategoryShortcuts;
