import type {
  CurrencyCode,
  GoodsCategory,
  Money,
  Product,
  ProductVariant,
} from "./types";

type RawGoodsRecord = {
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
  {
    id: 3085002,
    parentId: HOSPITAL_CATEGORY_ID,
    name: "サプリ",
    jpName: "サプリメント",
    enName: "Supplements",
    sort: 28,
    slug: "supplement",
    imageUrl: "/static/images/common/empty.png",
    child: null,
  },
  {
    id: 3085003,
    parentId: HOSPITAL_CATEGORY_ID,
    name: "贩卖预定",
    jpName: "販売予定",
    enName: "Pre-sale",
    sort: 26,
    slug: "pre-sale",
    imageUrl: "/static/images/common/empty.png",
    child: null,
  },
  {
    id: 3085004,
    parentId: HOSPITAL_CATEGORY_ID,
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
    child: [
      {
        id: 2092,
        name: "高血压",
        jpName: "高血圧",
        enName: "Hypertension",
        sort: 20,
        imageUrl: "/static/images/common/empty.png",
        slug: "hypertension",
        parentId: 2088,
        child: null,
      },
      {
        id: 2095,
        name: "抗生素",
        jpName: "抗生物質",
        enName: "Antibiotics",
        sort: 19,
        imageUrl: "/static/images/common/empty.png",
        slug: "antibiotics",
        parentId: 2088,
        child: null,
      },
      {
        id: 2091,
        name: "外皮用药",
        jpName: "外皮用薬",
        enName: "Topical medication",
        sort: 18,
        imageUrl: "/static/images/common/empty.png",
        slug: "topical",
        parentId: 2088,
        child: null,
      },
      {
        id: 2101,
        name: "高胆固醇",
        jpName: "高コレステロール",
        enName: "High Cholesterol",
        sort: 17,
        imageUrl: "/static/images/common/empty.png",
        slug: "cholesterol",
        parentId: 2088,
        child: null,
      },
      {
        id: 2103,
        name: "其他",
        jpName: "その他",
        enName: "Other",
        sort: 16,
        imageUrl: "/static/images/common/empty.png",
        slug: "other-rx",
        parentId: 2088,
        child: null,
      },
    ],
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
    child: null,
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
    child: null,
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

const rawGoodsRecords: RawGoodsRecord[] = [
  {
    productId: 960001,
    slug: "nad-plus-100mg",
    title: "CyTIX 日本诊所院线用 高浓度高纯NAD+ 逆龄抗衰点滴 (100mg)",
    jpName: "NAD+ 100mg",
    brand: "CyTIX",
    spec: "100mg/瓶",
    priceJpy: 70000,
    priceCny: 3290,
    notes: "冷藏",
    effects: "缓解疲劳，睡眠改善，提高代谢，改善视力",
    keywords: ["日本抗衰点滴", "提升代谢", "改善睡眠"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085001,
    subCategoryName: "点滴",
    image: {
      src: "/product-images/nad-plus-100mg.png",
      alt: "CyTIX 高纯度 NAD+ 逆龄抗衰点滴 (100mg)",
    },
    collectionHandles: ["hospital-preparation", "featured"],
    rank: 1,
  },
  {
    productId: 960002,
    slug: "nmn-drip-150mg",
    title: "CyTIX 日本诊所院线用 高浓度高纯NMN 强效抗衰点滴 (150mg)",
    jpName: "NMN 150mg",
    brand: "CyTIX",
    spec: "150mg/瓶",
    priceJpy: 36000,
    priceCny: 1692,
    notes: "冷藏",
    effects: "缓解疲劳，睡眠改善，提高代谢，改善视力",
    keywords: ["日本抗衰点滴", "缓解疲劳", "修复"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085001,
    subCategoryName: "点滴",
    image: {
      src: "/product-images/nmn-150mg.jpg",
      alt: "CyTIX 高纯度 NMN 点滴 (150mg)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 2,
  },
  {
    productId: 960003,
    slug: "nmn-drip-250mg",
    title: "CyTIX 日本诊所院线用 高浓度高纯NMN 强效抗衰点滴 (250mg)",
    jpName: "NMN 250mg",
    brand: "CyTIX",
    spec: "250mg/瓶",
    priceJpy: 60000,
    priceCny: 2820,
    notes: "冷藏",
    effects: "缓解疲劳，睡眠改善，提高代谢，改善视力",
    keywords: ["日本抗衰点滴", "缓解疲劳", "修复"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085001,
    subCategoryName: "点滴",
    image: {
      src: "/product-images/nmn-250mg.jpg",
      alt: "CyTIX 高纯度 NMN 点滴 (250mg)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 3,
  },
  {
    productId: 960004,
    slug: "wjexo-5ml",
    title: "CyTIX 日本诊所院线用 WJexo 脐带由来外泌体免疫激活点滴（5ml）",
    jpName: "Wjexo 5ml",
    brand: "CyTIX",
    spec: "5ml/瓶",
    priceJpy: 200000,
    priceCny: 9400,
    notes: "冷凍",
    effects: "免疫力提升，抑制炎症，睡眠改善，活跃干细胞",
    keywords: ["激活干细胞", "抑制炎症", "免疫力提升"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085001,
    subCategoryName: "点滴",
    image: {
      src: "/product-images/wjexo-5ml.jpg",
      alt: "CyTIX WJexo 外泌体免疫激活点滴",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 4,
  },
  {
    productId: 960005,
    slug: "cytokine-injection",
    title: "CyTIX 日本诊所院线用 细胞免疫赋能因子 免疫再生注射剂 (0.3ml)",
    jpName: "サイトカイン注射",
    brand: "CyTIX",
    spec: "0.3ml/瓶",
    priceJpy: 300000,
    priceCny: 14100,
    notes: "冷凍",
    effects: "免疫力增强，促进免疫细胞再生",
    keywords: ["抗炎", "激活干细胞", "抗衰"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085001,
    subCategoryName: "点滴",
    image: {
      src: "/product-images/cytokine-injection.png",
      alt: "CyTIX 细胞免疫赋能因子注射剂",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 5,
  },
  {
    productId: 960006,
    slug: "nmn-supplement-60",
    title: "CyTIX NMN 日本诊所院线用 逆龄焕肤口服胶囊 (60粒装)",
    jpName: "NMN サプリ 60粒",
    brand: "AL",
    spec: "60粒/袋",
    priceJpy: 30000,
    priceCny: 1410,
    effects: "提高代谢，睡眠改善，肤质/发质改善",
    keywords: ["改善肤质", "助眠"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085002,
    subCategoryName: "サプリ",
    image: {
      src: "/product-images/nmn-supplement-60.png",
      alt: "CyTIX NMN 逆龄焕肤口服胶囊 (60粒)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 6,
  },
  {
    productId: 960007,
    slug: "nmn-supplement-120",
    title: "AL Clinic NMN 日本诊所出品 逆龄焕肤口服胶囊 (120粒 豪华装)",
    jpName: "NMN サプリ 120粒",
    brand: "AL",
    spec: "120粒/罐",
    priceJpy: 80000,
    priceCny: 3760,
    effects: "提高代谢，睡眠改善，肤质/发质改善",
    keywords: ["改善肤质", "助眠"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085002,
    subCategoryName: "サプリ",
    image: {
      src: "/product-images/nmn-supplement-120.png",
      alt: "AL Clinic NMN 豪华口服胶囊 (120粒)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 7,
  },
  {
    productId: 960008,
    slug: "ergo-supplement-60",
    title: "CyTIX 麦角硫因 日本诊所院线用 健脑护心口服胶囊 (60粒)",
    jpName: "エルゴサプリ 60粒",
    brand: "AL",
    spec: "60粒/袋",
    priceJpy: 30000,
    priceCny: 1410,
    effects: "预防细胞损伤，减轻心血管疾病的发病可能",
    keywords: ["麦角硫因", "心血管"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085002,
    subCategoryName: "サプリ",
    image: {
      src: "/product-images/ergo-supplement-60.png",
      alt: "CyTIX 麦角硫因 健脑护心胶囊 (60粒)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 8,
  },
  {
    productId: 960009,
    slug: "ergo-supplement-120",
    title: "AL Clinic 麦角硫因 日本诊所出品 健脑护心口服胶囊 (120粒 豪华装)",
    jpName: "エルゴサプリ 120粒",
    brand: "AL",
    spec: "120粒/罐",
    priceJpy: 80000,
    priceCny: 3760,
    effects: "预防细胞损伤，减轻心血管疾病的发病可能",
    keywords: ["麦角硫因", "心血管"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085002,
    subCategoryName: "サプリ",
    image: {
      src: "/product-images/ergo-supplement-120.png",
      alt: "AL Clinic 麦角硫因 健脑护心胶囊 (120粒)",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 9,
  },
  {
    productId: 960010,
    slug: "nmn-nasal-set-5",
    title: "CyTIX NMN 鼻喷套装 秒吸收 鼻炎神器 (5支装)",
    jpName: "NMN 点鼻セット 5set",
    brand: "AL",
    spec: "5支/箱",
    priceJpy: 32000,
    priceCny: 1504,
    effects: "缓解疲劳，睡眠改善，提高代谢，改善视力",
    keywords: ["快速吸收", "鼻炎神器"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085003,
    subCategoryName: "贩卖预定",
    image: {
      src: "/product-images/nmn-nasal-set-5.png",
      alt: "CyTIX NMN 鼻喷套装",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 10,
  },
  {
    productId: 960011,
    slug: "exo-skin-mask-1",
    title: "CyTIX 日本诊所院线用 修复抗UV面膜 (单片)",
    jpName: "Exo Skin Mask 1枚",
    brand: "CyTIX",
    spec: "1枚/袋",
    priceJpy: 7500,
    priceCny: 353,
    effects: "预防紫外线，含有25ml美容液",
    keywords: ["医用面膜", "防晒修复"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085004,
    subCategoryName: "化粧品",
    image: {
      src: "/product-images/exo-skin-mask-1.png",
      alt: "CyTIX 修复抗UV面膜",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 11,
  },
  {
    productId: 960012,
    slug: "kurepita-d-120",
    title: "CyTIX Kurebita D 缓冲肌酸 改良肌酸复合维生素D 不伤肝 强身口服胶囊",
    jpName: "クレピタD 120粒",
    brand: "CyTIX",
    spec: "120粒/袋",
    priceJpy: 18000,
    priceCny: 846,
    effects: "强身健体，缓解疲劳",
    keywords: ["维生素D", "复合维生素", "缓解疲劳", "强身健体"],
    categoryId: HOSPITAL_CATEGORY_ID,
    subCategoryId: 3085002,
    subCategoryName: "サプリ",
    image: {
      src: "/product-images/kurepita-d-120.png",
      alt: "CyTIX Kurebita D 复合维生素D 胶囊",
    },
    collectionHandles: ["hospital-preparation"],
    rank: 12,
  },
];

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
    id: `goods-${record.productId}`,
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
      categoryName: "院内制剂",
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
