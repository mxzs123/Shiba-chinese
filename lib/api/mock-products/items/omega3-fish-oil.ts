import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1600&q=80",
    "深海鱼油胶囊",
  ),
  images: [
    buildFeaturedImage(
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1600&q=80",
      "深海鱼油包装",
    ),
  ],
  seo: {
    title: "深海鱼油 Omega-3 胶囊",
    description: "高纯度EPA/DHA，支持心脑血管健康。",
  },
  tags: ["nutrition", "heart-health", "bestseller"],
  updatedAt: `${thisYear}-05-01T10:00:00.000Z`,
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.HEART_SUPPORT,
    COLLECTION_HANDLES.HOME_CAROUSEL,
  ],
  bestsellerRank: 2,
};

export default product;
