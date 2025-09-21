import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CupSoda,
  HeartPulse,
  Package2,
  Sparkles,
} from "lucide-react";

import { Carousel } from "components/carousel";
import { getCollections, getCollectionProducts } from "lib/api";
import type { Collection, Product } from "lib/api/types";
import { ProductCard } from "app/_shared";

const categoryIconByHandle = {
  "": Sparkles,
  beverage: CupSoda,
  wellness: HeartPulse,
  accessories: Package2,
} as const;

type CategoryIconKey = keyof typeof categoryIconByHandle;

function CategoryCard({ collection }: { collection: Collection }) {
  const Icon =
    categoryIconByHandle[(collection.handle || "") as CategoryIconKey] ??
    Sparkles;

  return (
    <Link
      href={collection.path}
      className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-neutral-900">
            {collection.title}
          </h3>
          <p className="text-sm text-neutral-500 line-clamp-2">
            {collection.description}
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700 transition group-hover:bg-teal-100 group-hover:text-teal-600">
          <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
        </span>
      </div>
      <span className="inline-flex items-center text-sm font-medium text-teal-700 transition group-hover:text-teal-600">
        进入分类
        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
      </span>
    </Link>
  );
}

function RecommendedSection({ products }: { products: Product[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            推荐商品
          </p>
          <h2 className="text-3xl font-bold text-neutral-950">
            健康方案，一站式补给
          </h2>
          <p className="text-base text-neutral-600">
            基于用户购买数据与药师建议，精选口碑单品覆盖日常饮食、放松与装备需求。
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-full border border-teal-100 bg-white px-5 py-2 text-sm font-medium text-teal-700 shadow-sm transition hover:border-teal-200 hover:text-teal-600"
        >
          浏览全部商品
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            actionSlot={
              <Link
                href={`/product/${product.handle}`}
                className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-teal-200 hover:text-teal-600"
              >
                查看详情
              </Link>
            }
          />
        ))}
      </div>
    </section>
  );
}

function CategorySection({ collections }: { collections: Collection[] }) {
  if (!collections.length) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-16">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            品类入口
          </p>
          <h2 className="text-3xl font-bold text-neutral-950">
            按需求快速定位
          </h2>
          <p className="text-base text-neutral-600">
            从冲泡饮品到健康配件，芝园药局帮助你快速找到适配生活方式的疗愈灵感。
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex items-center justify-center rounded-full border border-teal-100 bg-white px-5 py-2 text-sm font-medium text-teal-700 shadow-sm transition hover:border-teal-200 hover:text-teal-600"
        >
          查看全部商品
        </Link>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <CategoryCard
            key={collection.handle || collection.path}
            collection={collection}
          />
        ))}
      </div>
    </section>
  );
}

function MarketingBanner() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-emerald-700 to-emerald-500" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)]" />
      <div className="relative mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-12 px-4 py-24 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-white/70">
            春夏养生主题季
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            芝园药局 · 东京配方工作室热门上新
          </h1>
          <p className="text-base text-white/80">
            我们与日本芝公园的配方工作室联合研发，将每日可持续的饮食补给、舒缓仪式与轻器具打包成一站式方案，轻松开启你的日常疗愈旅程。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100"
            >
              立即选购
            </Link>
            <Link
              href="/page/about"
              className="inline-flex items-center justify-center rounded-full border border-white/50 px-5 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              了解芝园药局
            </Link>
          </div>
        </div>
        <div className="relative h-[320px] w-full max-w-md self-center overflow-hidden rounded-3xl border border-white/30 bg-white/10 shadow-2xl backdrop-blur">
          <Image
            src="https://images.unsplash.com/photo-1558640472-9d2a7deb7f62?auto=format&fit=crop&w=1200&q=80"
            alt="芝园药局配方工作室的茶饮调配台"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 400px, 90vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent" />
          <div className="absolute bottom-6 left-6 right-6 space-y-2 rounded-2xl bg-white/80 p-4 text-neutral-900 backdrop-blur">
            <p className="text-sm font-semibold text-teal-900">芝公園 Lab.</p>
            <p className="text-xs text-neutral-600">
              东京芝公园 2-3-3 寺田楼 1F 的配方工作室每日进行 20+
              次配方实验，确保配料表透明、风味稳定。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function DesktopHomePage() {
  const [collections, featuredProducts] = await Promise.all([
    getCollections(),
    getCollectionProducts({ collection: "hidden-homepage-featured-items" }),
  ]);

  const limitedCollections = collections.slice(0, 4);
  const recommendedProducts = featuredProducts.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-24">
      <MarketingBanner />
      <CategorySection collections={limitedCollections} />
      <RecommendedSection products={recommendedProducts} />
      <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4">
        <div className="flex flex-col gap-6 pb-16">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
              热门口碑
            </p>
            <h2 className="text-3xl font-bold text-neutral-950">茶饮灵感流</h2>
            <p className="text-base text-neutral-600">
              跟随社区成员的收藏速度，实时捕捉下一杯灵感。滑动查看更多单品，均可直接进入详情页加购。
            </p>
          </div>
          <Carousel />
        </div>
      </section>
    </div>
  );
}
