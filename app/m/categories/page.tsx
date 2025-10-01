import {
  getCollectionProducts,
  getNotifications,
  getProducts,
} from "lib/api";
import { MobileHeader } from "components/layout/mobile-header";
import { MobileCategoriesContent } from "./categories-content";
import { DESKTOP_SEARCH_CATEGORIES } from "app/_shared/search/config";

export const metadata = {
  title: "商品分类",
  description: "浏览所有商品分类",
};

export default async function MobileCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const notifications = await getNotifications();
  const params = await searchParams;
  const categorySlug = params.category || "pharmacy";

  const category = DESKTOP_SEARCH_CATEGORIES.find(
    (c) => c.slug === categorySlug,
  );

  let products = await getProducts({});

  if (category) {
    if (category.source.type === "collection") {
      products = await getCollectionProducts({
        collection: category.source.handle,
      });
    } else if (category.source.type === "query") {
      products = await getProducts({ query: category.source.value });
    }
  }

  const allTags = Array.from(
    new Set(products.flatMap((product) => product.tags)),
  );

  return (
    <div className="flex h-screen flex-col">
      <MobileHeader notifications={notifications} />
      <div className="flex flex-1 overflow-hidden">
        <MobileCategoriesContent
          initialProducts={products}
          allTags={allTags}
          selectedTag={params.tag}
        />
      </div>
    </div>
  );
}
