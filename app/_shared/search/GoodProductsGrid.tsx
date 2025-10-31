import Image from "next/image";

import type { GoodProduct } from "lib/api/types";

export type GoodProductsGridProps = {
  products: GoodProduct[];
  emptyMessage: string;
};

function formatPrice(value: number | string | undefined) {
  const parsed = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(parsed)) {
    return "—";
  }

  return `¥${parsed.toLocaleString("zh-CN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function GoodProductsGrid({
  products,
  emptyMessage,
}: GoodProductsGridProps) {
  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-12 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => {
        const cover = product.image || product.images || "/static/images/common/empty.png";

        return (
          <article
            key={product.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:border-[#049e6b]/50 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
              <Image
                src={cover}
                alt={product.name}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
                priority={false}
                unoptimized
              />
            </div>
            <div className="flex flex-1 flex-col gap-2 px-4 py-5">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#049e6b]">
                  分类 #{product.goodsCategoryId}
                </p>
                <h3 className="line-clamp-2 text-base font-semibold text-neutral-900">
                  {product.name}
                </h3>
                {product.brief ? (
                  <p className="line-clamp-2 text-xs text-neutral-500">
                    {product.brief}
                  </p>
                ) : null}
              </div>
              <div className="mt-auto pt-4">
                <p className="text-lg font-semibold text-neutral-900">
                  {formatPrice(product.price)}
                  {product.unit ? <span className="ml-1 text-xs text-neutral-500">/{product.unit}</span> : null}
                </p>
                {product.bn ? (
                  <p className="mt-1 text-xs text-neutral-400">货号：{product.bn}</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default GoodProductsGrid;
