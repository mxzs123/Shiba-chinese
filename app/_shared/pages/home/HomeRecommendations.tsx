import { ProductCard, ProductCardQuickAdd } from "@/app/_shared";
import { getCollectionProducts } from "lib/api";

type HomeRecommendationsProps = {
  collectionHandle?: string;
  title?: string;
  subtitle?: string;
  limit?: number;
};

const DEFAULT_TITLE = "热门药品推荐";
const DEFAULT_SUBTITLE = "基于近期热销与药师咨询趋势，为你精选高关注度药品";
const DEFAULT_COLLECTION_HANDLE = "pharmacy";
const DEFAULT_LIMIT = 4;

export async function HomeRecommendations({
  collectionHandle = DEFAULT_COLLECTION_HANDLE,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  limit = DEFAULT_LIMIT,
}: HomeRecommendationsProps) {
  const products = await getCollectionProducts({
    collection: collectionHandle,
  });
  const items = products.slice(0, limit);

  if (!items.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 pb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
          热门药品
        </p>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.handle}
            product={product}
            className="h-full"
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
