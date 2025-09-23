import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { CheckoutResult, checkoutResultPlaceholders } from "@/app/_shared";
import {
  getCurrentUser,
  getSurveyAssignmentsByUser,
  getUserOrders,
} from "lib/api";
import type { Order, SurveyAssignment } from "lib/api/types";

export const metadata: Metadata = {
  title: "支付成功",
  description: "感谢下单，我们已收到支付并开始备货。",
};

function getLatestOrder(orders: Order[]): Order | undefined {
  if (!orders.length) {
    return undefined;
  }

  return orders.slice().sort((a, b) => {
    const aTime = new Date(a.processedAt || a.createdAt).getTime();
    const bTime = new Date(b.processedAt || b.createdAt).getTime();
    return bTime - aTime;
  })[0];
}

function buildSurveyReminder(
  assignments: SurveyAssignment[],
  needsIdentityVerification: boolean,
): ReactNode {
  if (!assignments.length) {
    return null;
  }

  const primaryAssignment = assignments[0]!;
  const uniqueTitles = Array.from(
    new Set(
      assignments.flatMap((assignment) => assignment.productTitles ?? []),
    ),
  );

  return (
    <section className="mt-12 rounded-2xl border border-[#049e6b]/30 bg-[#049e6b]/10 p-6 text-sm text-[#03583b]">
      <h2 className="text-base font-semibold text-[#024a33]">
        处方药问卷待确认
      </h2>
      <p className="mt-2 text-sm text-[#036041]">
        为加快药师审核，请尽快补充处方药问卷信息。我们已根据订单预填关键资料，确认后即可提交。
      </p>
      {uniqueTitles.length ? (
        <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[#024a33]">
          {uniqueTitles.map((title) => (
            <li
              key={title}
              className="rounded-full bg-white/80 px-3 py-1 shadow-sm shadow-[#024a33]/10"
            >
              {title}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Link
          href={`/account/surveys/${primaryAssignment.id}`}
          prefetch
          className="inline-flex h-10 items-center justify-center rounded-xl bg-[#049e6b] px-5 font-semibold text-white transition hover:brightness-110"
        >
          立即填写
        </Link>
        <Link
          href="/account/surveys"
          prefetch
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#049e6b]/40 px-4 font-semibold text-[#03583b] transition hover:border-[#03583b] hover:text-[#024a33]"
        >
          查看我的问卷
        </Link>
        {needsIdentityVerification ? (
          <Link
            href="/account/profile"
            prefetch
            className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 px-4 font-semibold text-amber-700 transition hover:border-amber-500 hover:text-amber-800"
          >
            上传身份证
          </Link>
        ) : null}
      </div>
      {needsIdentityVerification ? (
        <p className="mt-2 text-xs text-[#5f8670]">
          身份证上传通过后即可提交问卷，避免处方药延迟发货。
        </p>
      ) : null}
    </section>
  );
}

export default async function CheckoutSuccessPage() {
  const customer = await getCurrentUser();
  const orders = customer ? await getUserOrders(customer.id) : [];
  const latestOrder = getLatestOrder(orders);
  const assignments = customer
    ? await getSurveyAssignmentsByUser(customer.id)
    : [];
  const pendingAssignments = latestOrder
    ? assignments.filter(
        (assignment) =>
          assignment.orderId === latestOrder.id &&
          assignment.status !== "submitted",
      )
    : [];
  const identityStatus = customer?.identityVerification?.status ?? "unverified";
  const surveyReminder = buildSurveyReminder(
    pendingAssignments,
    identityStatus !== "verified",
  );

  return (
    <CheckoutResult
      variant="success"
      title="支付成功，订单已确认"
      description="我们已收到您的支付请求，仓库正在安排备货。发货后会通过短信与邮箱通知物流单号。"
      primaryAction={{
        ...checkoutResultPlaceholders.continueShopping,
        href: "/search",
      }}
      secondaryActions={[
        {
          label: "返回首页",
          href: "/",
          variant: "secondary",
          prefetch: true,
        },
      ]}
      order={latestOrder}
      tips={[
        {
          title: "配送进度",
          description: "默认 1-2 个工作日内完成出库，节假日期间可能顺延。",
        },
        {
          title: "售后支持",
          description:
            "如需修改地址或开具发票，请在商品发货前联系 support@example.com。",
        },
      ]}
    >
      {surveyReminder}
    </CheckoutResult>
  );
}
