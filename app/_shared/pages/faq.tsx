import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { cn } from "lib/utils";

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

const faqSections: FaqSection[] = [
  {
    id: "orders",
    title: "下单与支付",
    description: "提交订单、支付方式以及订单状态相关说明。",
    items: [
      {
        id: "orders-payment-methods",
        question: "支持哪些支付方式？",
        answer: (
          <>
            <p>
              我们支持微信支付、支付宝、银联在线以及带有 3D-Secure 的 Visa / Mastercard。
              选择海外信用卡时系统会自动进行风控校验，若失败可尝试绑定至支付宝后再支付。
            </p>
            <p>
              即时到账后会生成订单编号，您可在“会员中心 - 我的订单”中实时查看状态。
            </p>
          </>
        ),
      },
      {
        id: "orders-invoice",
        question: "如何索取发票或报销凭证？",
        answer: (
          <>
            <p>
              芝园支持开具电子发票，支付成功后 24 小时内会发送至下单邮箱，并同步存档于
              “会员中心 - 我的订单 - 查看详情”。如需纸质发票，请在备注中说明或联系客服协助。
            </p>
            <p>
              海外信用卡消费凭证可在支付渠道侧下载，国内支付方式则可在“交易记录”中导出账单。
            </p>
          </>
        ),
      },
      {
        id: "orders-processing",
        question: "下单后多久会处理？",
        answer: (
          <>
            <p>
              工作日 16:00 前完成支付的订单会在当日进入拣货流程；其余订单将顺延至下一个工作日。
              若商品需药师复核，我们会在“订单提醒”中推送确认通知，请按提示补充信息。
            </p>
            <p>
              如遇缺货我们会第一时间通过短信和站内信告知，并提供替代方案或退款选项。
            </p>
          </>
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
          <>
            <p>
              海外包裹采用日本东京仓发货，经由国际专线清关后由顺丰速运或京东快递完成最后一公里。
              支持选择常温与冷链两种线路，系统会根据商品属性自动匹配。
            </p>
            <p>
              国内仓现货会直接由顺丰速运配送，默认顺丰标快，如需加急可联系客服调整为顺丰特惠。
            </p>
          </>
        ),
      },
      {
        id: "shipping-lead-time",
        question: "配送大概需要多久？",
        answer: (
          <>
            <p>
              常温商品一般在 5-7 个工作日送达，冷链药品需配合温控检查，预计 7-10 个工作日。
              节假日及海关安检高峰期可能略有延长，我们会在站内信公告最新进度。
            </p>
            <p>
              支持在“我的订单”中实时查看物流轨迹，若长时间无更新可提交售后工单，我们会主动跟踪。
            </p>
          </>
        ),
      },
      {
        id: "shipping-damage",
        question: "签收时发现破损怎么办？",
        answer: (
          <>
            <p>
              请先在快递员在场时拍照取证，保留外包装、运单号以及商品整体照片，并在 24 小时内提交售后申请。
            </p>
            <p>
              进入“会员中心 - 我的订单 - 申请售后”，上传照片并填写问题描述，我们会在 1 个工作日内反馈。
              经确认后可选择退款、补发或补寄配件。
            </p>
          </>
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
        question: "哪些商品可以退换？",
        answer: (
          <>
            <p>
              非处方药、保健食品及周边商品在签收后 7 日内支持无理由退换，只要保持未拆封且影响二次销售即可。
            </p>
            <p>
              处方药、冷链药品以及定制商品暂不支持无理由退货，但如出现质量问题我们将负责到底。
            </p>
          </>
        ),
      },
      {
        id: "service-process",
        question: "退换货流程是怎样的？",
        answer: (
          <>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-600">
              <li>在“我的订单”找到对应订单，点击“申请售后”。</li>
              <li>选择退货或换货，填写原因并上传照片凭证（如有）。</li>
              <li>等待客服审核，审核通过后会收到退件地址或换货安排。</li>
              <li>寄回商品后请保留物流单据，退款将在仓库验收完成后 3-5 个工作日内原路返回。</li>
            </ol>
          </>
        ),
      },
      {
        id: "service-support",
        question: "售后审核需要多久？",
        answer: (
          <>
            <p>
              工作日 09:00-18:00 内提交的售后申请会在 12 小时内完成审核，其余时间将在次日优先处理。
              审核结果会通过短信、邮件以及站内信同步通知。
            </p>
          </>
        ),
      },
    ],
  },
  {
    id: "membership",
    title: "会员与积分",
    description: "积分获取、等级体系与专属权益。",
    items: [
      {
        id: "membership-points",
        question: "积分如何获得与使用？",
        answer: (
          <>
            <p>
              下单实付金额会按 1 元=1 积分累计，订单在确认收货后 3 天内自动到账。
              参与问卷、好友邀请、线下活动也能获得额外积分，我们会在“通知中心”内推送活动信息。
            </p>
            <p>
              积分可在结算页直接抵扣现金（100 积分=1 元），同时可兑换专属周边或线下体验服务。
            </p>
          </>
        ),
      },
      {
        id: "membership-tier",
        question: "会员等级如何升级？",
        answer: (
          <>
            <p>
              芝园会员分为银卡、金卡与黑金三档，以近 12 个月累计消费额计算：
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-neutral-600">
              <li>银卡：累计消费满 1,500 元。</li>
              <li>金卡：累计消费满 5,000 元或邀请 5 位新会员有效下单。</li>
              <li>黑金：累计消费满 12,000 元，并保持月度活跃。</li>
            </ul>
            <p>
              达成条件后会自动升级，当月即可享受相应折扣、专属客服与生日礼遇。
            </p>
          </>
        ),
      },
      {
        id: "membership-freeze",
        question: "积分会过期吗？",
        answer: (
          <>
            <p>
              积分以年度为单位有效，当年度获得的积分会在次年 12 月 31 日到期。
              我们会提前 30 天推送到期提醒，可通过下单或兑换礼品快速消耗。
            </p>
          </>
        ),
      },
    ],
  },
];

function FaqItem({ item }: { item: FaqItem }) {
  return (
    <details
      id={item.id}
      className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-teal-500"
    >
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-lg font-semibold text-neutral-900">
        {item.question}
        <span className="text-sm font-medium text-teal-600 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-600">
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
      <div className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <h2
            id={`${section.id}-title`}
            className="text-2xl font-semibold text-neutral-900"
          >
            {section.title}
          </h2>
          {section.description ? (
            <p className="text-sm text-neutral-600">{section.description}</p>
          ) : null}
        </div>
        <div className="space-y-4">
          {section.items.map((item) => (
            <FaqItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSectionList({ sections }: { sections: FaqSection[] }) {
  return (
    <div className="space-y-10 lg:space-y-12">
      {sections.map((section) => (
        <FaqSectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function FaqOverviewCard({
  sections,
  className,
}: {
  sections: FaqSection[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "space-y-8 rounded-3xl border border-neutral-200 bg-white p-10 shadow-sm",
        className,
      )}
    >
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">
          常见问题
        </p>
        <h1 className="text-4xl font-bold text-neutral-900">
          解答购买与售后最常见的疑问
        </h1>
        <p className="text-base text-neutral-600">
          我们整理下单、配送、售后与会员服务中的高频问题，帮助你快速定位需要的帮助信息。
          数据来自真实客服反馈与用户留言，并会定期复核更新。
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left transition hover:border-teal-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-neutral-900">
                {section.title}
              </span>
              {section.description ? (
                <span className="text-sm text-neutral-500">
                  {section.description}
                </span>
              ) : null}
            </div>
            <span className="text-teal-600 transition group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function FaqPage() {
  return (
    <div className="bg-neutral-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12 md:px-8">
        <FaqOverviewCard sections={faqSections} />

        <FaqSectionList sections={faqSections} />
      </div>
    </div>
  );
}

export default FaqPage;
