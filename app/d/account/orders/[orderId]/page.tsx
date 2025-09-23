import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ACCOUNT_NAV_ITEMS,
  AccountOrderDetail,
  AccountShell,
} from "@/app/_shared/account";
import { getCurrentUser, getOrderById, getUserById } from "@/lib/api";

export const metadata: Metadata = {
  title: "订单详情",
  description: "查看订单信息、配送与费用明细。",
};

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({
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
    <AccountShell
      title="个人中心"
      description="集中管理订单、收货信息与账户偏好。"
      navItems={ACCOUNT_NAV_ITEMS}
      activeItem="orders"
    >
      <AccountOrderDetail order={order} />
    </AccountShell>
  );
}
