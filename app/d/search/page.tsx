import Search from "components/layout/navbar/search";

import { SearchPageShell } from "@/app/_shared/search/SearchPageShell";
import {
  DESKTOP_SEARCH_PAGE_SIZE,
  getSearchCategories,
} from "@/app/_shared/search/config";
import { loadSearchResult } from "@/app/_shared/search/loaders";
import SearchResultsGrid from "@/app/_shared/search/SearchResultsGrid";
import SearchPagination from "@/app/_shared/search/SearchPagination";

function getParam(value?: string | string[]) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type SearchPageProps = {
  searchParams?: SearchParams;
};

export default async function DesktopSearchPage({
  searchParams,
}: SearchPageProps) {
  const resolvedSearchParams = (await searchParams) || {};
  const q = getParam(resolvedSearchParams.q) || null;
  const sort = getParam(resolvedSearchParams.sort) || null;
  const page = getParam(resolvedSearchParams.page) || null;

  const result = await loadSearchResult({
    searchValue: q,
    sortSlug: sort,
    page,
  });

  const categories = getSearchCategories();

  const sidebar = {
    categories,
    activeCategory: null,
    basePath: "/search",
    searchValue: q ?? undefined,
    sortSlug: result.sortSlug ?? null,
  } as const;

  const header = (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            搜索中心
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            {q ? `“${q}” 的搜索结果` : "探索芝园精选"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            共 {result.total} 件商品，每页展示 {DESKTOP_SEARCH_PAGE_SIZE} 件。
          </p>
        </div>
        <div className="w-full max-w-lg lg:w-[360px]">
          <Search />
        </div>
      </div>
    </div>
  );

  const emptyMessage = q
    ? `没有找到与 “${q}” 相关的商品，换个关键词试试吧。`
    : "暂时没有可展示的商品。";

  return (
    <SearchPageShell sidebar={sidebar} header={header}>
      <SearchResultsGrid items={result.items} emptyMessage={emptyMessage} />
      <SearchPagination
        basePath="/search"
        pageInfo={result.pageInfo}
        searchValue={q ?? undefined}
        sort={result.sortSlug ?? undefined}
      />
    </SearchPageShell>
  );
}
