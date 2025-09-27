"use client";

import { useEffect, useMemo, useState } from "react";

import type { Product } from "lib/api/types";
import { defaultSort, sorting } from "lib/constants";
import { cn } from "lib/utils";

import { ProductCard, ProductCardQuickAdd } from "app/_shared";

const DEFAULT_PAGE_SIZE = 12;

const PRICE_FILTERS = [
  { id: "all", label: "全部价格", min: 0, max: Infinity },
  { id: "0-80", label: "¥0 - ¥80", min: 0, max: 80 },
  { id: "80-120", label: "¥80 - ¥120", min: 80, max: 120 },
  { id: "120+", label: "¥120 以上", min: 120, max: Infinity },
] as const;

type PriceFilterId = (typeof PRICE_FILTERS)[number]["id"];

type DesktopSearchViewProps = {
  allProducts: Product[];
  title?: string;
  subtitle?: string;
  initialQuery?: string;
  pageSize?: number;
  collectionTitle?: string;
};

type SortOption = (typeof sorting)[number];

type TagMeta = {
  value: string;
  label: string;
  count: number;
};

const DEFAULT_TAG_LABELS: Record<string, string> = {
  featured: "精选推荐",
  "drink-kit": "冲泡套组",
  wellness: "身心调理",
  herbal: "草本花茶",
  nutrition: "营养补给",
  bestseller: "热卖优选",
  accessories: "生活器具",
  seasonal: "季节限定",
};

function normaliseText(content: string) {
  return content.toLowerCase();
}

function getPrice(product: Product) {
  return Number(product.priceRange.minVariantPrice.amount || 0);
}

