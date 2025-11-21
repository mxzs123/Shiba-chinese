import type { GoodsCategory } from "./types";

export type RawGoodsRecord = {
  productId: number;
  slug: string;
  title: string;
  jpName: string;
  brand: string;
  spec: string;
  priceJpy: number;
  priceCny: number;
  notes?: string;
  effects: string;
  keywords: string[];
  categoryId: number;
  subCategoryId: number;
  subCategoryName: string;
  image: {
    src: string;
    alt: string;
  };
  collectionHandles?: string[];
  rank: number;
};

export type { GoodsCategory };
