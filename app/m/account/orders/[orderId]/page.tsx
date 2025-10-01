import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AccountOrderDetail } from "@/app/_shared/account";
import { getCurrentUser, getOrderById, getUserById } from "@/lib/api";

export const metadata: Metadata = {
  title: "订单详情",
  description: "查看订单信息、配送与费用明细。",
};

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function MobileOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const resolvedParams = await params;
  const orderId = decodeURIComponent(resolvedParams.orderId);

  const [sessionUser, fallbackUser] = await Promise.all([
    getCurrentUser(),
    getUserById("user-demo"),
  ]);

  const user = sessionUser ?? fallbackUser;

  if (!user) {
    notFound();
  }

  const order = await getOrderById(orderId);

  if (!order || order.customerId !== user.id) {
    notFound();
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-neutral-50 pb-24">
      <header className="flex items-center gap-3 px-4 pb-4 pt-6">
        <Link
          href="/account/orders"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm active:scale-95"
          aria-label="返回订单列表"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            订单详情
          </p>
          <h1 className="text-xl font-semibold text-neutral-900">
            订单编号 {order.number}
          </h1>
        </div>
      </header>
      <div className="flex-1 px-4 pb-6">
        <AccountOrderDetail order={order} />
      </div>
    </div>
  );
}
