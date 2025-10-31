import Link from "next/link";

import type { GoodCategory } from "lib/api/types";
import { cn, createUrl } from "lib/utils";
import { sorting } from "lib/constants";

import { createSearchParams } from "./utils";

const sidebarSectionClass = "space-y-3";
const sectionTitleClass =
  "text-xs font-semibold uppercase tracking-[0.2em] text-[#049e6b]";
const categoryListClass = "space-y-2";
const categoryItemClass =
  "flex flex-col rounded-xl border border-transparent px-4 py-3 text-sm transition hover:border-[#049e6b] hover:bg-[#049e6b]/5";
const categoryLabelClass = "font-medium text-neutral-900";
const remoteCategoryListClass = "mt-3 space-y-2";
const remoteCategoryMetaClass = "mt-1 text-xs text-neutral-500";
const remoteChildListClass = "mt-3 flex flex-wrap gap-2";
const remoteChildLinkClass =
  "inline-flex items-center rounded-full border border-transparent px-3 py-1 text-xs transition hover:border-[#049e6b] hover:bg-[#049e6b]/10";
const remoteChildLinkActiveClass =
  "border-[#049e6b] bg-[#049e6b]/10 text-[#049e6b]";
const remoteEmptyClass = "rounded-xl border border-dashed border-neutral-300 px-4 py-3 text-xs text-neutral-500";
const sortListClass = "space-y-2";
const sortButtonClass =
  "block rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-100";

function createAllHref(searchValue?: string, sortSlug?: string | null) {
  return createUrl(
    "/search",
    createSearchParams({
      ...(searchValue ? { q: searchValue } : null),
      ...(sortSlug ? { sort: sortSlug } : null),
      page: undefined,
      goodCategory: undefined,
      goodSubCategory: undefined,
    }),
  );
}

function createSortHref(
  basePath: string,
  sortSlug: string | null,
  searchValue?: string,
  extraParams?: Record<string, string | undefined>,
) {
  const params = createSearchParams({
    ...(searchValue ? { q: searchValue } : null),
    ...(sortSlug ? { sort: sortSlug } : null),
    page: undefined,
    ...extraParams,
  });

  return createUrl(basePath, params);
}

function createGoodCategoryHref({
  basePath,
  searchValue,
  sortSlug,
  categoryId,
  subCategoryId,
}: {
  basePath: string;
  searchValue?: string;
  sortSlug?: string | null;
  categoryId?: number;
  subCategoryId?: number;
}) {
  const params = createSearchParams({
    ...(searchValue ? { q: searchValue } : null),
    ...(sortSlug ? { sort: sortSlug } : null),
    goodCategory: categoryId ? String(categoryId) : undefined,
    goodSubCategory: subCategoryId ? String(subCategoryId) : undefined,
    page: undefined,
  });

  return createUrl(basePath, params);
}

function formatCategoryMeta(category: GoodCategory) {
  const meta = [category.jpName, category.enName]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value) => value.length > 0)
    .join(" / ");

  return meta || null;
}

export type DesktopSearchSidebarProps = {
  activeCategory?: string | null;
  basePath: string;
  searchValue?: string;
  sortSlug?: string | null;
  goodCategories?: GoodCategory[];
  selectedGoodCategoryId?: number | null;
  selectedGoodSubCategoryId?: number | null;
};

export function DesktopSearchSidebar({
  activeCategory,
  basePath,
  searchValue,
  sortSlug,
  goodCategories,
  selectedGoodCategoryId,
  selectedGoodSubCategoryId,
}: DesktopSearchSidebarProps) {
  const hasRemoteCategories = Boolean(goodCategories?.length);

  return (
    <aside className="sticky top-28 flex h-fit w-full flex-col gap-8">
      <section className={sidebarSectionClass}>
        <h2 className={sectionTitleClass}>商品分类（接口）</h2>
        <ul className={categoryListClass}>
          <li>
            <Link
              href={createAllHref(searchValue, sortSlug)}
              className={cn(categoryItemClass, {
                "border-[#049e6b] bg-[#049e6b]/10":
                  !activeCategory && !selectedGoodCategoryId,
              })}
            >
              <span className={categoryLabelClass}>全部商品</span>
              <span className="mt-1 text-xs text-neutral-500">
                返回搜索列表
              </span>
            </Link>
          </li>
        </ul>
        {hasRemoteCategories ? (
          <ul className={remoteCategoryListClass}>
            {goodCategories!.map((category) => {
              const meta = formatCategoryMeta(category);
              const isActiveCategory =
                selectedGoodCategoryId === category.id;

              return (
                <li key={category.id}>
                  <Link
                    href={createGoodCategoryHref({
                      basePath,
                      searchValue,
                      sortSlug,
                      categoryId: category.id,
                    })}
                    className={cn(
                      categoryItemClass,
                      "hover:border-neutral-200 hover:bg-neutral-50",
                      isActiveCategory && "border-[#049e6b] bg-[#049e6b]/10",
                    )}
                    aria-current={isActiveCategory ? "true" : undefined}
                  >
                    <span className={categoryLabelClass}>{category.name}</span>
                    {meta ? (
                      <p className={remoteCategoryMetaClass}>{meta}</p>
                    ) : null}
                  </Link>
                  {isActiveCategory && category.children?.length ? (
                    <ul className={remoteChildListClass}>
                      {category.children.map((child) => {
                        const isChildActive =
                          selectedGoodSubCategoryId === child.id;
                        return (
                          <li key={child.id}>
                            <Link
                              href={createGoodCategoryHref({
                                basePath,
                                searchValue,
                                sortSlug,
                                categoryId: category.id,
                                subCategoryId: child.id,
                              })}
                              className={cn(
                                remoteChildLinkClass,
                                isChildActive && remoteChildLinkActiveClass,
                              )}
                            >
                              {child.name}
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
        ) : (
          <p className={remoteEmptyClass}>
            暂无分类数据，请确认接口是否返回内容。
          </p>
        )}
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
                    href={createSortHref(basePath, item.slug, searchValue, {
                      goodCategory: selectedGoodCategoryId
                        ? String(selectedGoodCategoryId)
                        : undefined,
                      goodSubCategory: selectedGoodSubCategoryId
                        ? String(selectedGoodSubCategoryId)
                        : undefined,
                    })}
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
