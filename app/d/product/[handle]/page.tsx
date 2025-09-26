export { generateMetadata } from "@/app/_shared/pages/product/page";

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard, Price } from "app/_shared";
import { CartProvider } from "components/cart/cart-context";
import { ProductProvider } from "components/product/product-context";
import { HeroGallery } from "components/product/hero-gallery";
import { ProductDetailTabs } from "components/product/product-detail-tabs";
import { AddToCartForm } from "@/app/_shared/pages/product/AddToCartForm";
import { ReassuranceNotice } from "@/app/_shared/pages/product/ReassuranceNotice";
import { getCart, getProduct, getProductRecommendations } from "lib/api";
import type { Image, Product, ProductVariant } from "lib/api/types";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";
import { Building2, Globe2, ShieldCheck, Stethoscope } from "lucide-react";

type PageParams = {
  handle: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

type ProductDetailRow = {
  label: string;
  value: string;
};

type GuidelineSection = {
  title: string;
  body: string;
};

type GalleryImage = {
  src: string;
  altText: string;
};

function selectPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

function buildProductJsonLd(product: Product) {
  const variant = selectPrimaryVariant(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "Offer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency:
        variant?.price.currencyCode ||
        product.priceRange.minVariantPrice.currencyCode,
      price: variant?.price.amount || product.priceRange.minVariantPrice.amount,
    },
  };
}

function parseTaggedData(tags: string[], prefix: string) {
  return tags.reduce<Record<string, string>>((acc, tag) => {
    if (!tag.startsWith(prefix)) {
      return acc;
    }

    const raw = tag.slice(prefix.length);
    const [key, ...rest] = raw.split("=");
    const value = rest.join("=").trim();

    if (key && value) {
      acc[key.trim()] = value;
    }

    return acc;
  }, {});
}

function getProductDetailRows(product: Product): ProductDetailRow[] {
  const detailMap = parseTaggedData(product.tags, "detail:");
  const optionSummary = product.options
    .map((option) => `${option.name}：${option.values.join(" / ")}`)
    .join("；");
  const defaults: Array<{
    key: string;
    label: string;
    fallback?: string;
  }> = [
    {
      key: "jp_name",
      label: "日语商品名",
      fallback: product.title,
    },
    {
      key: "manufacturer",
      label: "制造商",
    },
    {
      key: "seller",
      label: "销售商",
    },
    {
      key: "content_volume",
      label: "内容量",
      fallback: optionSummary || "以实际包装为准",
    },
  ];

  const rows = defaults.map(({ key, label, fallback }) => ({
    label,
    value: detailMap[key] || fallback || "资料更新中",
  }));

  const extraRows = Object.entries(detailMap).filter(
    ([key]) => !defaults.some((detail) => detail.key === key),
  );

  return [
    ...rows,
    ...extraRows.map(([key, value]) => ({
      label: key,
      value,
    })),
  ];
}

function getUsageGuidelines(product: Product): GuidelineSection[] {
  const guidelineMap = parseTaggedData(product.tags, "guideline:");
  const defaults: Array<{
    key: string;
    title: string;
    fallback: string;
  }> = [
    {
      key: "usage",
      title: "用法用量",
      fallback: "请遵照包装说明书或专业药剂师指导使用，切勿超量服用。",
    },
    {
      key: "caution",
      title: "注意事项",
      fallback: "如您正处于孕期、哺乳期或有基础疾病，请先咨询医生再行使用。",
    },
    {
      key: "storage",
      title: "存储建议",
      fallback: "置于阴凉干燥处保存，避免阳光直射，并远离儿童可触及的位置。",
    },
  ];
  const usedKeys = new Set(defaults.map((item) => item.key));

  const sections = defaults.map(({ key, title, fallback }) => ({
    title,
    body: guidelineMap[key] || fallback,
  }));

  const extraSections = Object.entries(guidelineMap)
    .filter(([key]) => !usedKeys.has(key))
    .map(([key, body]) => ({
      title: key,
      body,
    }));

  return [...sections, ...extraSections];
}

function ProductHeroGalleryFallback() {
  return (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 lg:col-start-1 lg:row-start-1" />
      <div className="mt-5 hidden h-20 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 lg:col-span-2 lg:row-start-2 lg:block lg:mt-6" />
    </>
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
        aria-hidden
        className={`mr-2 inline-block h-2 w-2 rounded-full ${indicatorClass}`}
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

function ProductHero({
  product,
  images,
}: {
  product: Product;
  images: GalleryImage[];
}) {
  const variant = selectPrimaryVariant(product);
  const price = variant?.price || product.priceRange.minVariantPrice;
  const originalPrice =
    variant?.compareAtPrice || product.priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(price, originalPrice);

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 lg:p-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:auto-rows-min">
        <Suspense fallback={<ProductHeroGalleryFallback />}>
          <HeroGallery images={images} />
        </Suspense>
        <div className="flex flex-col gap-8 lg:col-start-2 lg:row-start-1 lg:h-full">
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
          <div className="space-y-6 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-6">
            <Price
              value={price}
              originalValue={originalPrice}
              className={cn(
                "text-4xl font-semibold",
                hasDiscount
                  ? "text-emerald-600 dark:text-emerald-300"
                  : "text-neutral-900 dark:text-neutral-50",
              )}
              currencyClassName={cn(
                "text-lg font-medium",
                hasDiscount
                  ? "text-emerald-600/80 dark:text-emerald-300/80"
                  : "text-neutral-500",
              )}
              showConvertedPrice
              convertedClassName="text-base font-medium text-neutral-500"
              convertedCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
              originalClassName="text-xl font-medium text-neutral-400 line-through dark:text-neutral-500"
              originalCurrencyClassName="text-sm font-medium uppercase tracking-wide text-neutral-400/80 dark:text-neutral-500/80"
              originalConvertedClassName="text-sm font-medium text-neutral-400 dark:text-neutral-500"
              originalConvertedCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400/60 dark:text-neutral-500/60"
              badgeClassName="px-2 py-0.5 text-sm font-semibold text-emerald-600 dark:text-emerald-200 bg-emerald-500/10 dark:bg-emerald-400/20"
            />
            <AddToCartForm product={product} />
          </div>
          <ReassuranceNotice className="lg:mt-auto" />
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  const features = [
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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function DesktopProductPage(props: PageProps) {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) {
    return notFound();
  }

  const productJsonLd = buildProductJsonLd(product);
  const images = product.images.slice(0, 6).map((image: Image) => ({
    src: image.url,
    altText: image.altText,
  }));
  const cartPromise = getCart();
  const recommended = await getProductRecommendations(product.id);
  const detailRows = getProductDetailRows(product);
  const usageSections = getUsageGuidelines(product);

  return (
    <CartProvider cartPromise={cartPromise}>
      <ProductProvider>
        <script
          // eslint-disable-next-line react/no-danger
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
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
              guidelineSections={usageSections}
            />
            <FeatureHighlights />
            <RelatedProducts products={recommended} />
          </div>
        </div>
      </ProductProvider>
    </CartProvider>
  );
}
