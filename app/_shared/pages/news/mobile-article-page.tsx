export { generateMetadata, generateStaticParams } from "./article-page";

import Link from "next/link";
import { notFound } from "next/navigation";

import MobileContentContainer from "@/app/_shared/layouts/mobile-content-container";
import { MobileHeader } from "@/components/layout/mobile-header";
import MobileProse from "@/components/prose-mobile";
import { getNews, getNewsArticle, getNotifications } from "@/lib/api";

import { MobileNewsList } from "./mobile-list";

type PageParams = Promise<{ slug: string }>;

const JAPAN_MEDICAL_SUPPORT_SLUG = "japan-medical-support";
const JAPAN_MEDICAL_SUPPORT_TAG = "赴日就诊";

export default async function SharedMobileNewsArticlePage(props: {
  params: PageParams;
}) {
  const params = await props.params;

  if (params.slug === JAPAN_MEDICAL_SUPPORT_SLUG) {
    const [intro, allArticles, notifications] = await Promise.all([
      getNewsArticle(JAPAN_MEDICAL_SUPPORT_SLUG),
      getNews(),
      getNotifications(),
    ]);

    const related = allArticles.filter((article) => {
      if (article.slug === JAPAN_MEDICAL_SUPPORT_SLUG) return false;
      return article.tags?.includes(JAPAN_MEDICAL_SUPPORT_TAG);
    });

    if (!intro && !related.length) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-neutral-50">
        <MobileHeader notifications={notifications} leadingVariant="back" />
        <MobileContentContainer className="space-y-6 pb-16 pt-6">
          <section className="space-y-6">
            <header className="space-y-3 text-neutral-900">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                赴日就诊专题
              </span>
              <h1 className="text-2xl font-semibold leading-snug">
                {intro?.title || "赴日就诊一站式服务"}
              </h1>
              {intro?.summary ? (
                <p className="text-sm leading-6 text-neutral-600">
                  {intro.summary}
                </p>
              ) : null}
            </header>

            {intro?.bodyHtml ? (
              <MobileProse html={intro.bodyHtml} className="mb-2" />
            ) : null}

            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral-900">
                  专题文章
                </h2>
                <Link
                  href="/m/news"
                  className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                >
                  全部资讯
                </Link>
              </div>

              {related.length ? (
                <MobileNewsList
                  articles={related}
                  initialCount={6}
                  step={3}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-neutral-200 bg-white/70 px-6 py-10 text-center text-sm text-neutral-500">
                  <p className="font-semibold text-neutral-700">
                    相关内容正在整理中
                  </p>
                  <p>稍后将为你更新更多赴日就诊案例与就诊攻略。</p>
                </div>
              )}
            </section>
          </section>
        </MobileContentContainer>
      </div>
    );
  }

  const [article, notifications] = await Promise.all([
    getNewsArticle(params.slug),
    getNotifications(),
  ]);

  if (!article) {
    notFound();
  }

  const publishedAt = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen bg-neutral-50">
      <MobileHeader notifications={notifications} leadingVariant="back" />
      <MobileContentContainer className="space-y-6 pb-16 pt-6">
        <article className="space-y-6">
          <header className="space-y-3 text-neutral-900">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              芝园资讯
            </span>
            <h1 className="text-2xl font-semibold leading-snug">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <time className="rounded-full bg-neutral-100 px-2 py-1 font-medium uppercase tracking-wide text-neutral-600">
                {publishedAt}
              </time>
              {article.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </header>

          <MobileProse html={article.bodyHtml} className="mb-2" />

          <footer className="space-y-3 rounded-3xl border border-primary/20 bg-primary/5 px-5 py-5 text-sm text-neutral-700">
            <p>如需进一步了解药品信息或个性化方案，可联系执业药师获取建议。</p>
            <p>
              返回
              <Link
                href="/m/news"
                className="ml-1 inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 hover:underline"
              >
                新闻资讯列表
              </Link>
              ，继续浏览更多内容。
            </p>
          </footer>
        </article>
      </MobileContentContainer>
    </div>
  );
}
