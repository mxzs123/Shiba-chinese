import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";

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
    <section className="overflow-hidden rounded-3xl border border-neutral-100 bg-white/90 shadow-lg shadow-neutral-900/5">
      <header className="border-b border-neutral-100 bg-neutral-50/70 px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-neutral-900">订单详情</h1>
            <p className="text-sm text-neutral-500">
              订单编号 {order.number} · 创建于 {createdAt}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
        <dl className="mt-4 grid gap-4 text-xs text-neutral-400 sm:grid-cols-3">
          <DetailMeta label="最新更新" value={fulfilledAt} />
          <DetailMeta label="商品件数" value={`共 ${totalQuantity} 件`} />
          <DetailMeta label="实付金额" value={totalCost} emphasize />
        </dl>
      </header>

      <div className="divide-y divide-neutral-100">
        <section className="grid gap-10 px-6 py-8 lg:grid-cols-2">
          <DetailSection title="订单信息">
            <DetailItem label="订单编号" value={order.number} />
            <DetailItem label="下单时间" value={createdAt} />
            {shippingMethod ? (
              <DetailItem
                label="配送方式"
                value={`${shippingMethod.name} · ${shippingMethod.carrier}`}
              />
            ) : (
              <DetailItem label="配送方式" value="待确认" />
            )}
          </DetailSection>
          <DetailSection title="收货信息">
            <DetailItem
              label="收货人"
              value={`${order.shippingAddress.lastName ?? ""}${order.shippingAddress.firstName ?? ""}` || "--"}
            />
            <DetailItem label="手机号" value={order.shippingAddress.phone ?? "--"} />
            <DetailItem
              label="收货地址"
              value={
                <div className="space-y-1">
                  {getFormattedAddressLines(order).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              }
            />
          </DetailSection>
        </section>

        <ItemsSection order={order} />

        <section className="grid gap-10 px-6 py-8 lg:grid-cols-2">
          <DetailSection title="费用明细">
            <DetailItem label="商品金额" value={subtotal} />
            <DetailItem label="运费" value={shippingCost} />
            <DetailItem label="税费" value={taxCost} />
            {couponDisplay ? (
              <DetailItem label="优惠减免" value={couponDisplay} tone="positive" />
            ) : null}
            {loyaltyDisplay ? (
              <DetailItem label="积分奖励" value={loyaltyDisplay} tone="positive" />
            ) : null}
            <DetailItem label="实付金额" value={totalCost} emphasize />
          </DetailSection>
          <DetailSection title="物流信息">
            <DetailItem label="配送渠道" value={shippingMethod ? shippingMethod.carrier : "待确认"} />
            <DetailItem label="运单号" value={trackingNumber} />
            <DetailItem
              label="提示"
              value="若需实时查看物流节点，请通过客服渠道提供运单号进行查询。"
              description
            />
          </DetailSection>
        </section>
      </div>
    </section>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {title}
      </h2>
      <dl className="grid gap-x-8 gap-y-5 text-sm text-neutral-600 lg:grid-cols-[160px_1fr]">
        {children}
      </dl>
    </section>
  );
}

type DetailItemProps = {
  label: string;
  value: ReactNode;
  tone?: "positive" | "neutral";
  emphasize?: boolean;
  description?: boolean;
};

function DetailItem({ label, value, tone, emphasize, description }: DetailItemProps) {
  const valueClasses = emphasize
    ? "text-base font-semibold text-neutral-900"
    : tone === "positive"
      ? "font-semibold text-emerald-600"
      : "text-neutral-900";

  return (
    <div className="contents">
      <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </dt>
      <dd className={description ? "text-xs text-neutral-500" : valueClasses}>{value}</dd>
    </div>
  );
}

type DetailMetaProps = {
  label: string;
  value: string;
  emphasize?: boolean;
};

function DetailMeta({ label, value, emphasize }: DetailMetaProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-300">{label}</span>
      <span className={emphasize ? "text-sm font-semibold text-neutral-900" : "text-sm text-neutral-600"}>
        {value}
      </span>
    </div>
  );
}

type ItemsSectionProps = {
  order: Order;
};

function ItemsSection({ order }: ItemsSectionProps) {
  return (
    <section className="px-6 py-8">
      <header className="flex flex-col gap-2 border-b border-neutral-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">商品信息</h2>
          <p className="text-sm text-neutral-500">共 {order.lineItems.length} 项</p>
        </div>
        <p className="text-sm font-semibold text-neutral-900">
          实付 {formatMoney(order.totalPrice.amount, order.totalPrice.currencyCode)}
        </p>
      </header>
      <div className="-mx-6 mt-4 overflow-x-auto">
        <div className="min-w-full px-6">
          <div className="hidden grid-cols-[1.5fr_1fr_1fr] gap-6 pb-3 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300 lg:grid">
            <span>商品</span>
            <span className="text-right">单价</span>
            <span className="text-right">小计</span>
          </div>
          <ul className="divide-y divide-neutral-100">
            {order.lineItems.map((item) => (
              <li
                key={item.id}
                className="grid gap-6 py-4 lg:grid-cols-[1.5fr_1fr_1fr] lg:items-center"
              >
                <div className="flex items-center gap-4">
                  {item.image ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                      <Image
                        fill
                        sizes="56px"
                        src={item.image.url}
                        alt={item.image.altText || item.productTitle}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white text-[11px] text-neutral-400">
                      无图
                    </div>
                  )}
                  <div className="space-y-1 text-sm text-neutral-600">
                    <p className="font-semibold text-neutral-900">{item.productTitle}</p>
                    {item.variantTitle ? (
                      <p className="text-xs text-neutral-500">{item.variantTitle}</p>
                    ) : null}
                    <p className="text-xs text-neutral-400">数量 × {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 lg:hidden">
                  <span>单价</span>
                  <span>{formatMoney(item.unitPrice.amount, item.unitPrice.currencyCode)}</span>
                </div>
                <div className="hidden text-right text-sm font-semibold text-neutral-900 lg:block">
                  {formatMoney(item.unitPrice.amount, item.unitPrice.currencyCode)}
                </div>
                <div className="flex items-center justify-between text-sm font-semibold text-neutral-900 lg:hidden">
                  <span>小计</span>
                  <span>{formatMoney(item.totalPrice.amount, item.totalPrice.currencyCode)}</span>
                </div>
                <div className="hidden text-right text-sm font-semibold text-neutral-900 lg:block">
                  {formatMoney(item.totalPrice.amount, item.totalPrice.currencyCode)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AccountOrderDetail;
