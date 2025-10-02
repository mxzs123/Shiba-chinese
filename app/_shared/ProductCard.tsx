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
  hideDescription?: boolean;
  compact?: boolean; // 移动端紧凑样式
};

export function ProductCard({
  product,
  href = `/product/${product.handle}`,
  className,
  actionSlot,
  hideDescription = false,
  compact = false,
}: ProductCardProps) {
  const { featuredImage, priceRange } = product;
  const currentPrice = priceRange.minVariantPrice;
  const originalPrice = priceRange.minCompareAtPrice;
  const hasDiscount = isDiscountedPrice(currentPrice, originalPrice);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={product.title}
        className="group flex flex-1 flex-col focus:outline-none"
      >
        <div className="relative block aspect-square w-full overflow-hidden">
          {hasDiscount ? (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-emerald-500/95 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
              芝园价
            </span>
          ) : null}
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
        <div
          className={cn(
            "flex flex-1 flex-col pb-0",
            compact ? "gap-2 p-3" : "gap-2.5 p-4",
          )}
        >
          <div className={cn("flex-1", compact ? "space-y-1" : "space-y-1.5")}>
            <h3
              className={cn(
                "font-medium text-neutral-900 line-clamp-2",
                compact ? "text-sm" : "text-base",
              )}
            >
              {product.title}
            </h3>
            {!hideDescription && (
              <p
                className={cn(
                  "mt-0.5 text-neutral-500 line-clamp-2",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {product.description}
              </p>
            )}
          </div>
        </div>
      </Link>
      <div
        className={cn(
          "flex flex-col pt-2",
          compact ? "gap-2 p-3" : "gap-2.5 p-4",
        )}
      >
        <Price
          value={currentPrice}
          originalValue={originalPrice}
          className={cn(
            "text-base font-semibold",
            hasDiscount ? "text-emerald-600" : "text-neutral-900",
          )}
          currencyClassName={cn(
            "text-[10px] font-medium uppercase",
            hasDiscount ? "text-emerald-600/80" : "text-neutral-400",
          )}
          showConvertedPrice
          badge=""
          convertedPrefix=""
          convertedClassName="text-[11px] font-medium text-neutral-500"
          convertedCurrencyClassName="text-[9px] font-medium uppercase text-neutral-400"
          originalClassName="text-xs font-medium text-neutral-400 line-through"
          originalCurrencyClassName="text-[10px] font-medium uppercase text-neutral-400/80"
          originalConvertedPrefix=""
          originalConvertedClassName="text-[11px] font-medium text-neutral-400"
          originalConvertedCurrencyClassName="text-[9px] font-medium uppercase text-neutral-400/60"
          badgeClassName=""
        />
        {actionSlot ? actionSlot : null}
      </div>
    </article>
  );
}
