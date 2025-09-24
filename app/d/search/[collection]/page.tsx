import Search from "components/layout/navbar/search";
import { getCollection } from "lib/api";
import type { Collection } from "lib/api/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SearchPageShell } from "@/app/_shared/search/SearchPageShell";
import {
  DESKTOP_SEARCH_PAGE_SIZE,
  findSearchCategory,
  type SearchCategory,
} from "@/app/_shared/search/config";
import { loadCollection, loadSearchResult } from "@/app/_shared/search/loaders";
import SearchResultsGrid from "@/app/_shared/search/SearchResultsGrid";
import SearchPagination from "@/app/_shared/search/SearchPagination";

function getParam(value?: string | string[]) {
  if (!value) {
    return undefined;
  }

  return Array.isArray(value) ? value[0] : value;
}

type PageParams = Promise<{ collection: string }>;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type CollectionPageProps = {
  params: PageParams;
  searchParams?: SearchParams;
};

export async function generateMetadata(props: {
  params: PageParams;
}): Promise<Metadata> {
  const params = await props.params;
  const slug = params.collection;
  const category = findSearchCategory(slug);

  if (category) {
    if (category.source.type === "collection") {
      const collection = await loadCollection(category);
      if (collection) {
        return {
          title: collection.seo?.title || collection.title,
          description:
            collection.seo?.description ||
            collection.description ||
            `${collection.title} 商品`,
        };
      }
    }

    return {
      title: `${category.label} | 芝园搜索`,
      description: category.description,
    };
  }

  const collection = await getCollection(slug);

  if (!collection) {
    return notFound();
  }

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} 商品`,
  };
}

export default async function DesktopSearchCollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const slug = resolvedParams.collection;
  const q = getParam(resolvedSearchParams.q) || null;
  const sort = getParam(resolvedSearchParams.sort) || null;
  const page = getParam(resolvedSearchParams.page) || null;

  let category = findSearchCategory(slug);
  let collection: Collection | undefined;

  if (category && category.source.type === "collection") {
    collection = await loadCollection(category);
  }

  if (!category) {
    collection = await getCollection(slug);

    if (!collection) {
      return notFound();
    }

    category = {
      slug,
      label: collection.title,
      source: { type: "collection", handle: slug },
    } satisfies SearchCategory;
  }

  const basePath = `/search/${slug}`;

  const result = await loadSearchResult({
    searchValue: q,
    sortSlug: sort,
    page,
    category,
  });

  const header = (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            精选品类
          </p>
          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            {category.label}
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
    ? `在 “${category.label}” 中没有找到与 “${q}” 相关的商品。`
    : `“${category.label}” 暂无可展示的商品。`;

  return (
    <SearchPageShell
      sidebar={{
        activeCategory: category.slug,
        basePath,
        searchValue: q ?? undefined,
        sortSlug: result.sortSlug ?? null,
      }}
      header={header}
    >
      <SearchResultsGrid
        products={result.products}
        emptyMessage={emptyMessage}
      />
      <SearchPagination
        basePath={basePath}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        searchValue={q ?? undefined}
        sort={result.sortSlug ?? undefined}
      />
    </SearchPageShell>
  );
}
