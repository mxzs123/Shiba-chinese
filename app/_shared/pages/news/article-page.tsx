import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import Prose from "components/prose";
import { getNews, getNewsArticle } from "lib/api";

import { HomeQuickCategoryShortcuts } from "../home/HomeQuickCategoryShortcuts";

type PageParams = Promise<{ slug: string }>;

export async function generateMetadata(props: {
  params: PageParams;
}): Promise<Metadata> {
  const params = await props.params;
  const article = await getNewsArticle(params.slug);

  if (!article) return notFound();

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary,
    openGraph: {
      type: "article",
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.summary,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export async function generateStaticParams() {
  const articles = await getNews();
  return articles.map((article) => ({ slug: article.slug }));
}

export async function NewsArticlePage(props: { params: PageParams }) {
  const params = await props.params;
  const article = await getNewsArticle(params.slug);

  if (!article) return notFound();

  const publishedAt = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(article.publishedAt));

  return (
    <>
      <HomeQuickCategoryShortcuts className="pb-6" />
      <article className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:px-0">
        <header className="flex flex-col gap-3 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#049e6b]">
            芝园资讯
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
            <time>{publishedAt}</time>
            {article.tags?.length ? (
              <span className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-600"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </header>

        <Prose className="mb-12" html={article.bodyHtml} />

        <footer className="mt-12 flex flex-col gap-4 rounded-2xl border border-[#049e6b]/20 bg-[#049e6b]/5 px-6 py-5 text-sm text-neutral-700">
          <span>
            如需进一步了解药品信息或个性化方案，可联系执业药师获取建议。
          </span>
          <span>
            返回
            <Link
              href="/news"
              className="ml-1 inline-flex items-center font-medium text-[#049e6b] underline-offset-4 hover:underline"
            >
              新闻资讯列表
            </Link>
            ，继续浏览更多内容。
          </span>
        </footer>
      </article>
    </>
  );
}

export default NewsArticlePage;
