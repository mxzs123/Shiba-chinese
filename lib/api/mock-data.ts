import { Collection, Menu, Page, Product } from "./types";

type ProductRecord = Product & {
  collections: string[];
  bestsellerRank: number;
};

type CollectionRecord = Collection & {
  isHidden?: boolean;
};

const CURRENCY = "CNY";
const CHECKOUT_FALLBACK = "/checkout";

const now = new Date();
const thisYear = now.getFullYear();

const featuredImage = (url: string, altText: string) => ({
  url,
  altText,
  width: 1600,
  height: 1600,
});

export const products: ProductRecord[] = [
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
      minVariantPrice: { amount: "68", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "96", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-matcha-2",
        title: "2 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "2 杯装" }],
        price: { amount: "68", currencyCode: CURRENCY },
      },
      {
        id: "var-matcha-4",
        title: "4 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "4 杯装" }],
        price: { amount: "96", currencyCode: CURRENCY },
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
      minVariantPrice: { amount: "48", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "78", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-herbal-12",
        title: "12 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "12 袋" }],
        price: { amount: "48", currencyCode: CURRENCY },
      },
      {
        id: "var-herbal-24",
        title: "24 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "24 袋" }],
        price: { amount: "78", currencyCode: CURRENCY },
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
      minVariantPrice: { amount: "88", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "88", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-vitamin-citrus",
        title: "柑橘",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "柑橘" }],
        price: { amount: "88", currencyCode: CURRENCY },
      },
      {
        id: "var-vitamin-berry",
        title: "莓果",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "莓果" }],
        price: { amount: "88", currencyCode: CURRENCY },
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
      minVariantPrice: { amount: "128", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "138", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-bottle-grey",
        title: "云灰",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "云灰" }],
        price: { amount: "128", currencyCode: CURRENCY },
      },
      {
        id: "var-bottle-blue",
        title: "湖蓝",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "湖蓝" }],
        price: { amount: "138", currencyCode: CURRENCY },
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
];

export const collections: CollectionRecord[] = [
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

export const pages: Page[] = [
  {
    id: "page-about",
    title: "品牌故事",
    handle: "about",
    body: "# 关于芝园药局\n\n我们与多家日本制造工厂合作，将轻配方饮品与健康补给带到中国市场。",
    bodySummary: "关于品牌的介绍页。",
    seo: {
      title: "关于芝园药局",
      description: "了解我们的理念与产品溯源",
    },
    createdAt: `${thisYear}-01-01T00:00:00.000Z`,
    updatedAt: `${thisYear}-03-12T10:00:00.000Z`,
  },
  {
    id: "page-faq",
    title: "常见问题",
    handle: "faq",
    body: "# 常见问题\n\n配送时效、退换货政策与客服联系方式。",
    bodySummary: "售后与咨询说明。",
    seo: {
      title: "常见问题",
      description: "了解配送、售后与客服信息",
    },
    createdAt: `${thisYear}-01-15T00:00:00.000Z`,
    updatedAt: `${thisYear}-02-20T08:00:00.000Z`,
  },
];

export const menus: Record<string, Menu[]> = {
  "next-js-frontend-header-menu": [
    { title: "全部商品", path: "/search" },
    { title: "冲泡饮品", path: "/search/beverage" },
    { title: "日常健康", path: "/search/wellness" },
    { title: "生活器具", path: "/search/accessories" },
    { title: "品牌故事", path: "/page/about" },
  ],
  "next-js-frontend-footer-menu": [
    { title: "配送与退换", path: "/page/faq" },
    { title: "联系我们", path: "mailto:hello@example.com" },
    { title: "隐私政策", path: "/page/faq" },
  ],
};

export const checkoutUrl = CHECKOUT_FALLBACK;
export const defaultCurrency = CURRENCY;

export function findVariantById(variantId: string) {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      return {
        product,
        variant,
      };
    }
  }

  return undefined;
}

export function findProductByHandle(handle: string) {
  return products.find((product) => product.handle === handle);
}

export function findCollectionByHandle(handle: string) {
  return collections.find((collection) => collection.handle === handle);
}

export function listVisibleCollections() {
  return collections.filter((collection) => !collection.isHidden);
}
