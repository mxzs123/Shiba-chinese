import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { cn } from "lib/utils";
import { ChevronDown, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "常见问题 | 芝园药局",
  description: "了解芝园药局的下单流程、配送时效、退货规则与客服支持渠道。",
  openGraph: {
    title: "常见问题 | 芝园药局",
    description: "了解芝园药局的下单流程、配送时效、退货规则与客服支持渠道。",
    type: "website",
  },
};

type FaqItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type FaqSection = {
  id: string;
  title: string;
  description?: string;
  items: FaqItem[];
};

type FilterableFaqSection = Omit<FaqSection, "items"> & {
  items: FaqItem[];
};

const faqSections: FaqSection[] = [
  {
    id: "orders",
    title: "下单与支付",
    description: "提交订单、支付方式以及订单状态相关说明。",
    items: [
      {
        id: "orders-payment-methods",
        question: "支持哪些支付方式？具体的支付流程是怎样的？",
        answer: (
          <div className="space-y-4">
            <p>目前支持以下主流支付方式：</p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-600">
              <li>WeChat Pay (微信支付)</li>
              <li>Alipay+ (支付宝)</li>
              <li>银联 QR (UnionPay QR)</li>
              <li>JKOPay / PayPay / メルペイ (Merpay)</li>
              <li>d払い / auPAY / 楽天Pay / AEON Pay</li>
              <li>Bank Pay / 銀行PAY (ゆうちょPay) / J-Coin Pay</li>
            </ul>
            <p>
              支付成功后，订单会自动生成。您可以在“会员中心 -
              我的订单”中查看订单详情与实时状态。
            </p>
          </div>
        ),
      },
      {
        id: "orders-payment-issues",
        question: "支付失败或遇到问题怎么办？",
        answer: (
          <p>
            如果在支付过程中遇到失败或其他问题，请直接联系我们的客服微信，我们将为您提供一对一的帮助。
          </p>
        ),
      },
      {
        id: "orders-processing",
        question: "下单后多久发货？如果缺货怎么处理？",
        answer: (
          <div className="space-y-3">
            <p>
              一般情况下，下单后 <strong>2-3 个工作日</strong>内完成发货。
            </p>
            <p>
              如遇商品缺货，可能需要等待 <strong>7-14 个工作日</strong>
              才能发货。对于短期内无法补货的情况，客服会主动添加您的微信进行告知，并协商后续处理方案。
            </p>
          </div>
        ),
      },
    ],
  },
  {
    id: "shipping",
    title: "配送与签收",
    description: "关于物流方式、时效以及包裹异常处理。",
    items: [
      {
        id: "shipping-methods",
        question: "目前使用哪些物流渠道？",
        answer: (
          <div className="space-y-3">
            <p>我们要根据商品所在地和目的地选择最优物流：</p>
            <ul className="list-disc space-y-1 pl-5 text-neutral-600">
              <li>
                <span className="font-medium text-neutral-900">日本国内：</span>
                佐川急便、黑猫宅急便 (Yamato)
              </li>
              <li>
                <span className="font-medium text-neutral-900">国际物流：</span>
                EMS、京东物流、顺丰速运 (SF Express)、FedEx
              </li>
            </ul>
          </div>
        ),
      },
      {
        id: "shipping-lead-time",
        question: "配送一般需要多久？哪里可以查看物流？",
        answer: (
          <p>
            国际配送一般需要 <strong>7-14 天</strong>。发货后，建议您使用{" "}
            <a
              href="https://www.17track.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary underline hover:text-primary/80"
            >
              17track
            </a>{" "}
            网站，输入运单号查询最新的物流轨迹。
          </p>
        ),
      },
      {
        id: "shipping-damage",
        question: "签收时发现包裹破损怎么办？",
        answer: (
          <p>
            请在收到货后的 <strong>48 小时内</strong>
            联系客服微信，并提供包裹外观及商品破损的照片，我们会尽快为您处理。
          </p>
        ),
      },
    ],
  },
  {
    id: "service",
    title: "售后与退换",
    description: "退货范围、审核流程以及退款时效。",
    items: [
      {
        id: "service-return-range",
        question: "哪些商品可以退换？有什么条件要求？",
        answer: (
          <div className="space-y-3">
            <p>
              为了保证商品品质和用药安全，
              <strong>付款后暂不支持无理由取消订单、更改订单内容或退换货。</strong>
            </p>
            <p>
              但在以下情况，我们将为您全额退款：
              <br />
              <span className="text-neutral-600">
                收到商品本身存在质量问题（如商品破损、变质等）。
              </span>
            </p>
            <p className="text-sm text-neutral-500">
              * 请务必在收到商品后 <strong>7 天内</strong> 联系客服处理。
            </p>
          </div>
        ),
      },
      {
        id: "service-process",
        question: "退换货的具体流程是什么？",
        answer: (
          <div className="space-y-4">
            <div className="rounded-lg bg-neutral-50 p-4">
              <p className="mb-2 font-medium text-neutral-900">
                商品质量问题处理流程：
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-neutral-600">
                <li>在收到商品后 7 天内联系客服微信</li>
                <li>提供订单信息和商品问题的照片</li>
                <li>客服确认后将安排全额退款</li>
              </ol>
            </div>
            <p className="text-sm text-neutral-500">
              注：如果是运输过程中造成的包裹破损，建议您先向运输公司申请赔偿，并携带运输公司提供的破损受理书联系我们的客服协助处理。
            </p>
          </div>
        ),
      },
      {
        id: "service-support",
        question: "售后审核需要多久？如何通知结果？",
        answer: (
          <p>
            我们会在收到您的售后申请后尽快处理，一般在{" "}
            <strong>1-2 个工作日</strong>
            内给予答复。审核结果将直接通过微信通知您。
          </p>
        ),
      },
    ],
  },
];

