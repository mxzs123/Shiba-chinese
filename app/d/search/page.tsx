import Search from "components/layout/navbar/search";

import { SearchPageShell } from "@/app/_shared/search/SearchPageShell";
import { DESKTOP_SEARCH_PAGE_SIZE } from "@/app/_shared/search/config";
import {
  loadGoodCategories,
  loadGoodCategoryProducts,
  loadSearchResult,
} from "@/app/_shared/search/loaders";
import SearchResultsGrid from "@/app/_shared/search/SearchResultsGrid";
import SearchPagination from "@/app/_shared/search/SearchPagination";
import GoodProductsGrid from "@/app/_shared/search/GoodProductsGrid";

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
  const goodCategoryParam = getParam(resolvedSearchParams.goodCategory);
  const goodSubCategoryParam = getParam(
    resolvedSearchParams.goodSubCategory,
  );

  const goodCategoryId = goodCategoryParam
    ? Number.parseInt(goodCategoryParam, 10)
    : null;
  const goodSubCategoryId = goodSubCategoryParam
    ? Number.parseInt(goodSubCategoryParam, 10)
    : null;

  const [result, goodCategories] = await Promise.all([
    loadSearchResult({
      searchValue: q,
      sortSlug: sort,
      page,
    }),
    loadGoodCategories(),
  ]);

  const selectedGoodCategory =
    goodCategoryId != null
      ? goodCategories.find((category) => category.id === goodCategoryId)
      : undefined;

  const selectedGoodSubCategory =
    goodSubCategoryId != null && selectedGoodCategory?.children?.length
      ? selectedGoodCategory.children.find(
          (child) => child.id === goodSubCategoryId,
        )
      : undefined;

  const goodsResult = selectedGoodCategory
    ? await loadGoodCategoryProducts({
        categories: goodCategories,
        categoryId: selectedGoodCategory.id,
        subCategoryId: selectedGoodSubCategory?.id ?? null,
        page,
        limit: DESKTOP_SEARCH_PAGE_SIZE,
      })
    : null;

  const sidebar = {
    activeCategory: selectedGoodCategory ? `good-${selectedGoodCategory.id}` : null,
    basePath: "/search",
    searchValue: q ?? undefined,
    sortSlug: result.sortSlug ?? null,
    goodCategories,
    selectedGoodCategoryId: selectedGoodCategory?.id ?? null,
    selectedGoodSubCategoryId: selectedGoodSubCategory?.id ?? null,
  } as const;

  const usingGoodsResult = Boolean(goodsResult);

  const totalCount = usingGoodsResult
    ? goodsResult?.total ?? 0
    : result.total;
  const currentPage = usingGoodsResult
    ? goodsResult?.currentPage ?? 1
    : result.currentPage;
  const totalPages = usingGoodsResult
    ? goodsResult?.totalPages ?? 1
    : result.totalPages;
  const pageSize = usingGoodsResult
    ? goodsResult?.pageSize ?? DESKTOP_SEARCH_PAGE_SIZE
    : DESKTOP_SEARCH_PAGE_SIZE;

  const headerTitle = selectedGoodCategory
    ? selectedGoodSubCategory
      ? `${selectedGoodSubCategory.name}`
      : selectedGoodCategory.name
    : q
      ? `“${q}” 的搜索结果`
      : "探索芝园精选";

  const headerSubline = selectedGoodCategory
    ? `共 ${totalCount} 件商品，每页展示 ${pageSize} 件。`
    : `共 ${result.total} 件商品，每页展示 ${DESKTOP_SEARCH_PAGE_SIZE} 件。`;

  const header = (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            搜索中心
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            {headerTitle}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{headerSubline}</p>
        </div>
        <div className="w-full max-w-lg lg:w-[360px]">
          <Search />
        </div>
      </div>
    </div>
  );

  const emptyMessage = selectedGoodCategory
    ? "当前分类暂无商品，请稍后再试。"
    : q
      ? `没有找到与 “${q}” 相关的商品，换个关键词试试吧。`
      : "暂时没有可展示的商品。";

  return (
    <SearchPageShell sidebar={sidebar} header={header}>
      {usingGoodsResult ? (
        <GoodProductsGrid
          products={goodsResult?.products ?? []}
          emptyMessage={emptyMessage}
        />
      ) : (
        <SearchResultsGrid
          products={result.products}
          emptyMessage={emptyMessage}
        />
      )}
      <SearchPagination
        basePath="/search"
        currentPage={currentPage}
        totalPages={totalPages}
        searchValue={q ?? undefined}
        sort={result.sortSlug ?? undefined}
        extraParams={{
          goodCategory: selectedGoodCategory?.id
            ? String(selectedGoodCategory.id)
            : undefined,
          goodSubCategory: selectedGoodSubCategory?.id
            ? String(selectedGoodSubCategory.id)
            : undefined,
        }}
      />
    </SearchPageShell>
  );
}
