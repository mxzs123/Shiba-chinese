import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard, ProductCardQuickAdd, Price } from "@/app/_shared";
import { AddToCartForm } from "@/app/_shared/pages/product/AddToCartForm";
import { ReassuranceNotice } from "@/app/_shared/pages/product/ReassuranceNotice";
import {
  loadProductPageData,
  selectPrimaryVariant,
  type GalleryImage,
  type GuidelineSection,
  type ProductDetailRow,
} from "@/app/_shared/pages/product/shared";
import { CartProvider } from "@/components/cart/cart-context";
import { MobileHeader } from "@/components/layout/mobile-header";
import { ProductProvider } from "@/components/product/product-context";
import { Gallery } from "@/components/product/gallery";
import Prose from "@/components/prose";
import { getNotifications } from "@/lib/api";
import type { Product } from "@/lib/api/types";
import { isDiscountedPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PageParams = {
  handle: string;
};

type MobilePageProps = {
  params: Promise<PageParams>;
};

type MobileSummaryProps = {
  product: Product;
};

type MobileGalleryProps = {
  images: GalleryImage[];
};

type MobileDetailListProps = {
  detailRows: ProductDetailRow[];
};

type MobileGuidelinesProps = {
  sections: GuidelineSection[];
};

function GalleryFallback() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100" />
  );
}

function AvailabilityBadge({ available }: { available: boolean }) {
  const indicatorClass = available ? "bg-emerald-500" : "bg-neutral-400";
  const label = available ? "现货供应" : "暂时缺货";

  return (
    <span
      className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600"
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

function MobileProductGallery({ images }: MobileGalleryProps) {
  return (
    <div className="bg-white px-4 pb-6 pt-4">
      <Suspense fallback={<GalleryFallback />}>
        <Gallery images={images} />
      </Suspense>
    </div>
  );
}

function MobileProductSummary({ product }: MobileSummaryProps) {
  const variant = selectPrimaryVariant(product);
  const price = variant?.price || product.priceRange.minVariantPrice;
  const originalPrice =
    variant?.compareAtPrice || product.priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(price, originalPrice);

  return (
    <section className="space-y-5 bg-white px-4 pb-8">
      <AvailabilityBadge available={product.availableForSale} />
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          {product.title}
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          {product.description}
        </p>
      </header>
      <div className="space-y-2">
        <Price
          value={price}
          originalValue={originalPrice}
          className={cn(
            "text-3xl font-semibold",
            hasDiscount ? "text-emerald-600" : "text-neutral-900",
          )}
          currencyClassName={cn(
            "text-base font-medium",
            hasDiscount ? "text-emerald-600/80" : "text-neutral-500",
          )}
          showConvertedPrice
          convertedClassName="text-sm font-medium text-neutral-500"
          convertedCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400"
          originalClassName="text-base font-medium text-neutral-400 line-through"
          originalCurrencyClassName="text-xs font-medium uppercase tracking-wide text-neutral-400/80"
          originalConvertedClassName="text-xs font-medium text-neutral-400"
          originalConvertedCurrencyClassName="text-[11px] font-medium uppercase tracking-wide text-neutral-400/60"
          badgeClassName="px-2 py-0.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10"
          originalColumnAlign="start"
          discountLayout="start"
        />
      </div>
    </section>
  );
}

function MobileDetailList({ detailRows }: MobileDetailListProps) {
  if (!detailRows.length) {
    return null;
  }

  return (
    <section className="space-y-4 bg-white px-4 py-6">
      <h2 className="text-lg font-semibold text-neutral-900">基础参数</h2>
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        <dl className="divide-y divide-neutral-100 text-sm text-neutral-600">
          {detailRows.map((row) => (
            <div key={row.label} className="flex items-start gap-6 px-4 py-3">
              <dt className="w-24 shrink-0 font-medium text-neutral-800">
                {row.label}
              </dt>
              <dd className="flex-1 text-neutral-600">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function MobileDescription({ product }: { product: Product }) {
  if (!product.descriptionHtml && !product.description) {
    return null;
  }

  return (
    <section className="space-y-4 bg-white px-4 py-6">
      <h2 className="text-lg font-semibold text-neutral-900">商品介绍</h2>
      {product.descriptionHtml ? (
        <Prose html={product.descriptionHtml} className="prose-sm max-w-none" />
      ) : (
        <p className="text-sm leading-6 text-neutral-600">
          {product.description || "商品信息将于后端接入后同步展示。"}
        </p>
      )}
    </section>
  );
}

function MobileGuidelines({ sections }: MobileGuidelinesProps) {
  if (!sections.length) {
    return null;
  }

  return (
    <section className="space-y-4 bg-white px-4 py-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-neutral-900">用药须知</h2>
        <p className="text-xs text-neutral-500">
          请结合个人身体状况与专业药师建议安全用药。
        </p>
      </header>
      <ul className="space-y-4">
        {sections.map((section) => (
          <li key={section.title} className="space-y-1.5">
            <h3 className="text-sm font-medium text-neutral-800">
              {section.title}
            </h3>
            <p className="text-sm leading-6 text-neutral-600">{section.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MobileRecommendations({ products }: { products: Product[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-4 bg-white px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">搭配推荐</h2>
        <Link
          href="/search"
          className="text-xs font-medium text-teal-600 transition hover:text-teal-500"
        >
          浏览更多
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-1">
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0">
            <ProductCard
              product={product}
              actionSlot={<ProductCardQuickAdd product={product} />}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function MobileProductPage({ params }: MobilePageProps) {
  const resolvedParams = await params;
  const data = await loadProductPageData(resolvedParams.handle);

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

  const notifications = await getNotifications();

  return (
    <CartProvider cartPromise={cartPromise}>
      <ProductProvider>
        <MobileHeader notifications={notifications} leadingVariant="back" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <div className="flex min-h-screen flex-col gap-4 bg-neutral-50 pb-32">
          <MobileProductGallery images={images} />
          <MobileProductSummary product={product} />
          <ReassuranceNotice className="mx-4" />
          <MobileDetailList detailRows={detailRows} />
          <MobileGuidelines sections={guidelineSections} />
          <MobileDescription product={product} />
          <MobileRecommendations products={recommended} />
        </div>
        <MobileProductPurchaseBar product={product} />
      </ProductProvider>
    </CartProvider>
  );
}

function MobileProductPurchaseBar({ product }: { product: Product }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white px-4 pt-3 pb-3 shadow-[0_-4px_16px_rgba(15,23,42,0.12)]"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)",
      }}
    >
      <AddToCartForm product={product} variant="inline" />
    </div>
  );
}
