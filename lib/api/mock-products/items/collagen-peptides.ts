import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
    "胶原蛋白肽粉",
  ),
  images: [
    buildFeaturedImage(
      "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80",
      "胶原蛋白包装",
    ),
  ],
  seo: {
    title: "胶原蛋白肽粉",
    description: "小分子胶原蛋白，支持皮肤与关节健康。",
  },
  tags: ["beauty", "skin-support"],
  updatedAt: `${thisYear}-05-08T09:00:00.000Z`,
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.BEAUTY_NUTRITION,
  ],
  bestsellerRank: 4,
};

export default product;
