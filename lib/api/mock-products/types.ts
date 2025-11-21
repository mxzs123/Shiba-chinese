import type { Collection, Product } from "../types";

export type ProductRecord = Product & {
  collections: string[];
  bestsellerRank: number;
};

export type CollectionRecord = Collection & {
  isHidden?: boolean;
};
