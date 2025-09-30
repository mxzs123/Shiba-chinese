import Link from "next/link";

import type { NewsArticle } from "lib/api/types";
import { cn } from "lib/utils";

type NewsArticleCardProps = {
  article: NewsArticle;
  className?: string;
  summaryClamp?: number;
};

export function NewsArticleCard({
  article,
  className,
  summaryClamp = 3,
}: NewsArticleCardProps) {
  const publishedAt = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(article.publishedAt));

  const clampClass =
    summaryClamp <= 0
      ? undefined
      : summaryClamp === 2
        ? "line-clamp-2"
        : summaryClamp === 4
          ? "line-clamp-4"
          : "line-clamp-3";

  return (
    <Link
      href={article.href}
      className={cn(
        "group flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-[#049e6b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <time className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {publishedAt}
        </time>
        {article.highlight ? (
          <span className="rounded-full bg-[#049e6b]/10 px-2 py-0.5 text-xs font-semibold text-[#049e6b]">
            推荐
          </span>
        ) : null}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-[#049e6b]">
        {article.title}
      </h3>
      <p className={cn("flex-1 text-sm text-neutral-600", clampClass)}>
        {article.summary}
      </p>
      {article.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 transition group-hover:bg-[#049e6b]/10 group-hover:text-[#049e6b]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export default NewsArticleCard;
