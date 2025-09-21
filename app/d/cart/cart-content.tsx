"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";

import { DeleteItemButton } from "components/cart/delete-item-button";
import { EditItemQuantityButton } from "components/cart/edit-item-quantity-button";
import LoadingDots from "components/loading-dots";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { createUrl } from "lib/utils";

import {
  createCartAndSetCookie,
  redirectToCheckout,
} from "components/cart/actions";
import { useCart } from "components/cart/cart-context";

function CheckoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="block w-full rounded-full bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <LoadingDots className="bg-white" /> : "去结算"}
    </button>
  );
}

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-white/60 px-6 py-16 text-center">
      <p className="text-2xl font-semibold text-neutral-800">购物车是空的</p>
      <p className="mt-3 text-sm text-neutral-500">
        先去逛逛，挑选喜欢的商品再回来吧。
      </p>
      <Link
        href="/search"
        prefetch
        className="mt-8 inline-flex items-center rounded-full border border-neutral-800 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
      >
        浏览商品
      </Link>
    </div>
  );
}

export function CartContent() {
  const { cart, updateCartItem } = useCart();

  useEffect(() => {
    if (!cart) {
      createCartAndSetCookie();
    }
  }, [cart]);

  const items = useMemo(() => {
    if (!cart?.lines?.length) {
      return [];
    }

    return [...cart.lines].sort((a, b) =>
      a.merchandise.product.title.localeCompare(b.merchandise.product.title),
    );
  }, [cart]);

  if (!cart || cart.lines.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
      <section aria-label="购物车商品" className="space-y-6">
        {items.map((item) => {
          const searchParams = new URLSearchParams();

          item.merchandise.selectedOptions.forEach(({ name, value }) => {
            if (value !== DEFAULT_OPTION) {
              searchParams.set(name.toLowerCase(), value);
            }
          });

          const merchandiseUrl = createUrl(
            `/product/${item.merchandise.product.handle}`,
            searchParams,
          );

          return (
            <article
              key={item.merchandise.id}
              className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm shadow-black/[0.02] transition hover:shadow-black/[0.05] sm:flex-row"
            >
              <div className="relative h-28 w-28 flex-none overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                <Image
                  fill
                  sizes="112px"
                  className="object-cover"
                  alt={
                    item.merchandise.product.featuredImage.altText ||
                    item.merchandise.product.title
                  }
                  src={item.merchandise.product.featuredImage.url}
                />
                <div className="absolute left-2 top-2">
                  <DeleteItemButton
                    item={item}
                    optimisticUpdate={updateCartItem}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-2">
                  <Link
                    href={merchandiseUrl}
                    prefetch
                    className="text-base font-semibold text-neutral-900 transition hover:text-neutral-600"
                  >
                    {item.merchandise.product.title}
                  </Link>
                  {item.merchandise.title !== DEFAULT_OPTION ? (
                    <p className="text-sm text-neutral-500">
                      {item.merchandise.title}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white">
                    <EditItemQuantityButton
                      item={item}
                      type="minus"
                      optimisticUpdate={updateCartItem}
                    />
                    <span className="min-w-[44px] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <EditItemQuantityButton
                      item={item}
                      type="plus"
                      optimisticUpdate={updateCartItem}
                    />
                  </div>
                  <Price
                    amount={item.cost.totalAmount.amount}
                    currencyCode={item.cost.totalAmount.currencyCode}
                    className="text-right text-base font-semibold text-neutral-900"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm shadow-black/[0.02]">
        <h2 className="text-lg font-semibold text-neutral-900">订单概览</h2>
        <dl className="mt-6 space-y-3 text-sm text-neutral-600">
          <div className="flex items-center justify-between">
            <dt>商品金额</dt>
            <dd>
              <Price
                amount={cart.cost.subtotalAmount.amount}
                currencyCode={cart.cost.subtotalAmount.currencyCode}
                className="text-right text-sm text-neutral-900"
              />
            </dd>
          </div>
          {cart.cost.discountAmount ? (
            <div className="flex items-center justify-between text-emerald-600">
              <dt>优惠折扣</dt>
              <dd>
                <Price
                  amount={cart.cost.discountAmount.amount}
                  currencyCode={cart.cost.discountAmount.currencyCode}
                  className="text-right text-sm text-emerald-600"
                />
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <dt>预计税费</dt>
            <dd>
              <Price
                amount={cart.cost.totalTaxAmount.amount}
                currencyCode={cart.cost.totalTaxAmount.currencyCode}
                className="text-right text-sm text-neutral-900"
              />
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>运费</dt>
            <dd className="text-right text-sm text-neutral-500">
              以结算页计算为准
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
            <dt>应付总计</dt>
            <dd>
              <Price
                amount={cart.cost.totalAmount.amount}
                currencyCode={cart.cost.totalAmount.currencyCode}
                className="text-right text-base font-semibold text-neutral-900"
              />
            </dd>
          </div>
        </dl>
        <form action={redirectToCheckout} className="mt-8">
          <CheckoutButton />
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          下单即视为同意我们的售后政策，实际费用以结算页面为准。
        </p>
      </aside>
    </div>
  );
}

export default CartContent;
