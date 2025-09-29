import Link from "next/link";

import { getNews } from "lib/api";

import { HomeQuickCategoryShortcuts } from "../home/HomeQuickCategoryShortcuts";
import { NewsArticleCard } from "./NewsArticleCard";

export const metadata = {
  title: "资讯中心",
  description: "查看芝园药局的最新用药提醒、促销活动与健康资讯。",
};

export async function NewsIndexPage() {
  const articles = await getNews();

  return (
    <>
      <HomeQuickCategoryShortcuts className="pb-6" />
      <section className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pt-8 pb-10 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 text-neutral-900">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#049e6b]">
            资讯中心
          </p>
          <h1 className="text-3xl font-bold md:text-4xl">芝园新闻与健康指南</h1>
          <p className="max-w-3xl text-sm text-neutral-600">
            关注最新的用药提醒、专家解读与会员专属优惠，了解芝园药局的动态与服务升级。
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <NewsArticleCard
              key={article.id}
              article={article}
              summaryClamp={4}
            />
          ))}
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#049e6b]/20 bg-[#049e6b]/5 px-6 py-4 text-sm text-neutral-700">
          <span>
            想获取更多专业内容？欢迎关注我们的
            <span className="font-semibold"> 健康研究院专栏</span>。
          </span>
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-full border border-[#049e6b] px-4 py-2 text-sm font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
          >
            浏览相关商品
          </Link>
        </footer>
      </section>
    </>
  );
}

export default NewsIndexPage;
