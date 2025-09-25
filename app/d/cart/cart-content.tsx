"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { PrimaryButton } from "app/_shared";
import { PRIMARY_BUTTON_COLOR_CLASSES } from "app/_shared/PrimaryButton";
import { CartSelectionCheckbox } from "components/cart/cart-selection-checkbox";
import { DeleteItemButton } from "components/cart/delete-item-button";
import { EditItemQuantityButton } from "components/cart/edit-item-quantity-button";
import {
  CART_SELECTED_MERCHANDISE_COOKIE,
  CART_SELECTED_MERCHANDISE_MAX_AGE,
  CART_SELECTED_MERCHANDISE_FORM_FIELD,
} from "components/cart/constants";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { cn, createUrl } from "lib/utils";
import { CreditCard } from "lucide-react";

import {
  createCartAndSetCookie,
  redirectToCheckout,
} from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import {
  calculateTotalsForLines,
  buildDefaultSelection,
  parseSelectedMerchandiseIds,
  serializeSelectedMerchandiseIds,
} from "components/cart/cart-selection";

function readSelectedMerchandiseCookie() {
  if (typeof document === "undefined") {
    return undefined;
  }

  const name = `${CART_SELECTED_MERCHANDISE_COOKIE}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(name));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.slice(name.length));
}

function writeSelectedMerchandiseCookie(value: string | null) {
  if (typeof document === "undefined") {
    return;
  }

  if (value && value.length) {
    const encoded = encodeURIComponent(value);
    document.cookie = `${CART_SELECTED_MERCHANDISE_COOKIE}=${encoded}; path=/; max-age=${CART_SELECTED_MERCHANDISE_MAX_AGE}`;
  } else {
    document.cookie = `${CART_SELECTED_MERCHANDISE_COOKIE}=; path=/; max-age=0`;
  }
}

function CheckoutButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <PrimaryButton
      type="submit"
      className="w-full justify-center"
      loading={pending}
      loadingText="跳转中..."
      disabled={disabled}
      leadingIcon={<CreditCard className="h-4 w-4" aria-hidden />}
    >
      去结算
    </PrimaryButton>
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
        className={cn(
          "mt-8 inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
          PRIMARY_BUTTON_COLOR_CLASSES,
        )}
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

  const [selectedMerchandise, setSelectedMerchandise] = useState<Set<string>>(
    () => buildDefaultSelection(items),
  );
  const hasInitializedSelection = useRef(false);
  const knownMerchandiseIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(items.map((item) => item.merchandise.id));

    if (!hasInitializedSelection.current) {
      const cookieValue = readSelectedMerchandiseCookie();
      const initialIds = cookieValue
        ? parseSelectedMerchandiseIds(cookieValue).filter((id) =>
            currentIds.has(id),
          )
        : [];
      const nextSelection =
        initialIds.length > 0
          ? new Set(initialIds)
          : buildDefaultSelection(items);

      setSelectedMerchandise(nextSelection);
      hasInitializedSelection.current = true;
      knownMerchandiseIdsRef.current = currentIds;
      return;
    }

    setSelectedMerchandise((prev) => {
      const next = new Set<string>();

      items.forEach((item) => {
        const id = item.merchandise.id;
        if (prev.has(id)) {
          next.add(id);
          return;
        }

        if (!knownMerchandiseIdsRef.current.has(id)) {
          next.add(id);
        }
      });

      knownMerchandiseIdsRef.current = currentIds;
      return next;
    });
  }, [items]);

  useEffect(() => {
    if (!hasInitializedSelection.current) {
      return;
    }

    const serialized = serializeSelectedMerchandiseIds(selectedMerchandise);
    writeSelectedMerchandiseCookie(serialized);
  }, [selectedMerchandise]);

  const toggleItemSelection = useCallback((id: string, checked: boolean) => {
    setSelectedMerchandise((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!items.length) {
        return;
      }

      setSelectedMerchandise(() => {
        if (!checked) {
          return new Set();
        }

        return buildDefaultSelection(items);
      });
    },
    [items],
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedMerchandise.has(item.merchandise.id)),
    [items, selectedMerchandise],
  );

  const selectedTotals = useMemo(
    () =>
      calculateTotalsForLines(
        selectedItems,
        cart?.cost.totalAmount.currencyCode,
        cart?.appliedCoupons,
      ),
    [
      selectedItems,
      cart?.cost.totalAmount.currencyCode,
      cart?.appliedCoupons,
    ],
  );

  const serializedSelection = useMemo(
    () => serializeSelectedMerchandiseIds(selectedMerchandise),
    [selectedMerchandise],
  );

  const allSelected =
    items.length > 0 && selectedMerchandise.size === items.length;
  const hasSelection = selectedMerchandise.size > 0;

  const selectAllLabel = useMemo(
    () => (
      <span className="text-sm text-neutral-600">
        全选
        {selectedItems.length ? (
          <span className="ml-2 text-xs text-neutral-400">
            已选 {selectedItems.length} 件
          </span>
        ) : null}
      </span>
    ),
    [selectedItems.length],
  );

  const renderSelectAllCheckbox = useCallback(
    () => (
      <CartSelectionCheckbox
        checked={allSelected}
        indeterminate={
          selectedMerchandise.size > 0 &&
          selectedMerchandise.size < items.length
        }
        onCheckedChange={handleSelectAll}
        label={selectAllLabel}
      />
    ),
    [
      allSelected,
      handleSelectAll,
      items.length,
      selectAllLabel,
      selectedMerchandise.size,
    ],
  );

  const selectAllWarning = hasSelection ? null : (
    <span className="text-xs text-rose-500">请选择至少一件商品</span>
  );

  if (!cart || cart.lines.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <div className="grid gap-x-10 gap-y-10 lg:grid-cols-[2fr_1fr] lg:gap-y-5">
      <div className="hidden lg:col-span-2 lg:flex lg:items-center lg:gap-3">
        <div className="flex items-center rounded-2xl border border-neutral-200 bg-white/90 px-4 py-3 shadow-sm shadow-black/[0.02]">
          {renderSelectAllCheckbox()}
        </div>
        {selectAllWarning}
      </div>
      <section aria-label="购物车商品" className="space-y-6">
        <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white/70 px-4 py-3 lg:hidden">
          {renderSelectAllCheckbox()}
          {selectAllWarning}
        </div>
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

          const isSelected = selectedMerchandise.has(item.merchandise.id);

          return (
            <article
              key={item.merchandise.id}
              className="relative flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white/90 p-6 shadow-sm shadow-black/[0.02] transition hover:shadow-black/[0.05] sm:flex-row"
            >
              <div className="absolute right-6 top-6">
                <CartSelectionCheckbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    toggleItemSelection(item.merchandise.id, checked)
                  }
                  label={
                    <span className="sr-only">
                      {isSelected ? "取消选择" : "选择"}「
                      {item.merchandise.product.title}」
                    </span>
                  }
                />
              </div>
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
                <div className="space-y-2 pr-10 sm:pr-0">
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
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <dt>已选商品</dt>
            <dd>{selectedTotals.totalQuantity} 件</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>商品金额</dt>
            <dd>
              <Price
                amount={selectedTotals.subtotalAmount.amount}
                currencyCode={selectedTotals.subtotalAmount.currencyCode}
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
                amount={selectedTotals.totalAmount.amount}
                currencyCode={selectedTotals.totalAmount.currencyCode}
                className="text-right text-base font-semibold text-neutral-900"
              />
            </dd>
          </div>
        </dl>
        <form action={redirectToCheckout} className="mt-8">
          <input
            type="hidden"
            name={CART_SELECTED_MERCHANDISE_FORM_FIELD}
            value={serializedSelection}
          />
          <CheckoutButton disabled={!hasSelection} />
        </form>
        <p className="mt-3 text-xs text-neutral-400">
          下单即视为同意我们的售后政策，实际费用以结算页面为准。
        </p>
      </aside>
    </div>
  );
}

export default CartContent;
