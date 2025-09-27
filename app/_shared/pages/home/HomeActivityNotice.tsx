import { ArrowUpRight, Megaphone } from "lucide-react";
import Link from "next/link";

import { getHighlightedNewsArticle } from "lib/api";

const LABEL_TEXT = "活动速递";

export async function HomeActivityNotice() {
  const article = await getHighlightedNewsArticle();

  if (!article) {
    return null;
  }

  return (
    <section className="bg-neutral-50 mt-1 md:mt-2 lg:mt-3">
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 text-sm text-neutral-700">
          <span className="flex size-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-[#049e6b]">
            <Megaphone className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
              {LABEL_TEXT}
            </span>
            <p className="text-sm font-medium text-neutral-900 line-clamp-2">
              {article.title}
            </p>
          </div>
        </div>
        <Link
          href={article.href}
          className="inline-flex items-center justify-center gap-1 rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2"
        >
          查看详情
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default HomeActivityNotice;
