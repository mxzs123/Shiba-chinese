"use client";

import { useMemo, useState, useTransition } from "react";

import PrimaryButton from "@/app/_shared/PrimaryButton";
import type { NewsArticle } from "@/lib/api/types";

import { MobileNewsArticleCard } from "./mobile-card";

type MobileNewsListProps = {
  articles: NewsArticle[];
  initialCount?: number;
  step?: number;
};

const DEFAULT_INITIAL_COUNT = 6;
const DEFAULT_STEP = 3;

export function MobileNewsList({
  articles,
  initialCount = DEFAULT_INITIAL_COUNT,
  step = DEFAULT_STEP,
}: MobileNewsListProps) {
  const safeInitialCount = Math.max(initialCount, 0);
  const safeStep = Math.max(step, 1);

  const [visibleCount, setVisibleCount] = useState(
    Math.min(safeInitialCount, articles.length),
  );
  const [isPending, startTransition] = useTransition();

  const visibleArticles = useMemo(
    () => articles.slice(0, visibleCount),
    [articles, visibleCount],
  );

  const hasMore = visibleCount < articles.length;

  const handleLoadMore = () => {
    if (!hasMore || isPending) {
      return;
    }

    startTransition(() => {
      setVisibleCount((current) =>
        Math.min(current + safeStep, articles.length),
      );
    });
  };

  if (!articles.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-neutral-200 bg-white/70 px-6 py-16 text-center text-sm text-neutral-500">
        <span className="text-base font-semibold text-neutral-700">
          暂无资讯内容
        </span>
        <span>欢迎稍后再来查看最新动态。</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {visibleArticles.map((article) => (
          <MobileNewsArticleCard key={article.id} article={article} />
        ))}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <PrimaryButton
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="h-11 rounded-full px-6 text-sm font-semibold shadow-none"
            aria-live="polite"
          >
            {isPending ? "加载中..." : "加载更多"}
          </PrimaryButton>
        </div>
      ) : null}
    </div>
  );
}

export default MobileNewsList;
