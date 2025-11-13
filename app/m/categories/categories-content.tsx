"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import type { SearchCategory } from "app/_shared/search/config";
import type { Product, ProductVariant } from "lib/api/types";
import { cn } from "lib/utils";
import { Price } from "app/_shared/Price";
import { isDiscountedPrice } from "lib/pricing";
import { addItem } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { handleError } from "lib/error-handler";

type MobileCategoriesContentProps = {
  categoryTree: SearchCategory[];
  flatCategories: SearchCategory[];
  initialCategory: string;
  initialParent: string;
  initialProducts: Product[];
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
  categoryTree,
  flatCategories,
  initialCategory,
  initialParent,
  initialProducts,
}: MobileCategoriesContentProps) {
  const router = useRouter();
  const { addCartItem } = useCart();
  const [, startTransition] = useTransition();
  const resolvedInitialCategory =
    (initialCategory &&
      flatCategories.find((category) => category.slug === initialCategory)
        ?.slug) ||
    flatCategories[0]?.slug ||
    "";
  const firstParentSlug = categoryTree[0]?.slug || "";
  const resolvedInitialParent =
    (initialParent &&
      categoryTree.find((category) => category.slug === initialParent)?.slug) ||
    flatCategories.find((category) => category.slug === resolvedInitialCategory)
      ?.parentSlug ||
    firstParentSlug;
  const [selectedCategory, setSelectedCategory] = useState(
    resolvedInitialCategory,
  );
  const [selectedParent, setSelectedParent] = useState(
    resolvedInitialParent || firstParentSlug,
  );
  const categoryMap = useMemo(() => {
    const map = new Map<string, SearchCategory>();
    flatCategories.forEach((category) => {
      map.set(category.slug, category);
    });
    return map;
  }, [flatCategories]);
  useEffect(() => {
    setSelectedCategory(resolvedInitialCategory);
  }, [resolvedInitialCategory]);
  useEffect(() => {
    setSelectedParent(resolvedInitialParent || firstParentSlug);
  }, [resolvedInitialParent, firstParentSlug]);
  const commitStateToUrl = useCallback(
    (categorySlug: string) => {
      const params = new URLSearchParams();
      if (categorySlug) {
        params.set("category", categorySlug);
      }
      const queryString = params.toString();
      router.push(queryString ? `/categories?${queryString}` : "/categories");
    },
    [router],
  );

  const handleParentSelect = (parentSlug: string) => {
    const parentCategory = categoryMap.get(parentSlug);
    const fallbackSlug = parentCategory?.children?.[0]?.slug || parentSlug;
    setSelectedParent(parentSlug);
    setSelectedCategory(fallbackSlug);
    commitStateToUrl(fallbackSlug);
  };

  const handleCategorySelect = (categorySlug: string) => {
    const category = categoryMap.get(categorySlug);
    const parentSlugForCategory =
      category?.parentSlug || category?.slug || firstParentSlug;
    setSelectedCategory(categorySlug);
    setSelectedParent(parentSlugForCategory);
    commitStateToUrl(categorySlug);
  };

  const currentCategory = selectedCategory
    ? categoryMap.get(selectedCategory)
    : undefined;
  const currentParentSlug =
    selectedParent ||
    currentCategory?.parentSlug ||
    currentCategory?.slug ||
    firstParentSlug;
  const currentParent =
    categoryMap.get(currentParentSlug) ||
    categoryTree.find((category) => category.slug === currentParentSlug);
  const childCategories = currentParent?.children ?? [];

  const handleQuickAdd = useCallback(
    async (
      e: MouseEvent,
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
        // 将乐观更新置于 transition 内，符合 Next 15 的 useOptimistic 约束。
        startTransition(() => {
          addCartItem(primaryVariant, product, 1);
        });
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
        handleError(error, { action: "loadCategories" }, false);
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
          {categoryTree.map((category) => {
            const isActive = selectedParent === category.slug;

            return (
              <button
                key={category.slug}
                onClick={() => handleParentSelect(category.slug)}
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

          {/* 子分类筛选 */}
          {childCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleCategorySelect(currentParent?.slug || currentParentSlug)
                }
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory ===
                    (currentParent?.slug || currentParentSlug)
                    ? "bg-primary text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                )}
              >
                {currentParent?.label ? `全部${currentParent.label}` : "全部"}
              </button>
              {childCategories.map((child) => {
                const isActive = selectedCategory === child.slug;
                return (
                  <button
                    key={child.slug}
                    onClick={() => handleCategorySelect(child.slug)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                    )}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 商品网格 */}
          {initialProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {initialProducts.map((product) => {
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
            {/*
             * 移动端商品卡片缩略图：统一正方形容器，使用 object-contain，
             * 保证不同长宽比图片完整可见，背景与内边距与桌面一致。
             */}
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 p-2">
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
                          className="object-contain object-center"
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
