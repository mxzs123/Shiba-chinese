import type { SalesOrder } from "./orders";
import { findSalesOrderById } from "./orders";
import { takeTemporaryUploads, type TemporaryUpload } from "./uploads";

export type RefundApplicationStatus =
  | "pending_review"
  | "approved"
  | "rejected";

export interface RefundApplication {
  id: string;
  orderId: string;
  reason: string;
  amount: number;
  status: RefundApplicationStatus;
  submittedAt: string;
  attachments: TemporaryUpload[];
  orderSnapshot: Pick<SalesOrder, "id" | "amount" | "customer" | "submittedAt">;
}

const refundApplications: RefundApplication[] = [];

export function createRefundApplication(
  orderId: string,
  payload: { reason: string; amount: number; attachmentIds: string[] },
) {
  const order = findSalesOrderById(orderId);

  if (!order) {
    throw new Error("订单不存在或已无法申请退款");
  }

  const attachments = takeTemporaryUploads(payload.attachmentIds);

  const record: RefundApplication = {
    id: `RF-${orderId}-${Date.now()}`,
    orderId,
    reason: payload.reason,
    amount: payload.amount,
    status: "pending_review",
    submittedAt: new Date().toISOString(),
    attachments,
    orderSnapshot: {
      id: order.id,
      amount: order.amount,
      customer: order.customer,
      submittedAt: order.submittedAt,
    },
  };

  refundApplications.push(record);
  order.status = "refunded";

  return {
    ...record,
    attachments: record.attachments.map((item) => ({ ...item })),
  };
}

export function listRefundApplicationsForOrder(orderId: string) {
  return refundApplications
    .filter((item) => item.orderId === orderId)
    .map((item) => ({
      ...item,
      attachments: item.attachments.map((attachment) => ({ ...attachment })),
    }));
}
