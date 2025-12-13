import { defaultCurrency } from "../../mock-checkout";
import { thisYear } from "../../mock-shared";

import { COLLECTION_HANDLES } from "../handles";
import { buildFeaturedImage } from "../helpers";
import type { ProductRecord } from "../types";

const product: ProductRecord = {
  id: "prod-adhd-medication",
  handle: "adhd-focus-prescription",
  availableForSale: true,
  title: "专注力调节处方药 30 粒",
  description:
    "用于缓解成人注意力缺陷与多动症状的处方药，仅限经医生诊断后使用。",
  descriptionHtml: "<p>处方药信息仅供参考，请在执业医师指导下合理用药。</p>",
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
  featuredImage: buildFeaturedImage(
    "https://images.unsplash.com/photo-1582719478148-9fffe0c0f6f3?auto=format&fit=crop&w=1600&q=80",
    "专注力调节处方药",
  ),
  images: [
    buildFeaturedImage(
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
  collections: [
    COLLECTION_HANDLES.PHARMACY,
    COLLECTION_HANDLES.HOME_FEATURED,
    COLLECTION_HANDLES.HOME_CAROUSEL,
  ],
  bestsellerRank: 1,
};

export default product;
