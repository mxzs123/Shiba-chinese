import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1600&q=80",
    "钙片",
  ),
  images: [
    buildFeaturedImage(
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
  collections: [
    COLLECTION_HANDLES.SUPPLEMENTS,
    COLLECTION_HANDLES.BONE_JOINT,
  ],
  bestsellerRank: 5,
};

export default product;
