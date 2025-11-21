import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
    "叶黄素胶囊",
  ),
  images: [
    buildFeaturedImage(
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=1600&q=80",
      "叶黄素包装",
    ),
  ],
  seo: {
    title: "叶黄素护眼胶囊",
    description: "蓝光防护，缓解眼疲劳。",
  },
  tags: ["eye-health"],
  updatedAt: `${thisYear}-05-15T16:00:00.000Z`,
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.EYE_CARE,
    COLLECTION_HANDLES.HOME_FEATURED,
  ],
  bestsellerRank: 7,
};

export default product;
