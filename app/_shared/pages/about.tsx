import type { Metadata } from "next";
import { FileUp, Info } from "lucide-react";

import PrimaryButton from "app/_shared/PrimaryButton";
import {
  companyInfo,
  complianceItems,
  faqItems,
  type ComplianceItem,
  type FaqItem,
  type InfoRow,
} from "app/_shared/pages/about/data";
import { cn } from "lib/utils";

export const metadata: Metadata = {
  title: "关于芝园药局 | 企业信息与合规资料",
  description:
    "查看芝园药局的基础信息、经营资质与常见问题，后续可在此处维护官方对外公示内容。",
  openGraph: {
    title: "关于芝园药局 | 企业信息与合规资料",
    description:
      "查看芝园药局的基础信息、经营资质与常见问题，后续可在此处维护官方对外公示内容。",
    type: "website",
  },
};

function Section(props: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16 last:mb-0">
      <div className="mb-8">
        <h2 className="text-lg font-semibold tracking-wide text-primary">
          {props.title}
        </h2>
        {props.description ? (
          <p className="mt-2 text-sm leading-6 text-neutral-600">
            {props.description}
          </p>
        ) : null}
      </div>
      {props.children}
    </section>
  );
}

function InfoTable(props: { items: InfoRow[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />
      <dl>
        {props.items.map((item, index) => (
          <div
            key={item.id}
            className={cn(
              "flex flex-col gap-3 border-t border-neutral-200 p-6 md:flex-row md:items-start md:gap-10 md:px-8",
              index === 0 && "border-t-0",
            )}
          >
            <dt className="md:w-48">
              <span className="text-xs font-medium uppercase tracking-widest text-primary">
                {item.label}
              </span>
            </dt>
            <dd className="flex-1">
              <p className="text-base font-medium text-neutral-900">
                {item.value}
              </p>
              {item.helperText ? (
                <p className="mt-1 text-sm text-neutral-500">
                  {item.helperText}
                </p>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ComplianceTable(props: { items: ComplianceItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="h-1 w-full bg-primary/50" />
      <table className="w-full text-sm text-neutral-700">
        <thead className="bg-neutral-50 text-xs uppercase tracking-widest text-neutral-500">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              证照项目
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium">
              编号 / 说明
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              资料
            </th>
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id} className="border-t border-neutral-200">
              <th
                scope="row"
                className="bg-neutral-50 px-4 py-4 text-left text-sm font-semibold text-neutral-900"
              >
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <div>
                    <span>{item.label}</span>
                    {item.note ? (
                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        {item.note}
                      </p>
                    ) : null}
                  </div>
                </div>
              </th>
              <td className="px-4 py-4 align-top">
                <p className="text-sm font-medium text-neutral-900">
                  {item.licenseNumber}
                </p>
                {item.expiresAt ? (
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.expiresAt}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-4 align-top text-right">
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold tracking-wide text-neutral-600">
                    {item.status}
                  </span>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:brightness-105"
                      aria-label={`查看 ${item.label} PDF`}
                    >
                      <FileUp className="h-4 w-4" aria-hidden />
                      查看 PDF
                    </a>
                  ) : (
                    <PrimaryButton className="h-9 rounded-lg px-4 text-xs" aria-label={`上传 ${item.label} PDF`}>
                      <FileUp className="h-4 w-4" aria-hidden />
                      上传文件
                    </PrimaryButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FAQList(props: { items: FaqItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <ul>
        {props.items.map((item, index) => (
          <li
            key={item.id}
            className={cn(
              "border-t border-neutral-200 px-6 py-6 md:px-8",
              index === 0 && "border-t-0",
            )}
          >
            <p className="text-base font-semibold text-neutral-900">
              {item.question}
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {item.answer}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-10">
      <div className="mb-16 rounded-3xl border border-neutral-200 bg-white/70 p-10 shadow-sm backdrop-blur">
        <h1 className="text-4xl font-semibold text-neutral-900">
          关于芝园药局
        </h1>
      </div>

      <Section title="公司信息">
        <InfoTable items={companyInfo} />
      </Section>

      <Section title="经营许可证">
        <ComplianceTable items={complianceItems} />
      </Section>

      {/* FAQ 暂时隐藏，待提供真实问答后恢复 */}
      {false && (
        <Section title="常见问题">
          <FAQList items={faqItems} />
        </Section>
      )}
    </div>
  );
}
