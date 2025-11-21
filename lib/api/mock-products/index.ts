import { thisYear } from "../mock-shared";

import { COLLECTION_HANDLES } from "./handles";
import type { CollectionRecord, ProductRecord } from "./types";
import adhdFocusPrescription from "./items/adhd-focus-prescription";
import calciumVitaminD from "./items/calcium-vitamin-d";
import collagenPeptides from "./items/collagen-peptides";
import coq10Capsules from "./items/coq10-capsules";
import luteinEyeHealth from "./items/lutein-eye-health";
import omega3FishOil from "./items/omega3-fish-oil";
import probioticsCapsules from "./items/probiotics-capsules";

export type { ProductRecord, CollectionRecord } from "./types";
export { getPlaceholderFor } from "./helpers";

const productEntries: ProductRecord[] = [
  adhdFocusPrescription,
  omega3FishOil,
  probioticsCapsules,
  collagenPeptides,
  calciumVitaminD,
  coq10Capsules,
  luteinEyeHealth,
];

export const products: ProductRecord[] = [...productEntries].sort(
  (a, b) => a.bestsellerRank - b.bestsellerRank,
);

export const collections: CollectionRecord[] = [
  {
    handle: COLLECTION_HANDLES.PHARMACY,
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
    handle: COLLECTION_HANDLES.SUPPLEMENTS,
    title: "营养保健",
    description: "维生素、鱼油与益生菌等常见养护方案。",
    seo: {
      title: "营养保健",
      description: "补充日常所需营养，建立健康基础。",
    },
    updatedAt: `${thisYear}-04-22T00:00:00.000Z`,
    path: "/search/supplements",
  },
  {
    handle: COLLECTION_HANDLES.HEART_SUPPORT,
    title: "心血管守护",
    description: "针对心血管健康的营养补充方案。",
    seo: {
      title: "心血管守护",
      description: "鱼油、辅酶 Q10 等热门心血管方案。",
    },
    updatedAt: `${thisYear}-04-24T00:00:00.000Z`,
    path: "/search/heart-support",
  },
  {
    handle: COLLECTION_HANDLES.GUT_HEALTH,
    title: "肠道调理",
    description: "益生菌与消化支持，帮助改善肠道菌群。",
    seo: {
      title: "肠道调理",
      description: "精选高活性益生菌，呵护消化系统。",
    },
    updatedAt: `${thisYear}-04-25T00:00:00.000Z`,
    path: "/search/gut-health",
  },
  {
    handle: COLLECTION_HANDLES.BEAUTY_NUTRITION,
    title: "美肌内调",
    description: "胶原肽等营养补充，支持皮肤与关节状态。",
    seo: {
      title: "美肌内调",
      description: "聚焦皮肤修护与弹性维护的补给方案。",
    },
    updatedAt: `${thisYear}-04-26T00:00:00.000Z`,
    path: "/search/beauty-nutrition",
  },
  {
    handle: COLLECTION_HANDLES.BONE_JOINT,
    title: "骨骼关节",
    description: "补钙与关节呵护类的经典单品。",
    seo: {
      title: "骨骼关节",
      description: "钙片、维生素 D3 等日常补充。",
    },
    updatedAt: `${thisYear}-04-27T00:00:00.000Z`,
    path: "/search/bone-joint",
  },
  {
    handle: COLLECTION_HANDLES.EYE_CARE,
    title: "眼部守护",
    description: "聚焦缓解长时间用眼疲劳的营养补充。",
    seo: {
      title: "眼部守护",
      description: "叶黄素等蓝光防护方案。",
    },
    updatedAt: `${thisYear}-04-28T00:00:00.000Z`,
    path: "/search/eye-care",
  },
  {
    handle: COLLECTION_HANDLES.HOME_FEATURED,
    title: "首页精选展示",
    description: "用于首页三格陈列的隐藏集合。",
    seo: {
      title: "首页精选展示",
      description: "首页精选药品展示集合。",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
  },
  {
    handle: COLLECTION_HANDLES.HOME_CAROUSEL,
    title: "首页药品轮播",
    description: "首页轮播所需的隐藏集合。",
    seo: {
      title: "首页药品轮播",
      description: "轮播组件使用的药品集合。",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
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
