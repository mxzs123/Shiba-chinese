import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1600&q=80",
    "益生菌胶囊",
  ),
  images: [
    buildFeaturedImage(
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1600&q=80",
      "益生菌包装",
    ),
  ],
  seo: {
    title: "复合益生菌胶囊",
    description: "10种活性菌株，改善肠道健康。",
  },
  tags: ["gut-health", "digestion"],
  updatedAt: `${thisYear}-05-05T11:00:00.000Z`,
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.GUT_HEALTH,
    COLLECTION_HANDLES.HOME_FEATURED,
  ],
  bestsellerRank: 3,
};

export default product;
