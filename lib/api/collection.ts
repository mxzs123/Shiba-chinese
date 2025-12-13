import type { Collection, Product } from "./types";
import {
  findCollectionByHandle,
  listVisibleCollections,
  products,
} from "./mock-data";

function serializeProducts(list: typeof products): Product[] {
  return list.map(
    ({ collections: _collections, bestsellerRank: _rank, ...rest }) => rest,
  );
}

function sortProducts(
  list: typeof products,
  sortKey: string | undefined,
  reverse: boolean | undefined,
) {
  const sorted = [...list];

  switch (sortKey) {
    case "PRICE":
      sorted.sort(
        (a, b) =>
          Number(a.priceRange.maxVariantPrice.amount) -
          Number(b.priceRange.maxVariantPrice.amount),
      );
      break;
    case "CREATED_AT":
      sorted.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      );
      break;
    case "BEST_SELLING":
      sorted.sort((a, b) => a.bestsellerRank - b.bestsellerRank);
      break;
    default:
      break;
  }

  if (reverse) {
    sorted.reverse();
  }

  return sorted;
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  const collection = findCollectionByHandle(handle);

  if (!collection) {
    return undefined;
  }

  const { isHidden: _hidden, ...rest } = collection;
  return rest;
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  const filtered = products.filter((product) =>
    product.collections.includes(collection),
  );

  if (!filtered.length) {
    return [];
  }

  const sorted = sortProducts(filtered, sortKey, reverse);

  return serializeProducts(sorted);
}

export async function getCollections(): Promise<Collection[]> {
  const visibleCollections = listVisibleCollections();

  const collectionsWithPaths = visibleCollections.map(
    ({ isHidden: _hidden, ...rest }) => rest,
  );

  return [
    {
      handle: "",
      title: "全部商品",
      description: "浏览所有上架商品",
      seo: {
        title: "全部商品",
        description: "浏览所有上架商品",
      },
      updatedAt: new Date().toISOString(),
      path: "/search",
    },
    ...collectionsWithPaths,
  ];
}
