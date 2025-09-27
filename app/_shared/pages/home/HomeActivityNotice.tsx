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
    <section className="border-b border-[#049e6b]/20 bg-[#049e6b]/10">
      <div className="mx-auto flex w-full max-w-(--breakpoint-2xl) flex-col gap-2 px-4 py-2 sm:px-6 sm:py-2.5 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3 text-sm text-neutral-800">
          <span className="flex size-8 items-center justify-center rounded-full bg-[#049e6b] text-white shadow-sm">
            <Megaphone className="size-4" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#049e6b]">
              {LABEL_TEXT}
            </span>
            <p className="text-sm font-medium text-neutral-900 line-clamp-2">
              {article.title}
            </p>
          </div>
        </div>
        <Link
          href={article.href}
          className="inline-flex items-center justify-center gap-1 rounded-full border border-[#049e6b] bg-white px-4 py-1.5 text-xs font-medium text-[#049e6b] transition hover:bg-[#049e6b] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#049e6b] focus-visible:ring-offset-2"
        >
          查看详情
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

export default HomeActivityNotice;
