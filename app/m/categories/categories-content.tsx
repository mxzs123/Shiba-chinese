"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { POPULAR_CATEGORY_LINKS } from "app/_shared/pages/home/categories";
import { cn } from "lib/utils";

export function MobileCategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "pharmacy";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleCategorySelect = (href: string, label: string) => {
    // 提取分类标识
    const categoryId = href.includes("/search/")
      ? href.split("/search/")[1] || label
      : label;

    setSelectedCategory(categoryId);
    router.push(href);
  };

  const currentCategory = POPULAR_CATEGORY_LINKS.find((c) => {
    const categoryId = c.href.includes("/search/")
      ? c.href.split("/search/")[1] || c.label
      : c.label;
    return categoryId === selectedCategory;
  });

  return (
    <>
      {/* 左侧分类导航 */}
      <aside className="w-24 flex-none overflow-y-auto border-r border-neutral-200 bg-neutral-50">
        <nav className="flex flex-col">
          {POPULAR_CATEGORY_LINKS.map((category) => {
            const categoryId = category.href.includes("/search/")
              ? category.href.split("/search/")[1] || category.label
              : category.label;
            const isActive = selectedCategory === categoryId;

            return (
              <button
                key={category.href}
                onClick={() =>
                  handleCategorySelect(category.href, category.label)
                }
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
        <div className="p-4">
          <div className="mb-4">
            <h1 className="text-lg font-semibold">
              {currentCategory?.label || "所有商品"}
            </h1>
            <p className="text-sm text-neutral-500">
              {currentCategory?.description}
            </p>
          </div>

          {/* 商品列表占位 - 后续实现 */}
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50">
            <p className="text-sm text-neutral-500">商品列表将在此处展示</p>
          </div>
        </div>
      </main>
    </>
  );
}
