import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard, ProductCardQuickAdd, Price } from "app/_shared";
import { CartProvider } from "components/cart/cart-context";
import { ProductProvider } from "components/product/product-context";
import { Gallery } from "components/product/gallery";
import Prose from "components/prose";
import { getCart, getProduct, getProductRecommendations } from "lib/api";
import type { Image, Product, ProductVariant } from "lib/api/types";
import { HIDDEN_PRODUCT_TAG } from "lib/constants";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";

import { AddToCartForm } from "./AddToCartForm";

type PageParams = {
  handle: string;
};

type PageProps = {
  params: Promise<PageParams>;
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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.handle);

  if (!product) {
    return {};
  }

  const isHidden = product.tags.includes(HIDDEN_PRODUCT_TAG);
  const indexable = !isHidden;
  const title = product.seo?.title || product.title;
  const description = product.seo?.description || product.description;
  const featured = product.featuredImage;

  return {
    title,
    description,
    robots: {
      index: indexable,
      follow: indexable,
      googleBot: {
        index: indexable,
        follow: indexable,
      },
    },
    openGraph: featured
      ? {
          title,
          description,
          images: [
            {
              url: featured.url,
              width: featured.width,
              height: featured.height,
              alt: featured.altText,
            },
          ],
        }
      : undefined,
  };
}

function GalleryFallback() {
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100" />
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

function ProductHighlights({ product }: { product: Product }) {
  const variant = selectPrimaryVariant(product);
  const price = variant?.price || product.priceRange.minVariantPrice;
  const originalPrice =
    variant?.compareAtPrice || product.priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(price, originalPrice);

  return (
    <div className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="space-y-3">
        <AvailabilityBadge available={product.availableForSale} />
        <h1 className="text-3xl font-semibold text-neutral-900">
          {product.title}
        </h1>
        <p className="text-sm text-neutral-600">{product.description}</p>
      </div>
      <div className="flex items-end gap-3">
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
        />
        <span className="text-xs text-neutral-500">
          含税价 · 下单后 24 小时内出库
        </span>
      </div>
      <AddToCartForm product={product} />
      <dl className="grid grid-cols-1 gap-4 text-sm text-neutral-600 md:grid-cols-2">
        <div className="space-y-1">
          <dt className="font-medium text-neutral-800">发货与配送</dt>
          <dd>东京仓发货，国内平均 5-7 个工作日送达。</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium text-neutral-800">安心保证</dt>
          <dd>支持“芝园药师”远程咨询，收货后 7 日内无条件退换。</dd>
        </div>
      </dl>
    </div>
  );
}

function ProductDescription({ product }: { product: Product }) {
  if (!product.descriptionHtml) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-neutral-900">详细介绍</h2>
      <Prose html={product.descriptionHtml} className="mt-6 max-w-none" />
    </section>
  );
}

function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="space-y-8 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-900">搭配推荐</h2>
        <Link
          href="/search"
          className="text-sm font-medium text-teal-600 transition hover:text-teal-500"
        >
          查看全部
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
    </section>
  );
}

export async function ProductPage(props: PageProps) {
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
  const showDetails = Boolean(product.descriptionHtml);
  const showRecommendations = recommended.length > 0;
  const showSecondarySections = showDetails || showRecommendations;

  return (
    <CartProvider cartPromise={cartPromise}>
      <ProductProvider>
        <script
          // eslint-disable-next-line react/no-danger
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-12 px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <Suspense fallback={<GalleryFallback />}>
                <Gallery images={images} />
              </Suspense>
            </div>
            <ProductHighlights product={product} />
          </div>
          {showSecondarySections ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              {showDetails ? <ProductDescription product={product} /> : null}
              {showRecommendations ? (
                <RelatedProducts products={recommended} />
              ) : null}
            </div>
          ) : null}
        </div>
      </ProductProvider>
    </CartProvider>
  );
}

export default ProductPage;
