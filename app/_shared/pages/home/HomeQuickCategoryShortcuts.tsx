import Link from "next/link";

import { cn } from "lib/utils";

import type { HomeCategoryLink } from "./categories";
import { POPULAR_CATEGORY_LINKS } from "./categories";

type HomeQuickCategoryShortcutsProps = {
  categories?: HomeCategoryLink[];
  className?: string;
};

export function HomeQuickCategoryShortcuts({
  categories = POPULAR_CATEGORY_LINKS,
  className,
}: HomeQuickCategoryShortcutsProps) {
  if (!categories.length) {
    return null;
  }

  return (
    <section
      className={cn(
        "bg-gradient-to-b from-neutral-100 via-white to-white",
        className,
      )}
    >
      <div className="bg-white py-3 shadow-lg ring-1 ring-inset ring-neutral-100">
        <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 sm:px-6 lg:px-8">
          <nav aria-label="品类快速导航" className="overflow-x-auto">
            <ul className="relative grid min-w-full grid-cols-2 bg-white text-sm font-medium text-neutral-700 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
              {categories.map((category, index) => (
                <li
                  key={category.label}
                  className={cn(
                    "relative flex min-h-[3.25rem] items-stretch",
                    "before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-neutral-200 before:content-['']",
                    index === categories.length - 1 &&
                      "after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-neutral-200 after:content-['']",
                  )}
                >
                  <Link
                    href={category.href}
                    className="flex w-full items-center justify-center bg-white px-4 text-center leading-tight transition-colors duration-150 hover:bg-white/80 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
                  >
                    <span className="whitespace-nowrap">{category.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </section>
  );
}

export default HomeQuickCategoryShortcuts;
