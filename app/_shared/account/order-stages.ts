import type { Order } from "@/lib/api/types";

export const ORDER_STAGES = [
  { key: "pending", label: "待支付" },
  { key: "paid", label: "已支付待确认" },
  { key: "fulfilled", label: "已发货" },
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number]["key"];

export function resolveOrderStage(order: Order): OrderStage {
  if (order.fulfillmentStatus === "fulfilled" || order.status === "fulfilled") {
    return "fulfilled";
  }

  if (
    order.status === "paid" ||
    order.financialStatus === "paid" ||
    order.financialStatus === "authorized" ||
    order.status === "processing"
  ) {
    return "paid";
  }

  if (order.status === "pending" || order.financialStatus === "pending") {
    return "pending";
  }

  return "pending";
}

export function getStageLabel(stage: OrderStage) {
  return ORDER_STAGES.find((entry) => entry.key === stage)?.label ?? stage;
}
