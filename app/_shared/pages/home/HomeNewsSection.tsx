import Link from "next/link";

import { getLatestNews } from "lib/api";

import { NewsArticleCard } from "../news/NewsArticleCard";

type HomeNewsSectionProps = {
  title?: string;
  subtitle?: string;
  limit?: number;
  viewAllHref?: string;
};

const DEFAULT_TITLE = "最新资讯与优惠";
const DEFAULT_SUBTITLE = "关注医师提醒、促销活动与会员权益更新，跟进最新健康资讯";
const DEFAULT_LIMIT = 3;
const DEFAULT_VIEW_ALL = "/news";

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
        {items.map((article) => (
          <NewsArticleCard key={article.id} article={article} summaryClamp={3} />
        ))}
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
