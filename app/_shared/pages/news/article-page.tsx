import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import Prose from "components/prose";
import { getNews, getNewsArticle } from "lib/api";
import type { NewsArticle } from "lib/api/types";

import { HomeQuickCategoryShortcuts } from "../home/HomeQuickCategoryShortcuts";
import { NewsArticleCard } from "./NewsArticleCard";

type PageParams = Promise<{ slug: string }>;

const JAPAN_MEDICAL_SUPPORT_SLUG = "japan-medical-support";
const JAPAN_MEDICAL_SUPPORT_TAG = "赴日就诊";

export async function generateMetadata(props: {
  params: PageParams;
}): Promise<Metadata> {
  const params = await props.params;

  const article = await getNewsArticle(params.slug);

  if (!article) return notFound();

  const base = {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary,
  } satisfies Pick<Metadata, "title" | "description">;

  if (params.slug === JAPAN_MEDICAL_SUPPORT_SLUG) {
    return {
      ...base,
      openGraph: {
        type: "website",
        title: base.title,
        description: base.description,
      },
    };
  }

  return {
    ...base,
    openGraph: {
      type: "article",
      title: base.title,
      description: base.description,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  };
}

export async function generateStaticParams() {
  const articles = await getNews();
  return articles.map((article) => ({ slug: article.slug }));
}

function formatPublishedAt(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildJapanMedicalSupportArticles(all: NewsArticle[]) {
  const intro = all.find((article) => article.slug === JAPAN_MEDICAL_SUPPORT_SLUG);
  const related = all.filter((article) => {
    if (article.slug === JAPAN_MEDICAL_SUPPORT_SLUG) return false;
    return article.tags?.includes(JAPAN_MEDICAL_SUPPORT_TAG);
  });

  return { intro, related } as {
    intro?: NewsArticle;
    related: NewsArticle[];
  };
}

export async function NewsArticlePage(props: { params: PageParams }) {
  const params = await props.params;

  if (params.slug === JAPAN_MEDICAL_SUPPORT_SLUG) {
    const allArticles = await getNews();
    const { intro, related } = buildJapanMedicalSupportArticles(allArticles);

    if (!intro && !related.length) {
      return notFound();
    }

    const publishedAt = intro ? formatPublishedAt(intro.publishedAt) : undefined;

    return (
      <>
        <HomeQuickCategoryShortcuts className="pb-6" />
        <section className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:px-0">
          <header className="flex flex-col gap-3 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#049e6b]">
              赴日就诊专题
            </p>
            <h1 className="text-3xl font-bold text-neutral-900 md:text-4xl">
              {intro?.title || "赴日就诊一站式服务"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
              {publishedAt ? <time>{publishedAt}</time> : null}
              {intro?.tags?.length ? (
                <span className="flex flex-wrap gap-2">
                  {intro.tags.map((tag) => (
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
            {intro?.summary ? (
              <p className="max-w-3xl text-sm text-neutral-600">
                {intro.summary}
              </p>
            ) : null}
          </header>

          {intro?.bodyHtml ? (
            <Prose className="mb-12" html={intro.bodyHtml} />
          ) : null}

          <section className="mt-4 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-neutral-900">
                专题文章
              </h2>
              <Link
                href="/news"
                className="inline-flex items-center text-sm font-medium text-[#049e6b] underline-offset-4 hover:underline"
              >
                返回资讯中心
              </Link>
            </div>

            {related.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {related.map((article) => (
                  <NewsArticleCard
                    key={article.id}
                    article={article}
                    summaryClamp={3}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-sm text-neutral-500">
                相关内容正在整理中，稍后将为你更新更多赴日就诊案例与攻略。
              </div>
            )}
          </section>
        </section>
      </>
    );
  }

  const article = await getNewsArticle(params.slug);

  if (!article) return notFound();

  const publishedAt = formatPublishedAt(article.publishedAt);

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