function deriveTagMeta(products: Product[]): TagMeta[] {
  const tagMap = new Map<string, number>();

  products.forEach((product) => {
    product.tags.forEach((tag) => {
      const current = tagMap.get(tag) ?? 0;
      tagMap.set(tag, current + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([value, count]) => ({
      value,
      count,
      label: DEFAULT_TAG_LABELS[value] || value,
    }))
    .sort((a, b) => b.count - a.count);
}

function sortProducts(
  products: Product[],
  sortOption: SortOption,
  baseIndices: Map<string, number>,
  query: string,
) {
  const sorted = [...products];

  switch (sortOption.sortKey) {
    case "PRICE":
      sorted.sort((a, b) => getPrice(a) - getPrice(b));
      break;
    case "CREATED_AT":
      sorted.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      break;
    case "BEST_SELLING":
      sorted.sort((a, b) => {
        const aScore = a.tags.includes("bestseller") ? 0 : 1;
        const bScore = b.tags.includes("bestseller") ? 0 : 1;

        if (aScore === bScore) {
          return (baseIndices.get(a.id) ?? 0) - (baseIndices.get(b.id) ?? 0);
        }

        return aScore - bScore;
      });
      break;
    default:
      if (query) {
        const scored = sorted.map((product) => ({
          product,
          score: computeRelevanceScore(product, query),
        }));

        scored.sort((a, b) => {
          if (a.score === b.score) {
            return (
              (baseIndices.get(a.product.id) ?? 0) -
              (baseIndices.get(b.product.id) ?? 0)
            );
          }

          return b.score - a.score;
        });

        return scored.map((entry) => entry.product);
      }
      break;
  }

  if (sortOption.reverse) {
    sorted.reverse();
  }

  return sorted;
}

function computeRelevanceScore(product: Product, query: string) {
  const normalised = normaliseText(query.trim());

  if (!normalised.length) {
    return 0;
  }

  const haystackTitle = normaliseText(product.title);
  const haystackDescription = normaliseText(product.description);
  const tagMatches = product.tags.filter((tag) =>
    normaliseText(tag).includes(normalised),
  ).length;

  let score = 0;

  if (haystackTitle.includes(normalised)) {
    score += 10;
  }

  if (haystackDescription.includes(normalised)) {
    score += 4;
  }

  score += tagMatches * 2;

  return score;
}

export function DesktopSearchView({
  allProducts,
  title = "商品搜索",
  subtitle = "浏览芝园药局精选商品，支持本地筛选与排序。",
  initialQuery = "",
  pageSize = DEFAULT_PAGE_SIZE,
  collectionTitle,
}: DesktopSearchViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortSlug, setSortSlug] = useState<string | null>(defaultSort.slug);
  const [priceFilter, setPriceFilter] = useState<PriceFilterId>("all");
  const [page, setPage] = useState(1);

  const baseIndices = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((product, index) => {
      map.set(product.id, index);
    });
    return map;
  }, [allProducts]);

  useEffect(() => {
    setPage(1);
  }, [query, selectedTags, priceFilter, sortSlug]);

  const tagMeta = useMemo(() => deriveTagMeta(allProducts), [allProducts]);

  const activeSort = useMemo(() => {
    return sorting.find((option) => option.slug === sortSlug) ?? defaultSort;
  }, [sortSlug]);

  const filteredProducts = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();
    const priceConfig =
      PRICE_FILTERS.find((config) => config.id === priceFilter) ??
      PRICE_FILTERS[0];

    return allProducts.filter((product) => {
      const matchesQuery = normalisedQuery.length
        ? normaliseText(product.title).includes(normalisedQuery) ||
          normaliseText(product.description).includes(normalisedQuery)
        : true;

      if (!matchesQuery) {
        return false;
      }

      const price = getPrice(product);
      const matchesPrice = price >= priceConfig.min && price <= priceConfig.max;

      if (!matchesPrice) {
        return false;
      }

      if (!selectedTags.length) {
        return true;
      }

      return selectedTags.every((tag) => product.tags.includes(tag));
    });
  }, [allProducts, query, priceFilter, selectedTags]);

  const sortedProducts = useMemo(() => {
    return sortProducts(
      filteredProducts,
      activeSort,
      baseIndices,
      query.trim().toLowerCase(),
    );
  }, [filteredProducts, activeSort, baseIndices, query]);

  const size = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / size));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (safePage - 1) * size,
    safePage * size,
  );

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const hasResults = paginatedProducts.length > 0;
  const resultCount = sortedProducts.length;

  return (
    <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) gap-8 px-4 py-12">
      <aside className="hidden w-64 shrink-0 space-y-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm lg:block">
        <section>
          <h2 className="text-sm font-semibold text-neutral-500">价格区间</h2>
          <div className="mt-4 space-y-2">
            {PRICE_FILTERS.map((filter) => (
              <label
                key={filter.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100",
                  priceFilter === filter.id &&
                    "bg-neutral-100 text-neutral-900",
                )}
              >
                <input
                  type="radio"
                  className="h-4 w-4 border-neutral-300 text-teal-600"
                  name="price"
                  value={filter.id}
                  checked={priceFilter === filter.id}
                  onChange={() => setPriceFilter(filter.id)}
                />
                <span>{filter.label}</span>
              </label>
            ))}
          </div>
        </section>
        {tagMeta.length ? (
          <section>
            <h2 className="text-sm font-semibold text-neutral-500">标签筛选</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {tagMeta.map((tag) => {
                const isActive = selectedTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => {
                      setSelectedTags((prev) => {
                        if (prev.includes(tag.value)) {
                          return prev.filter((value) => value !== tag.value);
                        }
                        return [...prev, tag.value];
                      });
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition",
                      isActive
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900",
                    )}
                  >
                    <span>{tag.label}</span>
                    <span className="text-xs text-neutral-400">
                      {tag.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </aside>
      <section className="flex-1 space-y-8">
        <header className="space-y-4 rounded-xl border border-transparent bg-transparent">
          <div className="flex flex-col gap-2">
            {collectionTitle ? (
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">
                {collectionTitle}
              </p>
            ) : null}
            <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
            <p className="max-w-2xl text-sm text-neutral-600">{subtitle}</p>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-2 lg:max-w-md">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                搜索关键词
              </label>
              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="按商品名称或描述筛选"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  aria-label="搜索商品"
                />
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 lg:w-64">
              <label className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                排序
              </label>
              <select
                value={sortSlug ?? ""}
                onChange={(event) => setSortSlug(event.target.value || null)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                {sorting.map((option) => (
                  <option key={option.title} value={option.slug ?? ""}>
                    {option.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-sm text-neutral-500">共 {resultCount} 件商品。</p>
        </header>
        {hasResults ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  actionSlot={<ProductCardQuickAdd product={product} />}
                />
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="flex items-center justify-between gap-4 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm shadow-sm">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={safePage === 1}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-4 py-2",
                    safePage === 1
                      ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                      : "bg-teal-600 text-white hover:bg-teal-500",
                  )}
                >
                  上一页
                </button>
                <div className="flex items-center gap-3 text-neutral-600">
                  <span>
                    第 {safePage} / {totalPages} 页
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={safePage === totalPages}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-4 py-2",
                    safePage === totalPages
                      ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                      : "bg-teal-600 text-white hover:bg-teal-500",
                  )}
                >
                  下一页
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white px-12 py-24 text-center">
            <h2 className="text-xl font-semibold text-neutral-800">
              暂无搜索结果
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              调整关键字、选择不同标签或清除筛选条件试试，芝园药局还有更多灵感等待发现。
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery(initialQuery ?? "");
                setSelectedTags([]);
                setPriceFilter("all");
              }}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-teal-500"
            >
              重置筛选
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
