import type { Metadata } from "next";
import { FileUp, Info } from "lucide-react";

import PrimaryButton from "app/_shared/PrimaryButton";
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

type InfoRow = {
  id: string;
  label: string;
  value: string;
  helperText?: string;
};

type ComplianceItem = {
  id: string;
  label: string;
  licenseNumber: string;
  expiresAt?: string;
  note?: string;
  status: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const companyInfo: InfoRow[] = [
  {
    id: "entity-name",
    label: "公司名称",
    value: "芝园健康科技（上海）有限公司",
    helperText: "Shiyuan Health Technology (Shanghai) Co., Ltd.",
  },
  {
    id: "entity-address",
    label: "注册地址",
    value: "上海市杨浦区政益路 88 号 A 座 502 室",
    helperText: "邮编 200082 | 示例地址，后续请同步工商登记信息",
  },
  {
    id: "entity-contact",
    label: "联系方式",
    value: "客服热线：400-123-0000",
    helperText: "传真：021-0000-0001 | 邮箱：support@shiyuan.example.com",
  },
  {
    id: "entity-representative",
    label: "法定代表人",
    value: "陈芝园",
    helperText: "董事长兼首席执行官",
  },
  {
    id: "entity-founded",
    label: "成立日期",
    value: "2021 年 5 月",
    helperText: "统一社会信用代码：91310110MXYZ12345N",
  },
  {
    id: "entity-capital",
    label: "注册资本",
    value: "人民币 5,000,000 元",
    helperText: "实缴资本待完成验资，以财务报表为准",
  },
  {
    id: "entity-scope",
    label: "经营范围",
    value: "药品零售、保健食品销售、健康管理咨询（以审批结果为准）",
  },
  {
    id: "entity-service",
    label: "客服时间",
    value: "周一至周日 09:00-21:00 (GMT+8)",
    helperText: "公众号：芝园药局 | 小程序：芝园健康",
  },
];

const complianceItems: ComplianceItem[] = [
  {
    id: "gsp-license",
    label: "药品经营许可证",
    licenseNumber: "沪DA1234567",
    expiresAt: "有效期至 2027 年 12 月 31 日",
    note: "覆盖处方药、特管药品经营范围，更新后请同步原件扫描件。",
    status: "待上传 PDF",
  },
  {
    id: "food-license",
    label: "食品经营许可证",
    licenseNumber: "沪SP5630001",
    expiresAt: "有效期至 2026 年 06 月 30 日",
    note: "涉及保健食品、特殊膳食产品的销售与配送。",
    status: "待上传 PDF",
  },
  {
    id: "device-record",
    label: "第二类医疗器械经营备案",
    licenseNumber: "沪药监械经营备 20240001 号",
    note: "覆盖血糖仪、理疗仪等器械，如有新品请提前补充备案。",
    status: "待上传 PDF",
  },
  {
    id: "narcotic-permit",
    label: "含麻黄碱类复方制剂经营许可",
    licenseNumber: "沪禁化管准字第 0401 号",
    note: "若业务暂未开启，可在此注明“暂未经营”并附函说明。",
    status: "待上传 PDF",
  },
];

const faqItems: FaqItem[] = [
  {
    id: "faq-cooperation",
    question: "如何与芝园建立业务合作？",
    answer:
      "请发送邮件至 partners@shiyuan.example.com，附上公司简介与合作方向，商务团队将在 3 个工作日内回复。",
  },
  {
    id: "faq-license-update",
    question: "经营许可证更新节奏是怎样的？",
    answer:
      "合规资料通常每 5 年换证一次，如遇到监管变更或经营范围扩展，请在获批后的 5 个工作日内同步至线上页面并归档。",
  },
  {
    id: "faq-complaint",
    question: "消费者投诉渠道有哪些？",
    answer:
      "可通过客服热线、微信公众号“芝园药局”或发邮件至 compliance@shiyuan.example.com，我们会在 24 小时内响应。",
  },
  {
    id: "faq-materials",
    question: "需要纸质版企业信息时如何获取？",
    answer:
      "可联系合规团队提供盖章版资料，请在工单或邮件中说明用途，我们会在 2 个工作日内寄出。",
  },
];

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
                  <PrimaryButton
                    className="h-9 rounded-lg px-4 text-xs"
                    aria-label={`上传 ${item.label} PDF`}
                  >
                    <FileUp className="h-4 w-4" aria-hidden />
                    上传文件
                  </PrimaryButton>
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
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
          这里集中展示企业基础信息、合规资质与对外沟通指引。页面采用模块化布局，未来接入
          CMS 或内部后台时可直接替换对应的数据源，并在保持同一 URL
          的同时完成桌面 / 移动外壳的兼容。
        </p>
      </div>

      <Section
        description="字段建议与工商登记系统或 CMS 保持同步，便于一键更新。"
        title="公司信息"
      >
        <InfoTable items={companyInfo} />
      </Section>

      <Section
        description="每项证照可上传 PDF 或外部链接，建议同步记录编号与有效期，便于合规与客服快速查阅。"
        title="经营许可证"
      >
        <ComplianceTable items={complianceItems} />
      </Section>

      <Section
        description="整理常见对外问答，确保客服脚本与官网披露一致。"
        title="常见问题"
      >
        <FAQList items={faqItems} />
      </Section>
    </div>
  );
}
