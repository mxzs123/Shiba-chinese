import { thisYear } from "./mock-shared";
import type { Collection, Product } from "./types";
import { defaultCurrency } from "./mock-checkout";

export type ProductRecord = Product & {
  collections: string[];
  bestsellerRank: number;
};

export type CollectionRecord = Collection & {
  isHidden?: boolean;
};

const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholders/product-1.svg";

const PLACEHOLDER_IMAGE_PATHS: string[] = [
  DEFAULT_PLACEHOLDER_IMAGE,
  "/images/placeholders/product-2.svg",
  "/images/placeholders/product-3.svg",
  "/images/placeholders/product-4.svg",
  "/images/placeholders/product-5.svg",
  "/images/placeholders/product-6.svg",
];

let placeholderPointer = 0;
const placeholderMap = new Map<string, string>();

export function getPlaceholderFor(source: string) {
  if (!source || source.startsWith("/")) {
    return source || DEFAULT_PLACEHOLDER_IMAGE;
  }

  const existing = placeholderMap.get(source);
  if (existing) {
    return existing;
  }

  const assignedIndex =
    PLACEHOLDER_IMAGE_PATHS.length === 0
      ? 0
      : placeholderPointer % PLACEHOLDER_IMAGE_PATHS.length;
  const assigned =
    PLACEHOLDER_IMAGE_PATHS[assignedIndex] || DEFAULT_PLACEHOLDER_IMAGE;
  placeholderPointer += 1;
  placeholderMap.set(source, assigned);
  return assigned;
}

export const featuredImage = (url: string, altText: string) => ({
  url: getPlaceholderFor(url),
  altText,
  width: 1600,
  height: 1600,
});

