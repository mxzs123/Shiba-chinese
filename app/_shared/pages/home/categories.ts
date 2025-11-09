export type HomeCategoryLink = {
  label: string;
  href: string;
  description?: string;
};

export const POPULAR_CATEGORY_LINKS: HomeCategoryLink[] = [
  {
    label: "处方药品",
    href: "/search/prescription",
    description: "在线复诊、药师审方配送",
  },
  {
    label: "非处方药品（OTC）",
    href: "/search/otc",
    description: "常备感冒、止痛、眼部护理",
  },
  {
    label: "健康保健食品",
    href: "/search/wellness",
    description: "维生素、免疫与营养补给",
  },
  {
    label: "院内制剂",
    href: "/search/hospital",
    description: "精选医院合作处方调剂",
  },
  {
    label: "美妆护肤",
    href: "/search/beauty",
    description: "医研级护肤、美容仪器",
  },
  {
    label: "生活用品",
    href: "/search/lifestyle",
    description: "健康家居、日常护理精选",
  },
  {
    label: "其他",
    href: "/search",
    description: "更多精选好物一站购齐",
  },
];

export const HOME_CATEGORY_GRID_LINKS: HomeCategoryLink[] =
  POPULAR_CATEGORY_LINKS.filter((category) => category.label !== "其他");
