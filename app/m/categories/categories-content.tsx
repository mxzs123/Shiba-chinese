"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { POPULAR_CATEGORY_LINKS } from "app/_shared/pages/home/categories";
import { DESKTOP_SEARCH_CATEGORIES } from "app/_shared/search/config";
import type { Product, ProductVariant } from "lib/api/types";
import { cn } from "lib/utils";
import { Price } from "app/_shared/Price";
import { isDiscountedPrice } from "lib/pricing";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";

type MobileCategoriesContentProps = {
  initialProducts: Product[];
  allTags: string[];
  selectedTag?: string;
};

function getPrimaryVariant(product: Product): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  const availableVariant = product.variants.find(
    (variant) => variant.availableForSale,
  );

  return availableVariant ?? product.variants[0];
}

export function MobileCategoriesContent({
  initialProducts,
  allTags,
  selectedTag: initialSelectedTag,
}: MobileCategoriesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "pharmacy";
  const { addCartItem } = useCart();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | undefined>(
    initialSelectedTag,
  );

  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setSelectedTag(undefined);
    router.push(`/categories?category=${categorySlug}`);
  };

  const handleTagSelect = (tag: string) => {
    const newTag = selectedTag === tag ? undefined : tag;
    setSelectedTag(newTag);

    const params = new URLSearchParams();
    params.set("category", selectedCategory);
    if (newTag) {
      params.set("tag", newTag);
    }
    router.push(`/categories?${params.toString()}`);
  };

  const currentCategory = DESKTOP_SEARCH_CATEGORIES.find(
    (c) => c.slug === selectedCategory,
  );

  const filteredProducts = useMemo(() => {
    if (!selectedTag) return initialProducts;
    return initialProducts.filter((product) =>
      product.tags.includes(selectedTag),
    );
  }, [initialProducts, selectedTag]);

  const handleQuickAdd = useCallback(
    async (
      e: React.MouseEvent,
      product: Product,
      primaryVariant: ProductVariant | undefined,
    ) => {
      e.preventDefault();
      e.stopPropagation();

      const isUnavailable =
        !product.availableForSale || !primaryVariant?.availableForSale;

      if (isUnavailable) {
        toast.error("暂不可购买", {
          description: "该商品当前缺货，请稍后再试。",
        });
        return;
      }

      if (!primaryVariant) {
        toast.error("未能加入购物车", {
          description: "未找到可用的商品信息，请稍后再试。",
        });
        return;
      }

      try {
        addCartItem(primaryVariant, product, 1);
        const result = await addItem(null, primaryVariant.id, 1);

        if (typeof result === "string") {
          toast.error("未能加入购物车", {
            description: "系统繁忙，请稍后再试。",
          });
          return;
        }

        toast.success("已加入购物车", {
          description: `${product.title} × 1`,
        });
      } catch (error) {
        console.error(error);
        toast.error("未能加入购物车", {
          description: "系统繁忙，请稍后再试。",
        });
      }
    },
    [addCartItem],
  );

  return (
    <>
      {/* 左侧分类导航 */}
      <aside className="w-24 flex-none overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <nav className="flex flex-col">
          {DESKTOP_SEARCH_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category.slug;

            return (
              <button
                key={category.slug}
                onClick={() => handleCategorySelect(category.slug)}
                className={cn(
                  "flex min-h-[4rem] flex-col items-center justify-center gap-1 border-l-2 px-2 py-3 text-center text-xs transition-colors",
                  isActive
                    ? "border-primary bg-white font-semibold text-primary"
                    : "border-transparent text-neutral-600 hover:bg-white hover:text-neutral-900",
                )}
              >
                <span className="break-all">{category.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 右侧内容区 */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          {/* 分类标题 */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {currentCategory?.label || "所有商品"}
              </h1>
              <span className="flex items-center gap-1 text-xs text-neutral-400">
                <ShoppingCart className="h-3 w-3" />
                <span>可快速加购</span>
              </span>
            </div>
            <p className="text-sm text-neutral-500">
              {currentCategory?.description}
            </p>
          </div>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}

          {/* 商品网格 */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const currentPrice = product.priceRange.minVariantPrice;
                const originalPrice = product.priceRange.minCompareAtPrice;
                const hasDiscount = isDiscountedPrice(
                  currentPrice,
                  originalPrice,
                );
                const primaryVariant = getPrimaryVariant(product);

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.handle}`}
                    className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="relative aspect-square w-full overflow-hidden">
                      {hasDiscount && (
                        <span className="absolute left-2 top-2 z-10 inline-flex items-center rounded-full bg-emerald-500/95 px-2 py-0.5 text-[10px] font-semibold text-white">
                          芝园价
                        </span>
                      )}
                      {product.featuredImage ? (
                        <Image
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText}
                          fill
                          sizes="(max-width: 768px) 50vw, 280px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-neutral-100 text-neutral-500">
                          <span className="text-xs">暂无图片</span>
                        </div>
                      )}
                      {/* 快速加购按钮 */}
                      <button
                        onClick={(e) =>
                          handleQuickAdd(e, product, primaryVariant)
                        }
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md active:scale-95"
                        aria-label="加入购物车"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-neutral-700" />
                      </button>
                    </div>
                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="text-sm font-medium text-neutral-900 line-clamp-2">
                        {product.title}
                      </h3>
                      <div className="mt-auto pt-2">
                        <Price
                          value={currentPrice}
                          originalValue={originalPrice}
                          className={cn(
                            "text-sm font-semibold",
                            hasDiscount
                              ? "text-emerald-600"
                              : "text-neutral-900",
                          )}
                          currencyClassName={cn(
                            "text-[9px] font-medium uppercase",
                            hasDiscount
                              ? "text-emerald-600/80"
                              : "text-neutral-400",
                          )}
                          showConvertedPrice
                          badge=""
                          convertedPrefix=""
                          convertedClassName="text-[10px] font-medium text-neutral-500"
                          convertedCurrencyClassName="text-[8px] font-medium uppercase text-neutral-400"
                          originalClassName="text-xs font-medium text-neutral-400 line-through"
                          originalCurrencyClassName="text-[9px] font-medium uppercase text-neutral-400/80"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50">
              <p className="text-sm text-neutral-500">暂无商品</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
