import Link from "next/link";

import type { NewsArticle } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type MobileNewsArticleCardProps = {
  article: NewsArticle;
  className?: string;
};

export function MobileNewsArticleCard({
  article,
  className,
}: MobileNewsArticleCardProps) {
  const publishedAt = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(article.publishedAt));

  const href = `/m/news/${article.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
        <time className="font-medium uppercase tracking-[0.14em]">
          {publishedAt}
        </time>
        {article.highlight ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            推荐
          </span>
        ) : null}
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-neutral-900 transition-colors group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">
        {article.summary}
      </p>
      {article.tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-600 transition group-hover:bg-primary/10 group-hover:text-primary"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}

export default MobileNewsArticleCard;
