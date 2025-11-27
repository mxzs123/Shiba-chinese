"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Search, Home, Grid3x3, ShoppingCart, Info } from "lucide-react";

import { ProductCard, ProductCardQuickAdd, Price, CartBadge } from "@/app/_shared";
import { AddToCartForm } from "@/app/_shared/pages/product/AddToCartForm";
import { ReassuranceNotice } from "@/app/_shared/pages/product/ReassuranceNotice";
import type {
  GalleryImage,
  GuidelineSection,
  ProductDetailRow,
} from "@/app/_shared/pages/product/shared";
import { useCart } from "@/components/cart/cart-context";
import { Gallery } from "@/components/product/gallery";
import Prose from "@/components/prose";
import type { Product, ProductVariant } from "@/lib/api/types";
import { isDiscountedPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions (client-safe)
// ─────────────────────────────────────────────────────────────────────────────

function selectPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type MobileProductPageClientProps = {
  product: Product;
  productJsonLd: Record<string, unknown>;
  images: GalleryImage[];
  recommended: Product[];
  detailRows: ProductDetailRow[];
  guidelineSections: GuidelineSection[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Header Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductPageHeader() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleBack = () => {
    if (typeof window === "undefined") {
      router.push("/");
      return;
    }

    // 超时降级：若 back() 无效（如微信直接打开链接），则跳转首页
    let didNavigate = false;
    const onPopState = () => {
      didNavigate = true;
    };

    window.addEventListener("popstate", onPopState);
    router.back();

    setTimeout(() => {
      window.removeEventListener("popstate", onPopState);
      if (!didNavigate) {
        router.push("/");
      }
    }, 150);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    const target = trimmedQuery
      ? `/categories?q=${encodeURIComponent(trimmedQuery)}`
      : "/categories";
    router.push(target);
  };

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  const openSearch = () => {
    setIsSearching(true);
  };

  return (
    <header
      className="flex-none border-b border-neutral-200 bg-white px-4 py-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          aria-label="返回上一页"
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索商品..."
                autoComplete="off"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-10 pr-4 text-sm text-black placeholder:text-neutral-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={openSearch}
            className="flex-1"
            aria-label="搜索商品"
          >
            <div className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500 text-left">
              <Search className="h-4 w-4" />
              <span>搜索商品...</span>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Purchase Bar Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductPurchaseBar({ product }: { product: Product }) {
  return (
    <div className="flex-none border-t border-neutral-200 bg-white px-4 pt-3 pb-3 shadow-[0_-4px_16px_rgba(15,23,42,0.12)]">
      <AddToCartForm product={product} variant="inline" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom Navigation Component
// ─────────────────────────────────────────────────────────────────────────────

function ProductBottomNav() {
  const pathname = usePathname();
  const normalizedPathname =
    pathname?.replace(/^\/(m|d)(?=\/)/, "") ?? pathname ?? "";
  const { cart } = useCart();
  const cartQuantity = cart?.totalQuantity ?? 0;

  const navItems = useMemo(
    () => [
      { href: "/", label: "首页", icon: Home },
      { href: "/categories", label: "分类", icon: Grid3x3 },
      { href: "/cart", label: "购物车", icon: ShoppingCart },
      { href: "/about", label: "关于", icon: Info },
    ],
    [],
  );

  return (
    <nav
      className="flex-none border-t border-neutral-200 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid h-16 grid-cols-4">
        {navItems.map((item) => {
          const isActive =
            normalizedPathname === item.href ||
            (item.href !== "/" &&
              normalizedPathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          const isCart = item.href === "/cart";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-neutral-500 hover:text-neutral-900",
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {isCart && cartQuantity > 0 ? (
                  <CartBadge
                    quantity={cartQuantity}
                    className="absolute -right-2 -top-2 border-2 border-white"
                  />
                ) : null}
              </div>
              <span className={cn("text-xs", isActive && "font-semibold")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Components
// ─────────────────────────────────────────────────────────────────────────────

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

function MobileProductGallery({ images }: { images: GalleryImage[] }) {
  return (
    <div className="bg-white px-4 pb-6 pt-4">
      <Suspense fallback={<GalleryFallback />}>
        <Gallery images={images} />
      </Suspense>
    </div>
  );
}

function MobileProductSummary({ product }: { product: Product }) {
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

function MobileDetailList({ detailRows }: { detailRows: ProductDetailRow[] }) {
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

function MobileGuidelines({
  sections,
}: {
  sections: GuidelineSection[];
}) {
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
    <section className="space-y-4 overflow-hidden bg-white px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">搭配推荐</h2>
        <Link
          href="/search"
          aria-hidden
          tabIndex={-1}
          className="hidden text-xs font-medium text-teal-600 transition"
        >
          浏览更多
        </Link>
      </div>
      <div
        className="flex gap-4 overflow-x-auto pb-1"
        style={{ contain: "layout paint" }}
      >
        {products.map((product) => (
          <div key={product.id} className="w-64 shrink-0">
            <ProductCard
              product={product}
              compact
              actionSlot={<ProductCardQuickAdd product={product} />}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────────────────────

export function MobileProductPageClient({
  product,
  productJsonLd,
  images,
  recommended,
  detailRows,
  guidelineSections,
}: MobileProductPageClientProps) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-neutral-50">
      {/* Fixed Header */}
      <ProductPageHeader />

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="flex flex-col gap-4 pb-4">
          <MobileProductGallery images={images} />
          <MobileProductSummary product={product} />
          <ReassuranceNotice className="mx-4" />
          <MobileDetailList detailRows={detailRows} />
          <MobileGuidelines sections={guidelineSections} />
          <MobileDescription product={product} />
          <MobileRecommendations products={recommended} />
        </div>
      </main>

      {/* Fixed Purchase Bar */}
      <ProductPurchaseBar product={product} />

      {/* Fixed Bottom Navigation */}
      <ProductBottomNav />
    </div>
  );
}
