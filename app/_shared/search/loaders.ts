import { getCollection, getCollectionProducts, getProducts } from "lib/api";
import type { Collection, Product } from "lib/api/types";

import { DESKTOP_SEARCH_PAGE_SIZE, type SearchCategory } from "./config";
import { parsePageParam, resolveSort } from "./utils";

type SearchQueryInput = {
  searchValue?: string | null;
  sortSlug?: string | null;
  page?: string | null;
  category?: SearchCategory;
};

export type SearchResult = {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  sortSlug?: string | null;
  searchValue?: string | null;
};

export async function loadCollection(
  category: SearchCategory,
): Promise<Collection | undefined> {
  if (category.source.type !== "collection") {
    return undefined;
  }

  return getCollection(category.source.handle);
}

export async function loadSearchResult({
  searchValue,
  sortSlug,
  page,
  category,
}: SearchQueryInput): Promise<SearchResult> {
  const { sortKey, reverse, slug } = resolveSort(sortSlug);
  const pageSize = DESKTOP_SEARCH_PAGE_SIZE;

  let products: Product[];

  if (category) {
    if (category.source.type === "collection") {
      products = await getCollectionProducts({
        collection: category.source.handle,
        sortKey,
        reverse,
      });
    } else {
      products = await getProducts({
        query: category.source.value,
        sortKey,
        reverse,
      });
    }
  } else {
    products = await getProducts({
      query: searchValue ?? undefined,
      sortKey,
      reverse,
    });
  }

  if (category && category.source.type === "collection" && searchValue) {
    const query = searchValue.trim().toLowerCase();

    if (query.length) {
      products = products.filter((product) => {
        const title = product.title.toLowerCase();
        const description = product.description.toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }
  }

  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(parsePageParam(page), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedProducts = products.slice(start, end);

  return {
    products: paginatedProducts,
    total,
    totalPages,
    currentPage,
    pageSize,
    sortSlug: slug,
    searchValue,
  };
}
