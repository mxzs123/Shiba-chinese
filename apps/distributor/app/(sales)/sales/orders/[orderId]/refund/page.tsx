import { notFound } from "next/navigation";

import { RefundForm } from "./refund-form";
import { fetchMockOrders } from "@/lib/mock/server-actions";

interface RefundPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function RefundApplicationPage({
  params,
}: RefundPageProps) {
  const { orderId } = await params;
  const data = await fetchMockOrders("sales");
  const order = data.items.find((item) => item.id === orderId);

  if (!order) {
    notFound();
  }

  return (
    <RefundForm
      order={{
        id: order.id,
        amount: order.amount,
        customer: order.customer,
        submittedAt: order.submittedAt,
        paymentMethod: order.paymentMethod,
      }}
    />
  );
}
