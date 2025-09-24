export type SearchCategorySource =
  | { type: "collection"; handle: string }
  | { type: "query"; value: string };

export type SearchCategory = {
  slug: string;
  label: string;
  description?: string;
  source: SearchCategorySource;
};

export const DESKTOP_SEARCH_PAGE_SIZE = 12;

export const DESKTOP_SEARCH_CATEGORIES: SearchCategory[] = [
  {
    slug: "pharmacy",
    label: "处方药品",
    source: { type: "collection", handle: "pharmacy" },
  },
  {
    slug: "otc",
    label: "非处方药品",
    source: { type: "collection", handle: "wellness" },
  },
  {
    slug: "nutrition",
    label: "健康保健食品",
    source: { type: "query", value: "软糖" },
  },
  {
    slug: "hospital",
    label: "院内制剂",
    source: { type: "collection", handle: "pharmacy" },
  },
  {
    slug: "beauty",
    label: "美妆护肤",
    source: { type: "query", value: "护理" },
  },
  {
    slug: "lifestyle",
    label: "生活用品",
    source: { type: "collection", handle: "accessories" },
  },
];

export function findSearchCategory(slug: string) {
  return DESKTOP_SEARCH_CATEGORIES.find((category) => category.slug === slug);
}
