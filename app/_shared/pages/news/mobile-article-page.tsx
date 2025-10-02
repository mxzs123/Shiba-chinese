export { generateMetadata, generateStaticParams } from "./article-page";

import Link from "next/link";
import { notFound } from "next/navigation";

import MobileContentContainer from "@/app/_shared/layouts/mobile-content-container";
import { MobileHeader } from "@/components/layout/mobile-header";
import MobileProse from "@/components/prose-mobile";
import { getNewsArticle, getNotifications } from "@/lib/api";

type PageParams = Promise<{ slug: string }>;

export default async function SharedMobileNewsArticlePage(props: {
  params: PageParams;
}) {
  const params = await props.params;
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
                href="/news"
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
