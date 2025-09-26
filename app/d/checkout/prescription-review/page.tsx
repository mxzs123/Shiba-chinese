import { redirect } from "next/navigation";
import type { Metadata } from "next";

import {
  CheckoutResult,
  checkoutResultPlaceholders,
} from "@/app/_shared";
import { PrescriptionComplianceSteps } from "@/app/_shared/checkout/PrescriptionComplianceSteps";
import { getCurrentUser, getUserById } from "@/lib/api";
import {
  IDENTITY_HIGHLIGHT_HREF,
  SURVEY_HIGHLIGHT_HREF,
  loadPrescriptionReviewState,
} from "@/lib/prescription";

export const metadata: Metadata = {
  title: "待完成处方审核",
  description: "补充实名认证与问卷信息后方可发货。",
};

export default async function PrescriptionReviewPage() {
  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const customer = sessionUser ?? fallbackUser;

  if (!customer) {
    redirect("/checkout/success");
  }

  const reviewState = await loadPrescriptionReviewState(customer);

  if (!reviewState) {
    redirect("/checkout/success");
  }

  const { order, pendingAssignments, identityCompleted } = reviewState;
  const surveyCompleted = pendingAssignments.length === 0;

  return (
    <CheckoutResult
      variant="success"
      title="支付已收到，待完成处方审核"
      description={`订单 ${order.number} 含处方药，请先完成实名认证与问卷确认，我们会在审核通过后尽快出库。`}
      primaryAction={{
        label: "返回订单管理",
        href: "/account/orders",
        prefetch: true,
      }}
      secondaryActions={[
        {
          ...checkoutResultPlaceholders.continueShopping,
          href: "/search/pharmacy",
          label: "继续浏览药品",
        },
      ]}
      tips={[
        {
          title: "审核时效",
          description: "通常在 2 小时内完成药师复核，节假日期间可能顺延。",
        },
        {
          title: "客服协助",
          description: "如需帮助，请联系 support@example.com 或拨打 400-000-0000。",
        },
      ]}
    >
      <PrescriptionComplianceSteps
        identityCompleted={identityCompleted}
        identityHref={IDENTITY_HIGHLIGHT_HREF}
        surveyCompleted={surveyCompleted}
        surveyHref={SURVEY_HIGHLIGHT_HREF}
        pendingSurveyCount={pendingAssignments.length}
      />
    </CheckoutResult>
  );
}
