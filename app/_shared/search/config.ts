import type { GoodsCategory } from "lib/api/types";
import { goodsCategories, HOSPITAL_CATEGORY_ID } from "lib/api/mock-goods";

export const DESKTOP_SEARCH_PAGE_SIZE = 12;

export type SearchCategory = {
  slug: string;
  label: string;
  catId: number;
  parentId?: number | null;
  parentSlug?: string;
  description?: string;
  jpName?: string;
  enName?: string;
  children?: SearchCategory[];
};

function createSlugFromCategory(category: GoodsCategory): string {
  if (category.slug) {
    return category.slug;
  }

  return `cat-${category.id}`;
}

function sortGoodsCategories(
  categories?: GoodsCategory[] | null,
): GoodsCategory[] {
  if (!categories?.length) {
    return [];
  }

  return [...categories].sort((a, b) => {
    const aSort = a.sort ?? 0;
    const bSort = b.sort ?? 0;
    return bSort - aSort;
  });
}

function buildSearchCategory(
  category: GoodsCategory,
  parent?: { id: number; slug: string },
): SearchCategory {
  const slug = parent
    ? `${parent.slug}-${createSlugFromCategory(category)}`
    : createSlugFromCategory(category);

  const sortedChildren = sortGoodsCategories(category.child);
  const children = sortedChildren.length
    ? sortedChildren.map((child) =>
        buildSearchCategory(child, { id: category.id, slug }),
      )
    : undefined;

  return {
    slug,
    label: category.name,
    catId: category.id,
    parentId: parent?.id ?? category.parentId ?? null,
    parentSlug: parent?.slug,
    description: category.enName,
    jpName: category.jpName,
    enName: category.enName,
    children,
  };
}

const fallbackCategory: SearchCategory = {
  slug: "hospital",
  label: "院内制剂",
  catId: HOSPITAL_CATEGORY_ID,
  children: [],
};

const sortedRootCategories = sortGoodsCategories(goodsCategories);

export const SEARCH_CATEGORY_TREE: SearchCategory[] =
  sortedRootCategories.length
    ? sortedRootCategories.map((category) => buildSearchCategory(category))
    : [fallbackCategory];

function flattenCategories(categories: SearchCategory[]): SearchCategory[] {
  const result: SearchCategory[] = [];

  for (const category of categories) {
    result.push(category);
    if (category.children) {
      result.push(...flattenCategories(category.children));
    }
  }

  return result;
}

const flatSearchCategories = flattenCategories(SEARCH_CATEGORY_TREE);

export function findSearchCategory(slug: string) {
  return flatSearchCategories.find((category) => category.slug === slug);
}

export function getSearchCategories() {
  return SEARCH_CATEGORY_TREE;
}
