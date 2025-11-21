import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
  id: "prod-coq10",
  handle: "coq10-capsules",
  availableForSale: true,
  title: "辅酶Q10 软胶囊",
  description: "支持心脏健康与细胞能量代谢，抗氧化配方。",
  descriptionHtml: "<p>每粒含100mg辅酶Q10，采用油溶性配方提高生物利用度。</p>",
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1550572017-4e6dbce0f44f?auto=format&fit=crop&w=1600&q=80",
    "辅酶Q10",
  ),
  images: [
    buildFeaturedImage(
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
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.HEART_SUPPORT,
  ],
  bestsellerRank: 6,
};

export default product;
