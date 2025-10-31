import {
  getCollection,
  getCollectionProducts,
  getGoodCategories,
  getGoodsPageList,
  getProducts,
} from "lib/api";
import type {
  Collection,
  GoodCategory,
  GoodProduct,
  Product,
} from "lib/api/types";

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

export async function loadGoodCategories(): Promise<GoodCategory[]> {
  try {
    const categories = await getGoodCategories();

    return [...categories].sort((a, b) => {
      const sortA = typeof a.sort === "number" ? a.sort : 0;
      const sortB = typeof b.sort === "number" ? b.sort : 0;

      return sortB - sortA;
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Search] Failed to load Good categories:", error);
    }
    return [];
  }
}

export type GoodCategoryProductsResult = {
  products: GoodProduct[];
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

type LoadGoodCategoryProductsInput = {
  categories: GoodCategory[];
  categoryId?: number | null;
  subCategoryId?: number | null;
  page?: string | null;
  limit?: number;
};

export async function loadGoodCategoryProducts({
  categories,
  categoryId,
  subCategoryId,
  page,
  limit = DESKTOP_SEARCH_PAGE_SIZE,
}: LoadGoodCategoryProductsInput): Promise<GoodCategoryProductsResult | null> {
  if (!categoryId && !subCategoryId) {
    return null;
  }

  const selectedCategory =
    categoryId != null
      ? categories.find((category) => category.id === categoryId)
      : undefined;

  const filters: Record<string, unknown> = {};

  if (subCategoryId) {
    filters.goodsCategoryId = subCategoryId;
  } else if (selectedCategory?.children?.length) {
    const childIds = selectedCategory.children
      .map((child) => child.id)
      .filter((id): id is number => typeof id === "number");

    if (childIds.length) {
      filters["goodsCategoryId|in"] = childIds;
    }
  }

  if (!Object.keys(filters).length) {
    const fallbackId = subCategoryId || categoryId;
    if (!fallbackId) {
      return null;
    }
    filters.goodsCategoryId = fallbackId;
  }

  try {
    const currentPage = parsePageParam(page);
    const response = await getGoodsPageList({
      page: currentPage,
      limit,
      where: filters,
    });

    const products = Array.isArray(response.list) ? response.list : [];

    return {
      products,
      total:
        typeof response.totalCount === "number" ? response.totalCount : 0,
      totalPages:
        typeof response.totalPages === "number" ? response.totalPages : 1,
      currentPage:
        typeof response.page === "number" ? response.page : currentPage,
      pageSize: typeof response.limit === "number" ? response.limit : limit,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Search] Failed to load goods page list:", error);
    }

    return {
      products: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      pageSize: limit,
    };
  }
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