function FaqItem({ item }: { item: FaqItem }) {
  return (
    <details
      id={item.id}
      className="group overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:border-primary/50 hover:shadow-md open:border-primary/20 open:shadow-sm"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-base font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset">
        {item.question}
        <ChevronDown className="h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-200 ease-out group-open:rotate-180 group-open:text-primary" />
      </summary>
      <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-4 text-sm leading-relaxed text-neutral-600">
        {item.answer}
      </div>
    </details>
  );
}

function FaqSectionCard({ section }: { section: FaqSection }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-32"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2
            id={`${section.id}-title`}
            className="text-xl font-bold text-neutral-900 sm:text-2xl"
          >
            {section.title}
          </h2>
          {section.description ? (
            <p className="text-neutral-500">{section.description}</p>
          ) : null}
        </div>
        <div className="space-y-3">
          {section.items.map((item) => (
            <FaqItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSectionList({ sections }: { sections: FilterableFaqSection[] }) {
  return (
    <div className="space-y-12 lg:space-y-16">
      {sections.map((section) => (
        <FaqSectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function FaqFilterChip({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        isActive
          ? "border-primary/20 bg-primary/10 text-primary shadow-sm"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-primary/30 hover:bg-neutral-50 hover:text-neutral-900",
      )}
    >
      {label}
    </Link>
  );
}

function buildFaqHref({
  query,
  section,
}: {
  query?: string;
  section?: string;
}) {
  const search = new URLSearchParams();

  if (query) {
    search.set("q", query);
  }

  if (section) {
    search.set("section", section);
  }

  const params = search.toString();

  return params.length > 0 ? `/faq?${params}` : "/faq";
}

function FaqSearchControls({
  sections,
  activeQuery,
  activeSection,
}: {
  sections: FaqSection[];
  activeQuery: string;
  activeSection?: string;
}) {
  const normalizedQuery = activeQuery.trim();
  const hasActiveSection = sections.some(
    (section) => section.id === activeSection,
  );

  return (
    <section className="sticky top-[calc(var(--safe-area-inset-top)+64px)] z-10 -mx-4 space-y-4 bg-neutral-50/95 px-4 py-4 backdrop-blur-sm sm:static sm:top-auto sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0">
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
        <form
          action="/faq"
          className="space-y-4"
          role="search"
          aria-label="FAQ 搜索"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              id="faq-search-input"
              name="q"
              defaultValue={normalizedQuery}
              placeholder="搜索问题，如“支付”、“发货”"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-11 pr-4 text-base text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              inputMode="search"
            />
            {hasActiveSection ? (
              <input type="hidden" name="section" value={activeSection} />
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <FaqFilterChip
              href={buildFaqHref({ query: normalizedQuery || undefined })}
              label="全部"
              isActive={!hasActiveSection}
            />
            {sections.map((section) => (
              <FaqFilterChip
                key={section.id}
                href={buildFaqHref({
                  query: normalizedQuery || undefined,
                  section: section.id,
                })}
                label={section.title}
                isActive={hasActiveSection && section.id === activeSection}
              />
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}

function FaqEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
      <div className="rounded-full bg-neutral-50 p-4">
        <Search className="h-8 w-8 text-neutral-400" />
      </div>
      <div className="space-y-1">
        <p className="text-lg font-medium text-neutral-900">
          暂未找到相关结果
        </p>
        <p className="text-sm text-neutral-500">
          没有找到与“{query}”匹配的问题
        </p>
      </div>
      <Link
        href="/faq"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
      >
        清除搜索
      </Link>
    </div>
  );
}

function FaqHeader() {
  return (
    <div className="space-y-4 text-center sm:text-left">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        常见问题
      </h1>
      <p className="mx-auto max-w-2xl text-base text-neutral-600 sm:mx-0 sm:text-lg">
        如果您无法找到需要的答案，请直接联系我们的客服微信寻求帮助。
      </p>
    </div>
  );
}

export async function FaqPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; section?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const activeQuery = resolvedSearchParams?.q?.toString() ?? "";
  const normalizedQuery = activeQuery.trim().toLowerCase();
  const requestedSection = resolvedSearchParams?.section?.toString();
  const hasValidSection = faqSections.some(
    (section) => section.id === requestedSection,
  );
  const activeSection = hasValidSection ? requestedSection : undefined;

  const filteredSections: FilterableFaqSection[] = faqSections
    .filter((section) => {
      if (!activeSection) {
        return true;
      }

      return section.id === activeSection;
    })
    .map((section) => {
      if (!normalizedQuery) {
        return section as FilterableFaqSection;
      }

      const matchingItems = section.items.filter((item) =>
        item.question.toLowerCase().includes(normalizedQuery),
      );

      return {
        ...section,
        items: matchingItems,
      } as FilterableFaqSection;
    })
    .filter((section) => section.items.length > 0);

  const hasQuery = normalizedQuery.length > 0;
  const hasResults = filteredSections.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:gap-12">
          <FaqHeader />

          <FaqSearchControls
            sections={faqSections}
            activeQuery={activeQuery}
            activeSection={activeSection}
          />

          {hasResults ? (
            <FaqSectionList sections={filteredSections} />
          ) : hasQuery ? (
            <FaqEmptyState query={activeQuery.trim()} />
          ) : (
            <FaqSectionList sections={faqSections} />
          )}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
