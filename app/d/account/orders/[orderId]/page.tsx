import type { Metadata } from "next";
import Link from "next/link";
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
      breadcrumbs={
        <nav aria-label="订单面包屑" className="flex">
          <Link
            href="/d/account/orders"
            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
          >
            返回订单列表
          </Link>
        </nav>
      }
    >
      <AccountOrderDetail order={order} />
    </AccountShell>
  );
}
