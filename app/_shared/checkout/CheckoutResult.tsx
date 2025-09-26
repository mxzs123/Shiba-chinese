import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { Address, Order } from "lib/api/types";
import { cn } from "lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  RotateCw,
  XCircle,
} from "lucide-react";

type ResultAction = {
  label: string;
  href: string;
  prefetch?: boolean;
  external?: boolean;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "link";
};

type CheckoutResultProps = {
  variant: "success" | "failed";
  title: string;
  description: string;
  primaryAction: ResultAction;
  secondaryActions?: ResultAction[];
  order?: Order;
  tips?: Array<{ title: string; description: string }>;
  children?: ReactNode;
};

const PRIMARY_ACTION_CLASSES =
  "inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-105";

const SECONDARY_ACTION_CLASSES =
  "inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-xl border border-neutral-200 px-6 text-sm font-semibold text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900";

const GHOST_ACTION_CLASSES =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-neutral-500 transition hover:text-neutral-900";

const LINK_ACTION_CLASSES =
  "inline-flex items-center gap-2 text-sm font-medium text-neutral-600 underline-offset-4 transition hover:text-neutral-900 hover:underline";

export function CheckoutResult({
  variant,
  title,
  description,
  primaryAction,
  secondaryActions = [],
  order,
  tips,
  children,
}: CheckoutResultProps) {
  const Icon = variant === "success" ? CheckCircle2 : XCircle;
  const accentRing =
    variant === "success"
      ? "bg-emerald-50 text-emerald-600"
      : "bg-red-50 text-red-500";

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 lg:px-0">
      <div className="rounded-3xl border border-neutral-200 bg-white/95 p-8 shadow-sm shadow-black/[0.02] md:p-10">
        <div className="flex flex-col items-center text-center">
          <span
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full",
              accentRing,
            )}
          >
            <Icon className="h-10 w-10" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-semibold text-neutral-900">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-neutral-500">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ResultActionLink action={primaryAction} />
            {secondaryActions.map((action) => (
              <ResultActionLink key={action.label} action={action} />
            ))}
          </div>
        </div>

        {order ? <OrderSummary order={order} /> : null}

        {children}

        {tips && tips.length > 0 ? (
          <section className="mt-12 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-6">
            <h2 className="text-base font-semibold text-neutral-900">
              后续提醒
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              {tips.map((tip) => (
                <li key={tip.title}>
                  <p className="font-medium text-neutral-800">{tip.title}</p>
                  <p className="mt-1 text-neutral-500">{tip.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ResultActionLink({ action }: { action: ResultAction }) {
  const { href, label, prefetch, external, icon, variant = "primary" } = action;

  const baseClasses =
    variant === "secondary"
      ? SECONDARY_ACTION_CLASSES
      : variant === "ghost"
        ? GHOST_ACTION_CLASSES
        : variant === "link"
          ? LINK_ACTION_CLASSES
          : PRIMARY_ACTION_CLASSES;

  const targetProps = external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={baseClasses}
      {...targetProps}
    >
      <span>{label}</span>
      {icon ??
        (external ? <ExternalLink className="h-4 w-4" aria-hidden /> : null)}
    </Link>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const fulfillmentDate =
    order.fulfilledAt || order.processedAt || order.createdAt;
  const formattedCreatedAt = formatDate(order.createdAt);
  const formattedFulfilledAt = fulfillmentDate
    ? formatDate(fulfillmentDate)
    : "待更新";
  const coupons = order.appliedCoupons || [];

  return (
    <section className="mt-12 border-t border-neutral-200 pt-10">
      <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">订单摘要</h2>
          <p className="mt-1 text-sm text-neutral-500">
            以下内容来自最近一次成功支付的订单，供后续客服与对账参考。
          </p>
        </div>
        <div className="rounded-xl bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-600">
          订单号 {order.number}
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            下单时间
          </dt>
          <dd className="mt-2 text-sm font-semibold text-neutral-900">
            {formattedCreatedAt}
          </dd>
          <dt className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
            支付状态
          </dt>
          <dd className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> 已支付
          </dd>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            应付总计
          </dt>
          <dd className="mt-2 text-sm font-semibold text-neutral-900">
            {formatMoney(
              order.totalPrice.amount,
              order.totalPrice.currencyCode,
            )}
          </dd>
          <dt className="mt-4 text-xs font-medium uppercase tracking-wide text-neutral-500">
            发货进度
          </dt>
          <dd className="mt-2 text-sm font-semibold text-neutral-900">
            {formattedFulfilledAt}
          </dd>
        </div>
      </dl>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6">
          <h3 className="text-sm font-semibold text-neutral-800">商品列表</h3>
          <ul className="mt-4 space-y-4">
            {order.lineItems.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-4 rounded-xl border border-neutral-100 p-3"
              >
                {item.image ? (
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                    <Image
                      fill
                      sizes="64px"
                      className="object-cover"
                      alt={item.image.altText || item.productTitle}
                      src={item.image.url}
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.productTitle}
                  </p>
                  {item.variantTitle ? (
                    <p className="text-xs text-neutral-500">
                      {item.variantTitle}
                    </p>
                  ) : null}
                  <p className="text-xs text-neutral-400">
                    数量 × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-neutral-900">
                  {formatMoney(
                    item.totalPrice.amount,
                    item.totalPrice.currencyCode,
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6">
            <h3 className="text-sm font-semibold text-neutral-800">配送信息</h3>
            <AddressBlock address={order.shippingAddress} />
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/90 p-6">
            <h3 className="text-sm font-semibold text-neutral-800">费用明细</h3>
            <dl className="mt-4 space-y-3 text-sm text-neutral-600">
              <div className="flex items-center justify-between">
                <dt>商品金额</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatMoney(
                    order.subtotalPrice.amount,
                    order.subtotalPrice.currencyCode,
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>运费</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatMoney(
                    order.totalShipping.amount,
                    order.totalShipping.currencyCode,
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>税费</dt>
                <dd className="font-semibold text-neutral-900">
                  {formatMoney(
                    order.totalTax.amount,
                    order.totalTax.currencyCode,
                  )}
                </dd>
              </div>
              {coupons.length > 0 ? (
                <div className="flex items-center justify-between text-emerald-600">
                  <dt>优惠减免</dt>
                  <dd className="font-semibold">
                    -
                    {formatMoney(
                      coupons
                        .reduce(
                          (total, coupon) =>
                            total + Number(coupon.amount.amount),
                          0,
                        )
                        .toFixed(2),
                      order.currencyCode,
                    )}
                  </dd>
                </div>
              ) : null}
              {typeof order.loyaltyDelta === "number" ? (
                <div className="flex items-center justify-between text-emerald-600">
                  <dt>积分奖励</dt>
                  <dd className="font-semibold">+{order.loyaltyDelta}</dd>
                </div>
              ) : null}
              <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-base font-semibold text-neutral-900">
                <dt>实付金额</dt>
                <dd>
                  {formatMoney(
                    order.totalPrice.amount,
                    order.totalPrice.currencyCode,
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AddressBlock({ address }: { address: Address }) {
  const lines = getFormattedAddressLines(address);
  const phone = formatAddressPhone(address);

  return (
    <div className="mt-4 space-y-1 text-sm text-neutral-600">
      <p className="font-semibold text-neutral-900">
        {address.lastName}
        {address.firstName}
      </p>
      {phone ? <p>{phone}</p> : null}
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(amount: string, currency: string) {
  const numeric = Number(amount);
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(safeAmount);
}

function getFormattedAddressLines(address: Address) {
  if (address.formatted && address.formatted.length > 0) {
    return address.formatted;
  }

  const primaryLines = address.address1
    ? address.address1
        .split(/\n+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    : [];

  const computed = [
    ...primaryLines,
    address.address2,
    [address.city, address.district].filter(Boolean).join(", "),
    [address.province, address.postalCode].filter(Boolean).join(" "),
    [
      address.country,
      address.countryCode ? `(${address.countryCode.toUpperCase()})` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  ].filter((entry): entry is string => Boolean(entry && entry.trim()));

  return computed.length ? computed : ["地址信息待完善"];
}

function formatAddressPhone(address: Address) {
  const parts = [address.phoneCountryCode, address.phone]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0));

  return parts.join(" ");
}

export const checkoutResultPlaceholders = {
  retryPayment: {
    label: "重新尝试支付",
    href: "/checkout",
    icon: <RotateCw className="h-4 w-4" aria-hidden />,
  },
  continueShopping: {
    label: "继续浏览商品",
    href: "/search",
    icon: <ArrowRight className="h-4 w-4" aria-hidden />,
  },
};
