export type SortFilterItem = {
  title: string;
  slug: string | null;
  sortKey: "RELEVANCE" | "BEST_SELLING" | "CREATED_AT" | "PRICE";
  reverse: boolean;
};

import { APP_TEXT } from "./i18n/constants";

export const defaultSort: SortFilterItem = {
  title: APP_TEXT.sort.relevance,
  slug: null,
  sortKey: "RELEVANCE",
  reverse: false,
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: APP_TEXT.sort.trending,
    slug: "trending-desc",
    sortKey: "BEST_SELLING",
    reverse: false,
  },
  {
    title: APP_TEXT.sort.latestArrivals,
    slug: "latest-desc",
    sortKey: "CREATED_AT",
    reverse: true,
  },
  {
    title: APP_TEXT.sort.priceLowToHigh,
    slug: "price-asc",
    sortKey: "PRICE",
    reverse: false,
  },
  {
    title: APP_TEXT.sort.priceHighToLow,
    slug: "price-desc",
    sortKey: "PRICE",
    reverse: true,
  },
];

export const TAGS = {
  collections: "collections",
  products: "products",
  cart: "cart",
};

export const HIDDEN_PRODUCT_TAG = "nextjs-frontend-hidden";
export const DEFAULT_OPTION = "Default Title";
