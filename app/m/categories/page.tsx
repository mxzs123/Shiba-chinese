import { MobileHeader } from "@/components/layout/mobile-header";
import { getNotifications } from "@/lib/api";
import { MobileCategoriesContent } from "./categories-content";
import {
  findSearchCategory,
  getSearchCategories,
  type SearchCategory,
} from "@/app/_shared/search/config";
import { loadSearchResult } from "@/app/_shared/search/loaders";
import type { Product } from "@/lib/api/types";

export const metadata = {
  title: "商品分类",
  description: "浏览所有商品分类",
};

function getParam(value?: string | string[]) {
  if (!value) return null;
  return Array.isArray(value) ? value[0] : value;
}

function flattenCategories(categories: SearchCategory[]): SearchCategory[] {
  const result: SearchCategory[] = [];

  for (const category of categories) {
    result.push(category);
    if (category.children?.length) {
      result.push(...flattenCategories(category.children));
    }
  }

  return result;
}

export default async function MobileCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string }>;
}) {
  const notifications = await getNotifications();
  const params = (await searchParams) || {};
  const searchValue = getParam(params.q);
  const requestedCategorySlug = getParam(params.category);
  const categoryTree = getSearchCategories();
  const flatCategories = flattenCategories(categoryTree);
  const categorySlug =
    requestedCategorySlug &&
    flatCategories.some((category) => category.slug === requestedCategorySlug)
      ? requestedCategorySlug
      : "";

  const category = categorySlug ? findSearchCategory(categorySlug) : undefined;
  const parentSlug = categorySlug
    ? category?.parentSlug || category?.slug || categoryTree[0]?.slug || ""
    : "";

  const result = await loadSearchResult({
    category,
    searchValue,
    sortSlug: null,
    page: null,
  });

  const products = result.items;

  return (
    <div className="flex h-screen flex-col">
      <MobileHeader
        notifications={notifications}
        showSearchInput={Boolean(searchValue)}
        initialSearchValue={searchValue || undefined}
      />
      <div className="flex flex-1 overflow-hidden">
        <MobileCategoriesContent
          categoryTree={categoryTree}
          flatCategories={flatCategories}
          initialCategory={categorySlug}
          initialParent={parentSlug}
          initialProducts={products}
          initialSearchValue={searchValue}
        />
      </div>
    </div>
  );
}
