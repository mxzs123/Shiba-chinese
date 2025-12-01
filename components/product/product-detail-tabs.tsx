"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import clsx from "clsx";

type DetailRow = {
  label: string;
  value: string;
};

type GuidelineSection = {
  title: string;
  body: string;
};

type ProductDetailTabsProps = {
  detailRows: DetailRow[];
  descriptionHtml?: string;
  descriptionFallback: string;
  guidelineSections: GuidelineSection[];
};

const TABS = [
  { key: "details", label: "商品详情" },
  { key: "guidelines", label: "用药须知" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function ProductDetailTabs({
  detailRows,
  descriptionHtml,
  descriptionFallback,
  guidelineSections,
}: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("details");

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
      <header className="flex flex-col gap-3">
        <nav aria-label="商品信息切换">
          <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  activeTab === tab.key
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700",
                )}
                aria-pressed={activeTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
        <p className="text-sm text-neutral-500">
          商品信息由内容服务统一维护，我们会持续更新最权威的细节说明。
        </p>
      </header>
      <div>
        {activeTab === "details" ? (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-neutral-100">
              <table className="w-full text-sm text-neutral-600">
                <tbody>
                  {detailRows.map((row) => (
                    <tr key={row.label} className="odd:bg-neutral-50">
                      <th className="w-32 px-4 py-3 text-left font-medium text-neutral-800 sm:w-36 lg:w-40">
                        {row.label}
                      </th>
                      <td className="px-4 py-3 text-neutral-600">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-neutral-900">
                商品说明
              </h3>
              {descriptionHtml ? (
                <div
                  className={clsx(
                    "prose mx-auto max-w-6xl text-base leading-7 text-black",
                    "prose-headings:mt-8 prose-headings:font-semibold prose-headings:tracking-wide prose-headings:text-black",
                    "prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg",
                    "prose-a:text-black prose-a:underline prose-a:hover:text-neutral-300",
                    "prose-strong:text-black prose-ol:mt-8 prose-ol:list-decimal prose-ol:pl-6 prose-ul:mt-8 prose-ul:list-disc prose-ul:pl-6",
                    "max-w-none text-sm text-neutral-600",
                  )}
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="text-sm leading-6 text-neutral-600">
                  {descriptionFallback}
                </p>
              )}
            </div>
          </div>
        ) : null}
        {activeTab === "guidelines" ? (
          <div className="space-y-5">
            {guidelineSections.map((section) => (
              <article key={section.title} className="space-y-2">
                <h3 className="text-sm font-medium text-neutral-800">
                  {section.title}
                </h3>
                <p className="text-sm leading-6 text-neutral-600">
                  {section.body}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
