import type { Product, ProductVariant } from "./types";
import { findProductByHandle, findVariantById, products } from "./mock-data";
import {
  findGoodsProductByHandle as lookupGoodsProductByHandle,
  findGoodsProductByInternalId as lookupGoodsProductByInternalId,
  mockGetGoodsRecommendList,
} from "./goods";

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

export async function getProduct(handle: string): Promise<Product | undefined> {
  const goodsProduct = lookupGoodsProductByHandle(handle);

  if (goodsProduct) {
    return goodsProduct;
  }

  const product = findProductByHandle(handle);

  if (!product) {
    return undefined;
  }

  const { collections: _collections, bestsellerRank: _rank, ...rest } = product;

  return rest;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const goodsProduct = lookupGoodsProductByInternalId(id);

  if (goodsProduct) {
    return goodsProduct;
  }

  const product = products.find((entry) => entry.id === id);

  if (!product) {
    return undefined;
  }

  const { collections: _collections, bestsellerRank: _rank, ...rest } = product;

  return rest;
}

export async function getVariantById(
  variantId: string,
): Promise<{ product: Product; variant: ProductVariant } | undefined> {
  const match = findVariantById(variantId);

  if (!match) {
    return undefined;
  }

  const productRecord = match.product as Product & {
    collections?: string[];
    bestsellerRank?: number;
  };

  const {
    collections: _collections,
    bestsellerRank: _rank,
    ...rest
  } = productRecord;

  return {
    product: rest,
    variant: match.variant,
  };
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  const goodsProduct = lookupGoodsProductByInternalId(productId);

  if (goodsProduct?.backend?.productId) {
    const response = await mockGetGoodsRecommendList({
      id: goodsProduct.backend.productId,
    });

    if (response.status && response.data) {
      return response.data;
    }
  }

  const filtered = products.filter((product) => product.id !== productId);

  return serializeProducts(filtered.slice(0, 4));
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  let filtered = [...products];

  if (query) {
    const normalised = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.title.toLowerCase().includes(normalised) ||
        product.description.toLowerCase().includes(normalised),
    );
  }

  const sorted = sortProducts(filtered, sortKey, reverse);

  return serializeProducts(sorted);
}
