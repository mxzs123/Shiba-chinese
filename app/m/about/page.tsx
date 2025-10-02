import { FileUp, Info } from "lucide-react";

import PrimaryButton from "@/app/_shared/PrimaryButton";
import MobileContentContainer from "@/app/_shared/layouts/mobile-content-container";
import { MobileHeader } from "@/components/layout/mobile-header";
import { getNotifications } from "@/lib/api";
import {
  companyInfo,
  complianceItems,
  faqItems,
  type ComplianceItem,
  type FaqItem,
  type InfoRow,
} from "@/app/_shared/pages/about/data";

export const dynamic = "force-dynamic";

export { metadata } from "@/app/_shared/pages/about";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {description ? (
          <p className="text-sm leading-5 text-neutral-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function InfoList({ items }: { items: InfoRow[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {item.label}
          </span>
          <p className="mt-2 text-base font-medium text-neutral-900">
            {item.value}
          </p>
          {item.helperText ? (
            <p className="mt-1 text-sm leading-5 text-neutral-500">
              {item.helperText}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ComplianceCards({ items }: { items: ComplianceItem[] }) {
  return (
    <div className="grid gap-4">
      {items.map((item) => (
        <article
          key={item.id}
          className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-2">
            <span className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
              <Info className="h-4 w-4" aria-hidden />
            </span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-900">
                {item.label}
              </h3>
              {item.note ? (
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  {item.note}
                </p>
              ) : null}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-900">
              {item.licenseNumber}
            </p>
            {item.expiresAt ? (
              <p className="text-xs text-neutral-500">{item.expiresAt}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-600">
              {item.status}
            </span>
            <PrimaryButton
              className="h-9 rounded-lg px-3 text-xs shadow-none"
              aria-label={`上传 ${item.label} PDF`}
            >
              <FileUp className="h-4 w-4" aria-hidden />
              上传文件
            </PrimaryButton>
          </div>
        </article>
      ))}
    </div>
  );
}

function FAQList({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.id}
          className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-left text-sm font-semibold text-neutral-900">
            <span>{item.question}</span>
            <span className="text-xs text-primary opacity-0 group-open:opacity-100">
              展开中
            </span>
          </summary>
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

function Hero() {
  return (
    <div className="bg-gradient-to-b from-primary/15 via-white to-white">
      <MobileContentContainer className="space-y-4 pb-8 pt-10">
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
          关于我们
        </span>
        <h1 className="text-2xl font-semibold text-neutral-900">
          关于芝园药局
        </h1>
        <p className="text-sm leading-6 text-neutral-600">
          汇总企业基础信息、经营资质与常见问答，便于合作伙伴与客户快速了解芝园药局的服务能力与合规保障。
        </p>
      </MobileContentContainer>
    </div>
  );
}

export default async function MobileAboutPage() {
  const notifications = await getNotifications();

  return (
    <div className="bg-neutral-50">
      <MobileHeader notifications={notifications} leadingVariant="back" />
      <Hero />
      <MobileContentContainer className="space-y-10 pb-12">
        <Section
          title="公司信息"
          description="字段建议与工商登记系统或 CMS 保持同步，便于一键更新。"
        >
          <InfoList items={companyInfo} />
        </Section>

        <Section
          title="经营许可证"
          description="为每项证照上传电子件或外链，保留编号与有效期便于合规查验。"
        >
          <ComplianceCards items={complianceItems} />
        </Section>

        <Section
          title="常见问题"
          description="整理对外问答，确保客服脚本与官网披露一致。"
        >
          <FAQList items={faqItems} />
        </Section>
      </MobileContentContainer>
    </div>
  );
}
