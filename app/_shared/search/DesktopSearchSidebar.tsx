import Link from "next/link";

import { cn, createUrl } from "lib/utils";
import { sorting } from "lib/constants";

import type { SearchCategory } from "./config";
import { createSearchParams } from "./utils";

const sidebarSectionClass = "space-y-3";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#049e6b]";
const categoryListClass = "space-y-2";
const categoryItemClass =
  "flex flex-col rounded-xl border border-transparent px-4 py-3 text-sm transition hover:border-[#049e6b] hover:bg-[#049e6b]/5";
const categoryLabelClass = "font-medium text-neutral-900";
const childListClass = "mt-2 space-y-1 border-l border-dashed border-neutral-200 pl-4";
const childLinkClass =
  "flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:text-[#049e6b]";
const sortListClass = "space-y-2";
const sortButtonClass =
  "block rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-100";

function createCategoryHref(
  slug: string | undefined,
  searchValue?: string,
  sortSlug?: string | null,
) {
  const pathname = slug ? `/search/${slug}` : "/search";
  return createUrl(
    pathname,
    createSearchParams({
      ...(searchValue ? { q: searchValue } : null),
      ...(sortSlug ? { sort: sortSlug } : null),
      page: undefined,
    }),
  );
}

function createSortHref(
  basePath: string,
  sortSlug: string | null,
  searchValue?: string,
) {
  const params = createSearchParams({
    ...(searchValue ? { q: searchValue } : null),
    ...(sortSlug ? { sort: sortSlug } : null),
    page: undefined,
  });

  return createUrl(basePath, params);
}

export type DesktopSearchSidebarProps = {
  categories: SearchCategory[];
  activeCategory?: string | null;
  basePath: string;
  searchValue?: string;
  sortSlug?: string | null;
};

export function DesktopSearchSidebar({
  categories,
  activeCategory,
  basePath,
  searchValue,
  sortSlug,
}: DesktopSearchSidebarProps) {
  return (
    <aside className="sticky top-28 flex h-fit w-full flex-col gap-8">
      <section className={sidebarSectionClass}>
        <h2 className={sectionTitleClass}>精选品类</h2>
        <ul className={categoryListClass}>
          <li>
            <Link
              href={createCategoryHref(undefined, searchValue, sortSlug)}
              className={cn(categoryItemClass, {
                "border-[#049e6b] bg-[#049e6b]/10": !activeCategory,
              })}
            >
              <span className={categoryLabelClass}>全部商品</span>
            </Link>
          </li>
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            const hasChildren = category.children && category.children.length > 0;

            return (
              <li key={category.slug}>
                <Link
                  href={createCategoryHref(category.slug, searchValue, sortSlug)}
                  className={cn(categoryItemClass, {
                    "border-[#049e6b] bg-[#049e6b]/10": isActive,
                  })}
                >
                  <span className={categoryLabelClass}>{category.label}</span>
                  {category.jpName ? (
                    <span className="text-xs text-neutral-500">
                      {category.jpName}
                    </span>
                  ) : null}
                </Link>
                {hasChildren ? (
                  <ul className={childListClass}>
                    {category.children!.map((child) => {
                      const childActive = activeCategory === child.slug;
                      return (
                        <li key={child.slug}>
                          <Link
                            href={createCategoryHref(
                              child.slug,
                              searchValue,
                              sortSlug,
                            )}
                            className={cn(childLinkClass, {
                              "text-[#049e6b]": childActive,
                              "bg-[#049e6b]/10": childActive,
                            })}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={sidebarSectionClass}>
        <h2 className={sectionTitleClass}>排序方式</h2>
        <div className="rounded-2xl border border-neutral-200 p-2">
          <ul className={sortListClass}>
            {sorting.map((item) => {
              const itemSortSlug = item.slug;
              const isActive =
                sortSlug === itemSortSlug || (!sortSlug && !itemSortSlug);

              return (
                <li key={item.title}>
                  <Link
                    href={createSortHref(basePath, item.slug, searchValue)}
                    prefetch={!isActive ? false : undefined}
                    className={cn(sortButtonClass, {
                      "bg-[#049e6b]/10 text-[#049e6b]": isActive,
                    })}
                  >
                    {item.title === "Relevance"
                      ? "综合排序"
                      : item.title === "Trending"
                        ? "热度优先"
                        : item.title === "Latest arrivals"
                          ? "上新优先"
                          : item.title === "Price: Low to high"
                            ? "价格从低到高"
                            : item.title === "Price: High to low"
                              ? "价格从高到低"
                              : item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </aside>
  );
}

export default DesktopSearchSidebar;
