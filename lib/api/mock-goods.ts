import type {
  CurrencyCode,
  GoodsCategory,
  Money,
  Product,
  ProductVariant,
} from "./types";
import type { RawGoodsRecord } from "./mock-goods-types";
import mockGoodsItems from "./mock-goods-items";
import prescriptionSubcategories from "./mock-goods-prescription-subcategories.json";

const HOSPITAL_CATEGORY_ID = 2085;

const hospitalChildCategories: GoodsCategory[] = [
  {
    id: 3085001,
    parentId: HOSPITAL_CATEGORY_ID,
    name: "点滴",
    jpName: "点滴",
    enName: "Intravenous Therapy",
    sort: 30,
    slug: "drip",
    imageUrl: "/static/images/common/empty.png",
    child: null,
  },
];

const wellnessChildCategories: GoodsCategory[] = [
  {
    id: 3085002,
    parentId: 2086,
    name: "サプリ",
    jpName: "サプリメント",
    enName: "Supplements",
    sort: 28,
    slug: "supplement",
    imageUrl: "/static/images/common/empty.png",
    child: null,
  },
];

const beautyChildCategories: GoodsCategory[] = [
  {
    id: 3085004,
    parentId: 2047,
    name: "化粧品",
    jpName: "化粧品",
    enName: "Cosmetics",
    sort: 24,
    slug: "cosmetics",
    imageUrl: "/static/images/common/empty.png",
    child: null,
  },
];

export const goodsCategories: GoodsCategory[] = [
  {
    id: 2088,
    name: "处方药品",
    jpName: "処方薬品",
    enName: "Prescription drugs",
    sort: 200,
    imageUrl: "/static/images/common/empty.png",
    slug: "prescription",
    child: prescriptionSubcategories as GoodsCategory[],
  },
  {
    id: 2087,
    name: "非处方药品(OTC)",
    jpName: "非処方薬(OTC)",
    enName: "Over the Counter (OTC) drugs",
    sort: 198,
    imageUrl: "/static/images/common/empty.png",
    slug: "otc",
    child: null,
  },
  {
    id: 2086,
    name: "健康保健食品",
    jpName: "健康食品について",
    enName: "Health and wellness food",
    sort: 196,
    imageUrl: "/static/images/common/empty.png",
    slug: "wellness",
    child: wellnessChildCategories,
  },
  {
    id: HOSPITAL_CATEGORY_ID,
    name: "院内制剂",
    jpName: "院内製剤",
    enName: "Hospital preparations",
    sort: 194,
    imageUrl: "/static/images/common/empty.png",
    slug: "hospital",
    child: hospitalChildCategories,
  },
  {
    id: 2047,
    name: "美妆护肤",
    jpName: "スキンケア",
    enName: "Beauty and Skincare",
    sort: 192,
    imageUrl: "/static/images/common/empty.png",
    slug: "beauty",
    child: beautyChildCategories,
  },
  {
    id: 2084,
    name: "生活用品",
    jpName: "生活用品",
    enName: "Daily necessities",
    sort: 190,
    imageUrl: "/static/images/common/empty.png",
    slug: "lifestyle",
    child: null,
  },
  {
    id: 2093,
    name: "其他",
    jpName: "その他",
    enName: "Other",
    sort: 188,
    imageUrl: "/static/images/common/empty.png",
    slug: "misc",
    child: [
      {
        id: 2094,
        name: "其他",
        jpName: "その他",
        enName: "Other",
        sort: 1,
        imageUrl: "/static/images/common/empty.png",
        slug: "misc-other",
        parentId: 2093,
        child: null,
      },
    ],
  },
];

const rawGoodsRecords: RawGoodsRecord[] = mockGoodsItems;

const DEFAULT_JPY_CURRENCY: CurrencyCode = "JPY";

function toMoney(
  amount: number,
  currencyCode: CurrencyCode,
  fractionDigits = 0,
): Money {
  return {
    amount: amount.toFixed(fractionDigits),
    currencyCode,
  };
}

function buildVariantId(slug: string) {
  return `goods-var-${slug}`;
}

