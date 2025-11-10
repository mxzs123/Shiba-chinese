import { ProductCard, ProductCardQuickAdd } from "@/app/_shared";
import { getCollectionProducts, getGoodsPageList } from "lib/api";

type HomeRecommendationsProps = {
  collectionHandle?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
  showBadge?: boolean;
  showTitle?: boolean;
  source?: "goods" | "collection";
  categories?: number[]; // goods 类别 id 列表；默认院内制剂 + 健康保健食品
  order?: "popular" | "latest"; // goods 排序
};

const DEFAULT_TITLE = "热门药品推荐";
const DEFAULT_SUBTITLE = "基于近期热销与药师咨询趋势，为你精选高关注度药品";
const DEFAULT_COLLECTION_HANDLE = "pharmacy";
const DEFAULT_LIMIT = 6;
const DEFAULT_SOURCE: NonNullable<HomeRecommendationsProps["source"]> =
  "goods";
const DEFAULT_GOODS_CATEGORIES = [2085, 2086]; // 院内制剂 + 健康保健食品
const DEFAULT_GOODS_ORDER: NonNullable<HomeRecommendationsProps["order"]> =
  "popular";

export async function HomeRecommendations({
  collectionHandle = DEFAULT_COLLECTION_HANDLE,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  limit = DEFAULT_LIMIT,
  showBadge = true,
  showTitle = true,
  source = DEFAULT_SOURCE,
  categories = DEFAULT_GOODS_CATEGORIES,
  order = DEFAULT_GOODS_ORDER,
}: HomeRecommendationsProps) {
  const fetchLimit = Math.max(limit * 2, limit);
  let items = [] as Awaited<ReturnType<typeof getCollectionProducts>>;

  if (source === "goods" && categories?.length) {
    const orderParam = order === "latest" ? "3" : "2"; // 2:popular, 3:latest
    const results = await Promise.all(
      categories.map(async (catId) => {
        const res = await getGoodsPageList({
          page: 1,
          limit: fetchLimit,
          order: orderParam,
          where: JSON.stringify({ catId }),
        });
        if (res.status && res.data) {
          return res.data.items;
        }
        return [];
      }),
    );

    const merged = results.flat();
    const seen = new Set<string>();
    const deduped: typeof merged = [];
    for (const p of merged) {
      const key = p.id || p.handle;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(p);
      }
    }

    items = deduped.slice(0, limit);
  }

  if (!items.length) {
    const fallback = await getCollectionProducts({
      collection: collectionHandle,
    });
    items = fallback.slice(0, limit);
  }

  if (!items.length) {
    return null;
  }

  const hasHeaderContent =
    showBadge || (showTitle && !!title) || (!!subtitle && subtitle.length > 0);

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-12 sm:px-6 lg:px-8">
      {hasHeaderContent ? (
        <header className="flex flex-col gap-2 pb-6">
          {showBadge ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
              热门药品
            </p>
          ) : null}
          {showTitle && title ? (
            <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
          ) : null}
          {subtitle ? (
            <p className="max-w-3xl text-sm text-neutral-600">{subtitle}</p>
          ) : null}
        </header>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {items.map((product) => (
          <ProductCard
            key={product.handle}
            product={product}
            className="h-full"
            compact
            hideDescription
            actionSlot={
              <ProductCardQuickAdd product={product} className="mt-2" />
            }
          />
        ))}
      </div>
    </section>
  );
}

export default HomeRecommendations;
