import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import type { Product } from "lib/api/types";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";

import { Price } from "./Price";

export type ProductCardProps = {
  product: Product;
  href?: string;
  className?: string;
  actionSlot?: ReactNode;
};

export function ProductCard({
  product,
  href = `/product/${product.handle}`,
  className,
  actionSlot,
}: ProductCardProps) {
  const { featuredImage, priceRange } = product;
  const currentPrice = priceRange.minVariantPrice;
  const originalPrice = priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(currentPrice, originalPrice);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={product.title}
        className="group flex flex-1 flex-col focus:outline-none"
      >
        <div className="relative block aspect-square w-full overflow-hidden">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText}
              fill
              sizes="(min-width: 1024px) 280px, 50vw"
              className="object-cover"
              priority={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-500">
              <span className="text-sm">暂无图片</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 pb-0">
          <div className="flex-1 space-y-2">
            <h3 className="text-base font-medium text-neutral-900 line-clamp-2 dark:text-neutral-100">
              {product.title}
            </h3>
            <p className="mt-1 text-sm text-neutral-500 line-clamp-2 dark:text-neutral-400">
              {product.description}
            </p>
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-3 p-4 pt-3">
        <Price
          value={currentPrice}
          originalValue={originalPrice}
          className={cn(
            "text-xl font-semibold",
            hasDiscount
              ? "text-emerald-600 dark:text-emerald-300"
              : "text-neutral-900 dark:text-neutral-50",
          )}
          currencyClassName={cn(
            "text-xs font-medium uppercase tracking-wide",
            hasDiscount
              ? "text-emerald-600/80 dark:text-emerald-300/80"
              : "text-neutral-400",
          )}
          showConvertedPrice
          convertedClassName="text-xs font-medium text-neutral-500 dark:text-neutral-400"
          convertedCurrencyClassName="text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500"
          originalClassName="text-sm font-medium text-neutral-400 line-through dark:text-neutral-500"
          originalCurrencyClassName="text-[11px] font-medium uppercase tracking-wide text-neutral-400/80 dark:text-neutral-500/80"
          originalConvertedClassName="text-xs font-medium text-neutral-400 dark:text-neutral-500"
          originalConvertedCurrencyClassName="text-[10px] font-medium uppercase tracking-wide text-neutral-400/60 dark:text-neutral-500/60"
          badgeClassName="dark:bg-emerald-400/20 dark:text-emerald-100"
        />
        {actionSlot ? actionSlot : null}
      </div>
    </article>
  );
}
