import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { PackageCheck, Truck } from "lucide-react";

import type { Order } from "@/lib/api/types";

import { getStageLabel, resolveOrderStage } from "./order-stages";

function formatDate(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(amount: string, currencyCode: string) {
  const numeric = Number(amount);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(safeAmount);
}

function getFormattedAddressLines(order: Order) {
  const address = order.shippingAddress;

  if (address.formatted && address.formatted.length > 0) {
    return address.formatted;
  }

  const computed = [
    [address.province, address.city, address.district, address.address1]
      .filter(Boolean)
      .join(" "),
    address.address2,
    [address.city, address.country].filter(Boolean).join(" "),
    address.postalCode
      ? `${address.postalCode}${address.countryCode ? ` ${address.countryCode}` : ""}`
      : undefined,
  ].filter((entry): entry is string => Boolean(entry && entry.trim()));

  return computed.length ? computed : ["地址信息待完善"];
}

type AccountOrderDetailProps = {
  order: Order;
};

export function AccountOrderDetail({ order }: AccountOrderDetailProps) {
  const stage = resolveOrderStage(order);
  const stageLabel = getStageLabel(stage);
  const createdAt = formatDate(order.createdAt);
  const updatedAt = order.fulfilledAt || order.processedAt || order.updatedAt;
  const fulfilledAt = updatedAt ? formatDate(updatedAt) : "待更新";
  const shippingMethod = order.shippingMethod;
  const trackingNumber = order.tracking?.trackingNumber ?? "待更新";
  const subtotal = formatMoney(order.subtotalPrice.amount, order.subtotalPrice.currencyCode);
  const shippingCost = formatMoney(order.totalShipping.amount, order.totalShipping.currencyCode);
  const taxCost = formatMoney(order.totalTax.amount, order.totalTax.currencyCode);
  const totalCost = formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode);
  const couponSavings = order.appliedCoupons?.reduce((total, coupon) => {
    return total + Number(coupon.amount.amount);
  }, 0) ?? 0;
  const couponDisplay = couponSavings > 0
    ? `-${formatMoney(couponSavings.toFixed(2), order.currencyCode)}`
    : null;
  const loyaltyDisplay = typeof order.loyaltyDelta === "number" ? `+${order.loyaltyDelta}` : null;
  const totalQuantity = order.lineItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section className="space-y-8">
      <header className="space-y-4 rounded-3xl border border-neutral-100 bg-white/80 px-6 py-5 shadow-lg shadow-neutral-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-neutral-900">订单详情</h1>
            <p className="text-sm text-neutral-500">
              订单编号 {order.number} · 创建于 {createdAt}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <Link
              href="/account"
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
            >
              返回订单列表
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
              <PackageCheck className="h-4 w-4" aria-hidden />
              {stageLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
          <span>最新更新 {fulfilledAt}</span>
          <span>共 {totalQuantity} 件商品</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="订单信息">
          <InfoRow label="订单编号" value={order.number} />
          <InfoRow label="下单时间" value={createdAt} />
          {shippingMethod ? (
            <InfoRow
              label="配送方式"
              value={`${shippingMethod.name} · ${shippingMethod.carrier}`}
            />
          ) : (
            <InfoRow label="配送方式" value="待确认" />
          )}
        </InfoCard>
        <InfoCard title="收货信息">
          <InfoRow
            label="收货人"
            value={`${order.shippingAddress.lastName ?? ""}${order.shippingAddress.firstName ?? ""}` || "--"}
          />
          <InfoRow label="手机号" value={order.shippingAddress.phone ?? "--"} />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-neutral-400">收货地址</p>
            <div className="text-sm text-neutral-600">
              {getFormattedAddressLines(order).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </InfoCard>
      </div>

      <ItemsSection order={order} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="费用明细">
          <InfoRow label="商品金额" value={subtotal} />
          <InfoRow label="运费" value={shippingCost} />
          <InfoRow label="税费" value={taxCost} />
          {couponDisplay ? <InfoRow label="优惠减免" value={couponDisplay} emphasis="positive" /> : null}
          {loyaltyDisplay ? <InfoRow label="积分奖励" value={loyaltyDisplay} emphasis="positive" /> : null}
          <InfoRow label="实付金额" value={totalCost} emphasizeTotal />
        </InfoCard>
        <InfoCard title="物流信息">
          <InfoRow label="配送渠道" value={shippingMethod ? shippingMethod.carrier : "待确认"} />
          <InfoRow label="运单号" value={trackingNumber} />
          <div className="mt-3 rounded-2xl bg-neutral-100 px-4 py-3 text-xs text-neutral-500">
            若需实时查看物流节点，请通过客服渠道提供运单号进行查询。
          </div>
        </InfoCard>
      </div>
    </section>
  );
}

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

function InfoCard({ title, children }: InfoCardProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-lg shadow-neutral-900/5">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="space-y-4 text-sm text-neutral-600">{children}</div>
    </section>
  );
}

type InfoRowProps = {
  label: string;
  value: string;
  description?: string;
  emphasis?: "positive" | "neutral";
  emphasizeTotal?: boolean;
};

function InfoRow({ label, value, description, emphasis, emphasizeTotal }: InfoRowProps) {
  const valueClasses = emphasizeTotal
    ? "text-base font-semibold text-neutral-900"
    : emphasis === "positive"
      ? "font-semibold text-emerald-600"
      : "font-semibold text-neutral-900";

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-neutral-400">{label}</p>
      <p className={valueClasses}>{value}</p>
      {description ? <p className="text-xs text-neutral-400">{description}</p> : null}
    </div>
  );
}

type ItemsSectionProps = {
  order: Order;
};

function ItemsSection({ order }: ItemsSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-neutral-100 bg-white/80 p-6 shadow-lg shadow-neutral-900/5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">商品信息</h2>
          <p className="text-sm text-neutral-500">共 {order.lineItems.length} 项</p>
        </div>
        <p className="text-sm font-semibold text-neutral-900">
          实付 {formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}
        </p>
      </header>
      <ul className="divide-y divide-neutral-200">
        {order.lineItems.map((item) => (
          <li key={item.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              {item.image ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                  <Image
                    fill
                    sizes="64px"
                    src={item.image.url}
                    alt={item.image.altText || item.productTitle}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white text-xs text-neutral-400">
                  无图
                </div>
              )}
              <div className="space-y-1 text-sm text-neutral-600">
                <p className="font-semibold text-neutral-900">{item.productTitle}</p>
                {item.variantTitle ? <p className="text-xs text-neutral-500">{item.variantTitle}</p> : null}
                <p className="text-xs text-neutral-400">数量 × {item.quantity}</p>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between gap-4 text-sm font-semibold text-neutral-900 sm:justify-end">
              <span>
                单价 {formatMoney(item.unitPrice.amount, item.unitPrice.currencyCode)}
              </span>
              <span>
                小计 {formatMoney(item.totalPrice.amount, item.totalPrice.currencyCode)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default AccountOrderDetail;
