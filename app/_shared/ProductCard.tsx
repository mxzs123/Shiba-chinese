import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

import type { Product } from "lib/api/types";
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

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={product.title}
        className="relative block aspect-square w-full overflow-hidden"
      >
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText}
            fill
            sizes="(min-width: 1024px) 280px, 50vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-500">
            <span className="text-sm">暂无图片</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex-1">
          <h3 className="text-base font-medium text-neutral-900 line-clamp-2 dark:text-neutral-100">
            {product.title}
          </h3>
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2 dark:text-neutral-400">
            {product.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Price
            value={priceRange.minVariantPrice}
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
          />
          {actionSlot}
        </div>
      </div>
    </article>
  );
}
