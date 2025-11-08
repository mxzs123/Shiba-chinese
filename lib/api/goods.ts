import {
  goodsCategories,
  goodsProductMapByBackendId,
  goodsProductMapByHandle,
  goodsProductRankMap,
  goodsProducts,
  goodsVariantsByObjectId,
} from "./mock-goods";
import type {
  BackendApiResponse,
  GoodsCategory,
  GoodsDetail,
  GoodsListItem,
  GoodsListQuery,
  GoodsListResult,
  GoodsWhereInput,
  Product,
  ProductVariant,
} from "./types";

const SUCCESS_MESSAGE = "接口响应成功";
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

type SortKey = "relevance" | "popular" | "latest" | "price_asc" | "price_desc";

function createResponse<T>(data: T, msg = SUCCESS_MESSAGE): BackendApiResponse<T> {
  return {
    methodDescription: null,
    otherData: null,
    status: true,
    msg,
    data,
    code: 0,
  };
}

function createErrorResponse<T>(msg: string, code = 500, data: T): BackendApiResponse<T> {
  return {
    methodDescription: null,
    otherData: null,
    status: false,
    msg,
    data,
    code,
  };
}

function sanitizeWhereInput(input?: GoodsListQuery["where"]): GoodsWhereInput | undefined {
  if (!input) {
    return undefined;
  }

  if (typeof input === "object") {
    return input;
  }

  const trimmed = input.trim();

  if (!trimmed.length) {
    return undefined;
  }

  const normalized = trimmed
    .replace(/'/g, '"')
    .replace(/([,{]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

  try {
    return JSON.parse(normalized);
  } catch (error) {
    return undefined;
  }
}

const categorySlugMap = new Map<string, GoodsCategory>();
const subCategorySlugMap = new Map<string, GoodsCategory>();

function indexCategories(categories: GoodsCategory[]) {
  for (const category of categories) {
    if (category.slug) {
      categorySlugMap.set(category.slug, category);
    }

    if (category.child) {
      for (const child of category.child) {
        if (child.slug) {
          subCategorySlugMap.set(child.slug, child);
        }
      }
    }
  }
}

indexCategories(goodsCategories);

function resolveGoodsStatus(product: Product): GoodsListItem["status"] {
  if (product.backend?.status) {
    return product.backend.status;
  }

  return product.availableForSale ? "available" : "unavailable";
}

function mapToGoodsListItem(product: Product): GoodsListItem {
  return {
    ...product,
    status: resolveGoodsStatus(product),
  };
}

function matchesCategory(product: Product, filters?: GoodsWhereInput): boolean {
  if (!filters) {
    return true;
  }

  const backend = product.backend;

  if (!backend) {
    return false;
  }

  const { categoryId, subCategoryId } = backend;

  if (typeof filters.catId === "number") {
    if (filters.catId === categoryId || filters.catId === subCategoryId) {
      // ok
    } else {
      return false;
    }
  }

  if (filters.categorySlug) {
    const category = categorySlugMap.get(filters.categorySlug);
    if (category && category.id !== categoryId) {
      return false;
    }
  }

  if (filters.subCategorySlug) {
    const child = subCategorySlugMap.get(filters.subCategorySlug);
    if (child && child.id !== subCategoryId) {
      return false;
    }
  }

  return true;
}

function matchesSearch(product: Product, filters?: GoodsWhereInput): boolean {
  if (!filters?.searchName) {
    return true;
  }

  const query = filters.searchName.trim().toLowerCase();

  if (!query.length) {
    return true;
  }

  const haystacks = [
    product.title,
    product.description || "",
    product.backend?.jpName || "",
    product.backend?.searchName || "",
    ...(product.backend?.keywords || []),
  ]
    .filter(Boolean)
    .map((value) => value.toLowerCase());

  return haystacks.some((text) => text.includes(query));
}

function matchesKeywords(product: Product, filters?: GoodsWhereInput): boolean {
  if (!filters?.keywords?.length) {
    return true;
  }

  const backendKeywords = new Set((product.backend?.keywords || []).map((keyword) => keyword.toLowerCase()));

  return filters.keywords.some((keyword) => backendKeywords.has(keyword.toLowerCase()));
}

function filterGoods(products: Product[], filters?: GoodsWhereInput) {
  return products.filter(
    (product) => matchesCategory(product, filters) && matchesSearch(product, filters) && matchesKeywords(product, filters),
  );
}

function resolveSort(order?: GoodsListQuery["order"]): SortKey {
  if (order === undefined || order === null) {
    return "relevance";
  }

  if (typeof order === "number") {
    switch (order) {
      case 2:
        return "popular";
      case 3:
        return "latest";
      case 4:
        return "price_asc";
      case 5:
        return "price_desc";
      default:
        return "relevance";
    }
  }

  const normalized = `${order}`.trim().toLowerCase();

  switch (normalized) {
    case "2":
    case "popular":
      return "popular";
    case "3":
    case "latest":
      return "latest";
    case "4":
    case "price_asc":
    case "asc":
      return "price_asc";
    case "5":
    case "price_desc":
    case "desc":
      return "price_desc";
    default:
      return "relevance";
  }
}

function getPriceValue(product: Product): number {
  const price = Number(product.priceRange?.minVariantPrice.amount);
  return Number.isNaN(price) ? 0 : price;
}

function getRankValue(product: Product): number {
  return goodsProductRankMap.get(product.handle) ?? 999;
}

function computeRelevanceScore(product: Product, filters?: GoodsWhereInput): number {
  if (!filters?.searchName) {
    return 0;
  }

  const query = filters.searchName.trim().toLowerCase();
  if (!query) {
    return 0;
  }

  let score = 0;
  const backend = product.backend;

  if (product.title.toLowerCase().includes(query)) {
    score += 5;
  }

  if (product.description?.toLowerCase().includes(query)) {
    score += 3;
  }

  if (backend?.jpName?.toLowerCase().includes(query)) {
    score += 4;
  }

  if (backend?.keywords?.some((keyword) => keyword.toLowerCase().includes(query))) {
    score += 2;
  }

  if (backend?.brand?.toLowerCase().includes(query)) {
    score += 1;
  }

  return score;
}

function sortGoods(products: Product[], sortKey: SortKey, filters?: GoodsWhereInput) {
  const sorted = [...products];

  switch (sortKey) {
    case "price_asc":
      sorted.sort((a, b) => getPriceValue(a) - getPriceValue(b));
      break;
    case "price_desc":
      sorted.sort((a, b) => getPriceValue(b) - getPriceValue(a));
      break;
    case "latest":
      sorted.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
      break;
    case "popular":
      sorted.sort((a, b) => getRankValue(a) - getRankValue(b));
      break;
    case "relevance":
    default:
      sorted.sort((a, b) => computeRelevanceScore(b, filters) - computeRelevanceScore(a, filters));
      if (!filters?.searchName) {
        sorted.sort((a, b) => getRankValue(a) - getRankValue(b));
      }
      break;
  }

  return sorted;
}

function paginateGoods(products: Product[], page: number, limit: number): GoodsListResult {
  const total = products.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;
  const end = start + limit;
  const items = products.slice(start, end).map(mapToGoodsListItem);

  return {
    items,
    pageInfo: {
      page: currentPage,
      limit,
      total,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
}

export function mockGetAllGoodsCategories(): BackendApiResponse<GoodsCategory[]> {
  return createResponse(goodsCategories);
}

export function mockGetGoodsPageList(
  query: GoodsListQuery = {},
): BackendApiResponse<GoodsListResult> {
  const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE;
  const limit = query.limit && query.limit > 0 ? query.limit : DEFAULT_LIMIT;
  const filters = sanitizeWhereInput(query.where);
  const sortKey = resolveSort(query.order);

  const filtered = filterGoods(goodsProducts, filters);
  const sorted = sortGoods(filtered, sortKey, filters);
  const result = paginateGoods(sorted, page, limit);

  return createResponse(result);
}

export function mockGetGoodsDetail(id: number): BackendApiResponse<GoodsDetail | null> {
  const product = goodsProductMapByBackendId.get(id);

  if (!product) {
    return createErrorResponse("商品不存在", 404, null);
  }

  const detail: GoodsDetail = {
    ...mapToGoodsListItem(product),
    detailHtml: product.descriptionHtml,
    longDescription: product.description,
    usageNotes: "遵循院内医生或药师给出的个性化疗程安排，以确保疗效稳定。",
    cautionNotes: "请在专业医生指导下完成全程用药评估，并如实告知既往病史。",
    storageNotes: "请根据包装提示储存，避免阳光直射，冷链产品全程低温运输。",
  };

  return createResponse(detail);
}

type ProductInfoInput = {
  id: number;
  type?: string;
  groupId?: number;
};

export function mockGetProductInfo(
  input: ProductInfoInput,
): BackendApiResponse<ProductVariant | null> {
  const target = goodsVariantsByObjectId.get(input.id);

  if (!target) {
    return createErrorResponse("货品不存在", 404, null);
  }

  return createResponse(target.variant);
}

export function mockGetGoodsRecommendList(
  params: { id?: number; data?: string } = {},
): BackendApiResponse<Product[]> {
  const excludedId = params.id;
  const candidates = goodsProducts.filter((product) => product.backend?.productId !== excludedId);
  const items = candidates.slice(0, 4);
  return createResponse(items);
}

export function findGoodsProductByHandle(handle: string): Product | undefined {
  return goodsProductMapByHandle.get(handle);
}

export function findGoodsProductByBackendId(id: number): Product | undefined {
  return goodsProductMapByBackendId.get(id);
}

export function findGoodsProductByInternalId(id: string): Product | undefined {
  return goodsProducts.find((product) => product.id === id);
}

export function findGoodsVariantByObjectId(objectId: number) {
  return goodsVariantsByObjectId.get(objectId);
}
