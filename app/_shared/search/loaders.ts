import { getGoodsPageList } from "lib/api";
import type { GoodsPageInfo, Product } from "lib/api/types";

import { DESKTOP_SEARCH_PAGE_SIZE, type SearchCategory } from "./config";
import { parsePageParam, resolveSort } from "./utils";

type SearchQueryInput = {
  searchValue?: string | null;
  sortSlug?: string | null;
  page?: string | null;
  category?: SearchCategory;
};

export type SearchResult = {
  items: Product[];
  total: number;
  pageInfo: GoodsPageInfo;
  sortSlug?: string | null;
  searchValue?: string | null;
};

function mapSortSlugToOrder(sortSlug?: string | null) {
  if (!sortSlug) {
    return "1";
  }

  switch (sortSlug) {
    case "trending-desc":
      return "2";
    case "latest-desc":
      return "3";
    case "price-asc":
      return "4";
    case "price-desc":
      return "5";
    default:
      return "1";
  }
}

function buildWhereInput({
  searchValue,
  category,
}: {
  searchValue?: string | null;
  category?: SearchCategory;
}) {
  const where: Record<string, unknown> = {};

  if (category) {
    where.catId = category.catId;
  }

  if (searchValue && searchValue.trim().length > 0) {
    where.searchName = searchValue.trim();
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

export async function loadSearchResult({
  searchValue,
  sortSlug,
  page,
  category,
}: SearchQueryInput): Promise<SearchResult> {
  const resolvedSort = resolveSort(sortSlug);
  const order = mapSortSlugToOrder(resolvedSort.slug);
  const currentPage = parsePageParam(page);
  const limit = DESKTOP_SEARCH_PAGE_SIZE;
  const where = buildWhereInput({ searchValue, category });

  const response = await getGoodsPageList({
    page: currentPage,
    limit,
    order,
    where: where ? JSON.stringify(where) : undefined,
  });

  const fallbackPageInfo: GoodsPageInfo = {
    page: currentPage,
    limit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  if (!response.status || !response.data) {
    return {
      items: [],
      total: 0,
      pageInfo: fallbackPageInfo,
      sortSlug: resolvedSort.slug,
      searchValue,
    };
  }

  const pageInfo = response.data.pageInfo || fallbackPageInfo;

  return {
    items: response.data.items,
    total: pageInfo.total,
    pageInfo,
    sortSlug: resolvedSort.slug,
    searchValue,
  };
}