function createProductFromRecord(record: RawGoodsRecord): Product {
  const priceMoney = toMoney(record.priceJpy, DEFAULT_JPY_CURRENCY);
  const priceCny = toMoney(record.priceCny, "CNY", 2);
  const now = new Date();
  const updatedAt = new Date(
    now.getTime() - record.rank * 86400000,
  ).toISOString();
  const variantId = buildVariantId(record.slug);

  const variant: ProductVariant = {
    id: variantId,
    title: record.spec,
    availableForSale: true,
    selectedOptions: [{ name: "规格", value: record.spec }],
    price: { ...priceMoney },
    backend: {
      productId: record.productId,
      objectId: record.productId * 10 + 1,
      type: 0,
      cartType: 0,
      groupId: record.productId * 100,
      skuCode: `${record.productId}-STD`,
    },
  };

  const detailTags = [
    `detail:jp_name=${record.jpName}`,
    `detail:manufacturer=${record.brand}`,
    "detail:seller=芝园诊所",
    `detail:content_volume=${record.spec}`,
  ];

  if (record.notes) {
    detailTags.push(`detail:storage=${record.notes}`);
  }

  const guidelineTags = [
    "guideline:usage=请在专业医生或药师指导下使用，遵循个性化疗程建议。",
    "guideline:caution=孕期、哺乳期或有慢性疾病人群请提前咨询医生后再使用。",
    "guideline:storage=置于阴凉干燥处，避免阳光直射，并远离儿童触及。",
  ];

  const keywordTags = record.keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .map((keyword) => `keyword:${keyword}`);

  const tags = [...detailTags, ...guidelineTags, ...keywordTags];

  const descriptionParts = [`<p>${record.effects}</p>`];

  if (record.notes) {
    descriptionParts.push(`<p>储存建议：${record.notes}</p>`);
  }

  return {
    id: `goods-${record.slug}`,
    handle: record.slug,
    availableForSale: true,
    title: record.title,
    description: record.effects,
    descriptionHtml: descriptionParts.join(""),
    options: [
      {
        id: `goods-opt-${record.slug}`,
        name: "规格",
        values: [record.spec],
      },
    ],
    priceRange: {
      minVariantPrice: { ...priceMoney },
      maxVariantPrice: { ...priceMoney },
      minCompareAtPrice: null,
      maxCompareAtPrice: null,
    },
    variants: [variant],
    featuredImage: {
      url: record.image.src,
      altText: record.image.alt,
      width: 1200,
      height: 1200,
    },
    images: [
      {
        url: record.image.src,
        altText: record.image.alt,
        width: 1200,
        height: 1200,
      },
    ],
    seo: {
      title: record.title,
      description: record.effects,
    },
    tags,
    updatedAt,
    backend: {
      productId: record.productId,
      brand: record.brand,
      categoryId: record.categoryId,
      categoryName:
        goodsCategories.find((c) => c.id === record.categoryId)?.name ||
        "未知分类",
      subCategoryId: record.subCategoryId,
      subCategoryName: record.subCategoryName,
      searchName: record.title,
      jpName: record.jpName,
      spec: record.spec,
      keywords: record.keywords,
      priceJpy: { ...priceMoney },
      priceCny,
      status: "available",
    },
  };
}

export const goodsProducts: Product[] = rawGoodsRecords.map(
  createProductFromRecord,
);

export const goodsProductMapByHandle = new Map(
  goodsProducts.map((product) => [product.handle, product]),
);

export const goodsProductMapByBackendId = new Map(
  goodsProducts
    .filter((product) => typeof product.backend?.productId === "number")
    .map((product) => [product.backend!.productId!, product]),
);

export const goodsVariantsByObjectId = new Map(
  goodsProducts.flatMap((product) =>
    product.variants
      .filter((variant) => typeof variant.backend?.objectId === "number")
      .map((variant) => [variant.backend!.objectId!, { product, variant }]),
  ),
);

export const goodsCollectionHandles = new Map(
  rawGoodsRecords.map((record) => [
    record.slug,
    record.collectionHandles || [],
  ]),
);

export const goodsProductRankMap = new Map(
  rawGoodsRecords.map((record) => [record.slug, record.rank]),
);

export { HOSPITAL_CATEGORY_ID };
