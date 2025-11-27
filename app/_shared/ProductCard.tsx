import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import type { Product } from "lib/api/types";
import { isDiscountedPrice } from "lib/pricing";
import { cn } from "lib/utils";

import { ProductCardPrice } from "./ProductCardPrice";

export type ProductCardProps = {
  product: Product;
  href?: string;
  className?: string;
  actionSlot?: ReactNode;
  hideDescription?: boolean;
  compact?: boolean; // 移动端紧凑样式
  imageFit?: "contain" | "cover"; // 图片铺放策略（默认 contain，保证整图可见）
};

export function ProductCard({
  product,
  href = `/product/${product.handle}`,
  className,
  actionSlot,
  hideDescription = false,
  compact = false,
  imageFit = "contain",
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
        {/*
         * 统一商品缩略图容器为正方形，使用 object-contain，确保各比例图片完整显示。
         * 适当内边距避免贴边裁切的观感问题。
         */}
        <div className="relative block aspect-square w-full overflow-hidden bg-neutral-50 p-2 sm:p-3">
          {hasDiscount ? (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-full bg-emerald-500/95 px-2 py-1 text-[11px] font-semibold text-white shadow-sm">
              芝园价
            </span>
          ) : null}
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText}
              width={featuredImage.width || 600}
              height={featuredImage.height || 600}
              sizes="(min-width: 1024px) 280px, 50vw"
              className={cn(
                "h-full w-full",
                imageFit === "cover"
                  ? "object-cover"
                  : "object-contain object-center",
              )}
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
            "flex flex-col pb-0",
            compact ? "gap-1.5 px-3 pt-3" : "gap-2 px-4 pt-4",
          )}
        >
          <div className={cn(compact ? "space-y-1" : "space-y-1.5")}>
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
        <ProductCardPrice
          value={currentPrice}
          originalValue={originalPrice}
          compact={compact}
        />
        {actionSlot ? actionSlot : null}
      </div>
    </article>
  );
}
