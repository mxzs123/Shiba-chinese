export { generateMetadata } from "@/app/_shared/pages/product/page";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard, ProductCardQuickAdd, Price } from "@/app/_shared";
import { AddToCartForm } from "@/app/_shared/pages/product/AddToCartForm";
import { ReassuranceNotice } from "@/app/_shared/pages/product/ReassuranceNotice";
import { HomeQuickCategoryShortcuts } from "@/app/_shared/pages/home/HomeQuickCategoryShortcuts";
import {
  loadProductPageData,
  selectPrimaryVariant,
  type GalleryImage,
} from "@/app/_shared/pages/product/shared";
import { CartProvider } from "@/components/cart/cart-context";
import { ProductProvider } from "@/components/product/product-context";
import { HeroGallery } from "@/components/product/hero-gallery";
import { ProductDetailTabs } from "@/components/product/product-detail-tabs";
import type { Product } from "@/lib/api/types";
import { isDiscountedPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Building2, Globe2, ShieldCheck, Stethoscope } from "lucide-react";

type PageParams = {
  handle: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

type ProductHeroProps = {
  product: Product;
  images: GalleryImage[];
};

type FeatureHighlight = {
  title: string;
  description: string;
  icon: typeof Globe2;
};

function ProductHeroGalleryFallback() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mx-auto aspect-square w-full max-w-[480px] overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100" />
      <div className="mt-4 flex h-20 w-full max-w-[480px] items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80">
        <span className="h-12 w-20 rounded-2xl border border-neutral-200 bg-white" />
      </div>
    </div>
  );
}

function AvailabilityBadge({ available }: { available: boolean }) {
  const indicatorClass = available ? "bg-emerald-500" : "bg-neutral-400";
  const label = available ? "现货供应" : "暂时缺货";

  return (
    <span
      className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600"
      role="status"
    >
      <span
        className={`mr-2 inline-block h-2 w-2 rounded-full ${indicatorClass}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

function Breadcrumbs({ title }: { title: string }) {
  const items = [
    { label: "首页", href: "/" },
    { label: "全部商品", href: "/search" },
    { label: title },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 sm:text-sm">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="transition hover:text-teal-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-neutral-700">{item.label}</span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden className="text-neutral-300">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ProductHero({ product, images }: ProductHeroProps) {
  const variant = selectPrimaryVariant(product);
  const price = variant?.price || product.priceRange.minVariantPrice;
  const originalPrice =
    variant?.compareAtPrice || product.priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(price, originalPrice);

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 lg:p-12">
      <div className="grid gap-10 items-start lg:auto-rows-min lg:grid-cols-[minmax(0,0.9fr)_minmax(440px,1fr)] lg:items-stretch">
        <Suspense fallback={<ProductHeroGalleryFallback />}>
          <HeroGallery images={images} />
        </Suspense>
        <div className="flex flex-col gap-8 lg:col-start-2 lg:row-start-1">
          <div className="space-y-4">
            <AvailabilityBadge available={product.availableForSale} />
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold text-neutral-900">
                {product.title}
              </h1>
              <p className="text-sm leading-6 text-neutral-600">
                {product.description}
              </p>
            </div>
          </div>
          <div className="space-y-6 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-6 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
                <Price
                  value={price}
                  originalValue={originalPrice}
                  className={cn(
                    "text-4xl font-semibold leading-tight",
                    hasDiscount ? "text-emerald-600" : "text-neutral-900",
                  )}
                  currencyClassName={cn(
                    "text-lg font-medium",
                    hasDiscount ? "text-emerald-600/80" : "text-neutral-500",
                  )}
                  showConvertedPrice
                  convertedClassName="text-base font-medium text-neutral-500"
                  convertedCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400"
                  originalClassName="text-lg font-medium text-neutral-400 line-through"
                  originalCurrencyClassName="text-sm font-medium uppercase tracking-wide text-neutral-400/80"
                  originalConvertedClassName="text-sm font-medium text-neutral-400"
                  originalConvertedCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400/60"
                  badgeClassName="px-2 py-0.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10"
                  originalColumnAlign="start"
                  discountLayout="start"
                />
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  含税价格 · 支持人民币结算
                </span>
              </div>
              <p className="text-sm text-neutral-500">
                库存实时同步日本药局，付款成功后 3-5 个工作日内发出。
              </p>
            </div>
            <AddToCartForm
              product={product}
              variant="inline"
              className="border-t border-neutral-200 pt-4"
            />
            <ReassuranceNotice className="border-0 bg-transparent px-0 py-0" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  const features: FeatureHighlight[] = [
    {
      title: "全球直送",
      description:
        "覆盖 40+ 国家与地区的履约网络，让日本药品与健康好物安全抵达您手中。",
      icon: Globe2,
    },
    {
      title: "日本正规药局",
      description: "由日本官方许可的药局团队运营，严格遵循药事法规与冷链准则。",
      icon: Building2,
    },
    {
      title: "原装正品保障",
      description: "所有商品通过正规渠道采购，入库前完成批次追溯与真伪复核。",
      icon: ShieldCheck,
    },
    {
      title: "药剂师专业指导",
      description:
        "日本注册药剂师提供 1:1 咨询，辅助您制定安全有效的用药方案。",
      icon: Stethoscope,
    },
  ];

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-neutral-900">
            为什么选择芝园药局
          </h2>
          <p className="text-sm text-neutral-500">
            四大服务承诺，为跨境购药提供真正可托付的安心体验。
          </p>
        </header>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="flex gap-4 rounded-xl border border-neutral-100 bg-neutral-50 p-5"
              >
                <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-6 text-neutral-600">
                    {feature.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-neutral-900">搭配推荐</h2>
          <Link
            href="/search"
            className="text-sm font-medium text-teal-600 transition hover:text-teal-500"
          >
            查看全部商品
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              actionSlot={<ProductCardQuickAdd product={product} />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DesktopProductPage(props: PageProps) {
  const params = await props.params;
  const data = await loadProductPageData(params.handle);

  if (!data) {
    return notFound();
  }

  const {
    product,
    cartPromise,
    productJsonLd,
    images,
    recommended,
    detailRows,
    guidelineSections,
  } = data;

  return (
    <CartProvider cartPromise={cartPromise}>
      <ProductProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <HomeQuickCategoryShortcuts className="pb-6" />
        <div className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-12">
            <Breadcrumbs title={product.title} />
            <ProductHero product={product} images={images} />
            <ProductDetailTabs
              detailRows={detailRows}
              descriptionHtml={product.descriptionHtml}
              descriptionFallback={
                product.description || "商品说明将于后端接入后同步展示。"
              }
              guidelineSections={guidelineSections}
            />
            <FeatureHighlights />
            <RelatedProducts products={recommended} />
          </div>
        </div>
      </ProductProvider>
    </CartProvider>
  );
}
