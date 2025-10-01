import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Prose from "components/prose";
import { getPage } from "lib/api";

type PageParams = Promise<{ page: string }>;

export async function generateMetadata(props: {
  params: PageParams;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
  };
}

export async function CmsPage(props: { params: PageParams }) {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) return notFound();

  const hasBodyContent = Boolean(page.body && page.body.trim().length > 0);
  const formattedUpdatedAt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(page.updatedAt));

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 sm:mb-8 sm:text-5xl">
        {page.title}
      </h1>
      {hasBodyContent ? (
        <Prose
          className="max-w-none mb-10 prose-sm text-neutral-800 sm:mb-12 sm:prose-base"
          html={page.body}
        />
      ) : (
        <div className="mb-12 rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center shadow-sm">
          <p className="text-sm leading-6 text-neutral-500">
            页面内容正在整理中，稍后回来查看。
          </p>
        </div>
      )}
      <p className="text-xs italic text-neutral-500 sm:text-sm">
        {`This document was last updated on ${formattedUpdatedAt}.`}
      </p>
    </>
  );
}

export default CmsPage;
