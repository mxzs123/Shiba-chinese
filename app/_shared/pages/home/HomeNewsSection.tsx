import Link from "next/link";

import { getLatestNews } from "lib/api";

type HomeNewsSectionProps = {
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllHref?: string;
};

const DEFAULT_TITLE = "最新资讯与优惠";
const DEFAULT_SUBTITLE = "关注医师提醒、促销活动与会员权益更新，跟进最新健康资讯";
const DEFAULT_LIMIT = 3;
const DEFAULT_VIEW_ALL = "/search";

export async function HomeNewsSection({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  limit = DEFAULT_LIMIT,
  viewAllHref = DEFAULT_VIEW_ALL,
}: HomeNewsSectionProps) {
  const items = await getLatestNews({ limit });

  if (!items.length) {
    return null;
  }

  const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="mx-auto w-full max-w-(--breakpoint-2xl) px-4 pb-12 sm:px-6 lg:px-8">
      <header className="flex items-start justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            资讯速递
          </p>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-3xl text-sm text-neutral-600 dark:text-neutral-300">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          href={viewAllHref}
          className="hidden shrink-0 rounded-full border border-[#049e6b] px-4 py-2 text-sm font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 lg:inline-flex"
        >
          查看更多
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((article) => {
          const publishedAt = dateFormatter.format(new Date(article.publishedAt));
          return (
            <Link
              key={article.id}
              href={article.href}
              className="group flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-[#049e6b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2 dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-center gap-2">
                <time className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {publishedAt}
                </time>
                {article.highlight ? (
                  <span className="rounded-full bg-[#049e6b]/10 px-2 py-0.5 text-xs font-semibold text-[#049e6b]">
                    推荐
                  </span>
                ) : null}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-[#049e6b] dark:text-neutral-100">
                {article.title}
              </h3>
              <p className="flex-1 text-sm text-neutral-600 line-clamp-3 dark:text-neutral-300">
                {article.summary}
              </p>
              {article.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 transition group-hover:bg-[#049e6b]/10 group-hover:text-[#049e6b] dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 lg:hidden">
        <Link
          href={viewAllHref}
          className="inline-flex w-full items-center justify-center rounded-full border border-[#049e6b] px-4 py-2 text-sm font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
        >
          更多资讯
        </Link>
      </div>
    </section>
  );
}

export default HomeNewsSection;