export const products: ProductRecord[] = [
  {
    id: "prod-adhd-medication",
    handle: "adhd-focus-prescription",
    availableForSale: true,
    title: "专注力调节处方药 30 粒",
    description:
      "用于缓解成人注意力缺陷与多动症状的处方药，仅限经医生诊断后使用。",
    descriptionHtml:
      "<p>处方药信息仅供演示使用，请在执业医师指导下合理用药。</p>",
    options: [
      {
        id: "opt-adhd-dosage",
        name: "剂量",
        values: ["18mg"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "399", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "399", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-adhd-18mg",
        title: "18mg",
        availableForSale: true,
        selectedOptions: [{ name: "剂量", value: "18mg" }],
        price: { amount: "399", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1582719478148-9fffe0c0f6f3?auto=format&fit=crop&w=1600&q=80",
      "专注力调节处方药",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1582719478148-9fffe0c0f6f3?auto=format&fit=crop&w=1600&q=80",
        "专注力调节处方药包装图",
      ),
    ],
    seo: {
      title: "专注力调节处方药 30 粒",
      description: "ADHD 专用处方药，仅限凭处方购买。",
    },
    tags: ["prescription", "rx:adhd"],
    updatedAt: `${thisYear}-04-28T12:00:00.000Z`,
    collections: ["pharmacy"],
    bestsellerRank: 1,
  },
  {
    id: "prod-matcha-kit",
    handle: "matcha-latte-kit",
    availableForSale: true,
    title: "抹茶拿铁冲泡套装",
    description: "日式抹茶粉搭配燕麦奶与砂糖的基础套装，适合每日自制风味饮品。",
    descriptionHtml:
      "<p>精选宇治抹茶粉与低温烘焙燕麦奶粉，三分钟完成顺滑拿铁。套装附送咖啡师量勺与配方指南。</p>",
    options: [
      {
        id: "opt-matcha-size",
        name: "规格",
        values: ["2 杯装", "4 杯装"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "4500", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "4500", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "5200", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "5200", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-matcha-2",
        title: "2 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "2 杯装" }],
        price: { amount: "4500", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "5200", currencyCode: defaultCurrency },
      },
      {
        id: "var-matcha-4",
        title: "4 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "4 杯装" }],
        price: { amount: "4500", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "5200", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
      "抹茶拿铁冲泡套装",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
        "抹茶拿铁冲泡套装",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80",
        "抹茶冲泡细节",
      ),
    ],
    seo: {
      title: "抹茶拿铁冲泡套装",
      description: "宇治抹茶粉与燕麦奶组合，三分钟享受日式风味。",
    },
    tags: ["featured", "drink-kit"],
    updatedAt: `${thisYear}-01-15T09:00:00.000Z`,
    collections: [
      "hidden-homepage-featured-items",
      "hidden-homepage-carousel",
      "beverage",
    ],
    bestsellerRank: 1,
  },
  {
    id: "prod-herbal",
    handle: "herbal-relax-tea",
    availableForSale: true,
    title: "草本放松花茶",
    description: "薰衣草、菊花与柠檬草的轻盈组合，日间舒缓紧张情绪。",
    descriptionHtml:
      "<p>采用低温烘干的整片花材，天然散发草本香气。无咖啡因，可作为日常补水饮品。</p>",
    options: [
      {
        id: "opt-herbal-size",
        name: "包装",
        values: ["12 袋", "24 袋"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "48", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "78", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-herbal-12",
        title: "12 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "12 袋" }],
        price: { amount: "48", currencyCode: defaultCurrency },
      },
      {
        id: "var-herbal-24",
        title: "24 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "24 袋" }],
        price: { amount: "78", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1600&q=80",
      "草本放松花茶",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1600&q=80",
        "草本放松花茶包装",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1451743503519-47aed9b9c699?auto=format&fit=crop&w=1600&q=80",
        "草本花茶冲泡",
      ),
    ],
    seo: {
      title: "草本放松花茶",
      description: "无咖啡因花草茶，日间办公与夜间休息皆宜。",
    },
    tags: ["wellness", "herbal"],
    updatedAt: `${thisYear}-02-02T11:30:00.000Z`,
    collections: ["hidden-homepage-featured-items", "wellness", "seasonal"],
    bestsellerRank: 3,
  },
  {
    id: "prod-vitamin",
    handle: "vitamin-gummies",
    availableForSale: true,
    title: "每日维生素软糖",
    description: "基于天然果汁的综合维生素软糖，轻松补充日常所需。",
    descriptionHtml:
      "<p>含维生素 A/C/D/E 及锌，采用果胶基础配方，无人工色素。适合成年人及青少年。</p>",
    options: [
      {
        id: "opt-vitamin-flavor",
        name: "口味",
        values: ["柑橘", "莓果"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "88", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "88", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-vitamin-citrus",
        title: "柑橘",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "柑橘" }],
        price: { amount: "88", currencyCode: defaultCurrency },
      },
      {
        id: "var-vitamin-berry",
        title: "莓果",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "莓果" }],
        price: { amount: "88", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      "每日维生素软糖",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
        "每日维生素软糖",
      ),
    ],
    seo: {
      title: "每日维生素软糖",
      description: "营养补充的轻松选择，果汁风味更易坚持。",
    },
    tags: ["nutrition", "bestseller"],
    updatedAt: `${thisYear}-03-22T10:05:00.000Z`,
    collections: ["hidden-homepage-carousel", "wellness", "bestsellers"],
    bestsellerRank: 2,
  },
  {
    id: "prod-bottle",
    handle: "insulated-bottle",
    availableForSale: true,
    title: "真空不锈钢随行杯",
    description: "316 不锈钢双层真空结构，长效保温保冷，轻巧便携。",
    descriptionHtml:
      "<p>杯盖采用食品级硅胶密封圈，倒置不漏水。附赠茶漏，适合冲泡花茶或咖啡。</p>",
    options: [
      {
        id: "opt-bottle-color",
        name: "颜色",
        values: ["云灰", "湖蓝"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "128", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "138", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-bottle-grey",
        title: "云灰",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "云灰" }],
        price: { amount: "128", currencyCode: defaultCurrency },
      },
      {
        id: "var-bottle-blue",
        title: "湖蓝",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "湖蓝" }],
        price: { amount: "138", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80",
      "真空不锈钢随行杯",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80",
        "随行杯正面",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1526402468470-e0655142a49c?auto=format&fit=crop&w=1600&q=80",
        "随行杯生活场景",
      ),
    ],
    seo: {
      title: "真空不锈钢随行杯",
      description: "保温保冷兼备，附茶漏的轻便随行杯。",
    },
    tags: ["accessories"],
    updatedAt: `${thisYear}-04-12T08:20:00.000Z`,
    collections: [
      "hidden-homepage-featured-items",
      "hidden-homepage-carousel",
      "accessories",
    ],
    bestsellerRank: 4,
  },
  {
    id: "prod-omega3",
    handle: "omega3-fish-oil",
    availableForSale: true,
    title: "深海鱼油 Omega-3 胶囊",
    description: "高纯度EPA/DHA配方，支持心血管健康与大脑功能。",
    descriptionHtml:
      "<p>采用深海鱼类提取，经过分子蒸馏去除重金属，每粒含1000mg高浓度Omega-3。</p>",
    options: [
      {
        id: "opt-omega3-count",
        name: "规格",
        values: ["60粒"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "158", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "158", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "218", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "218", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-omega3-60",
        title: "60粒",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "60粒" }],
        price: { amount: "158", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "218", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1600&q=80",
      "深海鱼油胶囊",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1600&q=80",
        "深海鱼油包装",
      ),
    ],
    seo: {
      title: "深海鱼油 Omega-3 胶囊",
      description: "高纯度EPA/DHA，支持心脑血管健康。",
    },
    tags: ["nutrition", "bestseller"],
    updatedAt: `${thisYear}-05-01T10:00:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 5,
  },
  {
    id: "prod-probiotics",
    handle: "probiotics-capsules",
    availableForSale: true,
    title: "复合益生菌胶囊 30粒",
    description: "10种活性菌株，改善肠道菌群平衡，促进消化健康。",
    descriptionHtml:
      "<p>每粒含100亿CFU活性益生菌，采用耐酸包衣技术，确保菌株活着到达肠道。</p>",
    options: [
      {
        id: "opt-probiotics-count",
        name: "规格",
        values: ["30粒"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "128", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "128", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "168", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "168", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-probiotics-30",
        title: "30粒",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "30粒" }],
        price: { amount: "128", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "168", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1600&q=80",
      "益生菌胶囊",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1600&q=80",
        "益生菌包装",
      ),
    ],
    seo: {
      title: "复合益生菌胶囊",
      description: "10种活性菌株，改善肠道健康。",
    },
    tags: ["wellness", "digestion"],
    updatedAt: `${thisYear}-05-05T11:00:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 6,
  },
  {
    id: "prod-collagen",
    handle: "collagen-peptides",
    availableForSale: true,
    title: "胶原蛋白肽粉 200g",
    description: "小分子胶原蛋白肽，支持皮肤弹性与关节健康。",
    descriptionHtml:
      "<p>采用深海鱼皮提取，平均分子量2000道尔顿，易于人体吸收利用。</p>",
    options: [
      {
        id: "opt-collagen-size",
        name: "规格",
        values: ["200g"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "198", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "198", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "268", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "268", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-collagen-200",
        title: "200g",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "200g" }],
        price: { amount: "198", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "268", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
      "胶原蛋白肽粉",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
        "胶原蛋白包装",
      ),
    ],
    seo: {
      title: "胶原蛋白肽粉",
      description: "小分子胶原蛋白，支持皮肤与关节健康。",
    },
    tags: ["beauty", "wellness"],
    updatedAt: `${thisYear}-05-08T09:00:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 7,
  },
  {
    id: "prod-calcium",
    handle: "calcium-vitamin-d",
    availableForSale: true,
    title: "钙+维生素D3 片剂",
    description: "高效补钙配方，添加维生素D3促进钙吸收。",
    descriptionHtml:
      "<p>每片含钙600mg与维生素D3 400IU，适合需要补钙的成年人与老年人。</p>",
    options: [
      {
        id: "opt-calcium-count",
        name: "规格",
        values: ["60片"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "78", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "78", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "108", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "108", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-calcium-60",
        title: "60片",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "60片" }],
        price: { amount: "78", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "108", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=80",
      "钙片",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=80",
        "钙片包装",
      ),
    ],
    seo: {
      title: "钙+维生素D3片剂",
      description: "高效补钙，添加维生素D3促进吸收。",
    },
    tags: ["nutrition", "bone-health"],
    updatedAt: `${thisYear}-05-10T10:30:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 8,
  },
  {
    id: "prod-coq10",
    handle: "coq10-capsules",
    availableForSale: true,
    title: "辅酶Q10 软胶囊",
    description: "支持心脏健康与细胞能量代谢，抗氧化配方。",
    descriptionHtml:
      "<p>每粒含100mg辅酶Q10，采用油溶性配方提高生物利用度。</p>",
    options: [
      {
        id: "opt-coq10-count",
        name: "规格",
        values: ["60粒"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "168", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "168", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "228", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "228", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-coq10-60",
        title: "60粒",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "60粒" }],
        price: { amount: "168", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "228", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1550572017-4e6dbce0f44f?auto=format&fit=crop&w=1600&q=80",
      "辅酶Q10",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1550572017-4e6dbce0f44f?auto=format&fit=crop&w=1600&q=80",
        "辅酶Q10包装",
      ),
    ],
    seo: {
      title: "辅酶Q10软胶囊",
      description: "支持心脏健康与能量代谢。",
    },
    tags: ["heart-health", "antioxidant"],
    updatedAt: `${thisYear}-05-12T14:00:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 9,
  },
  {
    id: "prod-lutein",
    handle: "lutein-eye-health",
    availableForSale: true,
    title: "叶黄素护眼胶囊",
    description: "蓝光防护配方，缓解眼睛疲劳，支持视网膜健康。",
    descriptionHtml:
      "<p>每粒含叶黄素20mg与玉米黄质4mg，特别适合长时间用眼人群。</p>",
    options: [
      {
        id: "opt-lutein-count",
        name: "规格",
        values: ["60粒"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "138", currencyCode: defaultCurrency },
      maxVariantPrice: { amount: "138", currencyCode: defaultCurrency },
      minCompareAtPrice: { amount: "188", currencyCode: defaultCurrency },
      maxCompareAtPrice: { amount: "188", currencyCode: defaultCurrency },
    },
    variants: [
      {
        id: "var-lutein-60",
        title: "60粒",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "60粒" }],
        price: { amount: "138", currencyCode: defaultCurrency },
        compareAtPrice: { amount: "188", currencyCode: defaultCurrency },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
      "叶黄素胶囊",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
        "叶黄素包装",
      ),
    ],
    seo: {
      title: "叶黄素护眼胶囊",
      description: "蓝光防护，缓解眼疲劳。",
    },
    tags: ["eye-health", "wellness"],
    updatedAt: `${thisYear}-05-15T16:00:00.000Z`,
    collections: ["pharmacy", "wellness"],
    bestsellerRank: 10,
  },
];

export const collections: CollectionRecord[] = [
  {
    handle: "pharmacy",
    title: "处方药专区",
    description: "仅限凭处方购买的专属药品与用药指导问卷。",
    seo: {
      title: "处方药专区",
      description: "严选处方药品，需完成合规问卷后发货。",
    },
    updatedAt: `${thisYear}-04-20T00:00:00.000Z`,
    path: "/search/pharmacy",
  },
  {
    handle: "hidden-homepage-featured-items",
    title: "主页推荐",
    description: "用于首页三格展示的精选商品。",
    seo: {
      title: "主页推荐",
      description: "精选商品快速浏览",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
  },
  {
    handle: "hidden-homepage-carousel",
    title: "轮播精选",
    description: "首页轮播使用的隐藏集合。",
    seo: {
      title: "轮播精选",
      description: "首页轮播展示的商品",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
  },
  {
    handle: "beverage",
    title: "冲泡饮品",
    description: "风味饮品与冲泡套装。",
    seo: {
      title: "冲泡饮品",
      description: "好喝又好做的饮品解决方案",
    },
    updatedAt: `${thisYear}-01-20T00:00:00.000Z`,
    path: "/search/beverage",
  },
  {
    handle: "wellness",
    title: "日常健康",
    description: "补给、调理与放松类产品。",
    seo: {
      title: "日常健康",
      description: "让身体恢复平衡的精选产品",
    },
    updatedAt: `${thisYear}-02-10T00:00:00.000Z`,
    path: "/search/wellness",
  },
  {
    handle: "accessories",
    title: "生活器具",
    description: "随行杯、量具等配件。",
    seo: {
      title: "生活器具",
      description: "让冲泡更简单的生活配件",
    },
    updatedAt: `${thisYear}-03-05T00:00:00.000Z`,
    path: "/search/accessories",
  },
];

export function findProductByHandle(handle: string) {
  return products.find((product) => product.handle === handle);
}

export function findCollectionByHandle(handle: string) {
  return collections.find((collection) => collection.handle === handle);
}

export function listVisibleCollections() {
  return collections.filter((collection) => !collection.isHidden);
}
