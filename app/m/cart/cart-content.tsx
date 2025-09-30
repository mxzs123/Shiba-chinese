"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useFormStatus } from "react-dom";
import { ChevronUp, CreditCard, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

import { PrimaryButton } from "app/_shared";
import { PRIMARY_BUTTON_COLOR_CLASSES } from "app/_shared/PrimaryButton";
import { CartSelectionCheckbox } from "components/cart/cart-selection-checkbox";
import { DeleteItemButton } from "components/cart/delete-item-button";
import { updateItemQuantity } from "components/cart/actions";
import {
  CART_SELECTED_MERCHANDISE_COOKIE,
  CART_SELECTED_MERCHANDISE_MAX_AGE,
  CART_SELECTED_MERCHANDISE_FORM_FIELD,
} from "components/cart/constants";
import { QuantityInput } from "components/quantity-input";
import Price from "components/price";
import { DEFAULT_OPTION } from "lib/constants";
import { cn, createUrl } from "lib/utils";

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
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xl font-semibold text-neutral-800">购物车是空的</p>
      <p className="mt-2 text-sm text-neutral-500">
        先去逛逛，挑选喜欢的商品再回来吧。
      </p>
      <Link
        href="/search"
        prefetch
        className={cn(
          "mt-6 inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
          PRIMARY_BUTTON_COLOR_CLASSES,
        )}
      >
        浏览商品
      </Link>
    </div>
  );
}

type UpdateCartItemFn = ReturnType<typeof useCart>["updateCartItem"];

function CartItemQuantityControl({
  merchandiseId,
  productTitle,
  quantity,
  optimisticUpdate,
}: {
  merchandiseId: string;
  productTitle: string;
  quantity: number;
  optimisticUpdate: UpdateCartItemFn;
}) {
  const [, startTransition] = useTransition();

  const handleQuantityChange = useCallback(
    (nextQuantity: number) => {
      if (nextQuantity === quantity) {
        return;
      }

      optimisticUpdate(merchandiseId, "set", nextQuantity);

      startTransition(() => {
        updateItemQuantity(null, {
          merchandiseId,
          quantity: nextQuantity,
        })
          .then((result) => {
            if (typeof result === "string") {
              console.error(result);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });
    },
    [merchandiseId, optimisticUpdate, quantity],
  );

  return (
    <QuantityInput
      value={quantity}
      onChange={handleQuantityChange}
      min={1}
      max={99}
      decrementAriaLabel={`减少 ${productTitle} 数量`}
      incrementAriaLabel={`增加 ${productTitle} 数量`}
      inputAriaLabel={`${productTitle} 数量输入`}
    />
  );
}

export function MobileCartContent() {
  const { cart, updateCartItem } = useCart();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    [selectedItems, cart?.cost.totalAmount.currencyCode, cart?.appliedCoupons],
  );

  const serializedSelection = useMemo(
    () => serializeSelectedMerchandiseIds(selectedMerchandise),
    [selectedMerchandise],
  );

  const allSelected =
    items.length > 0 && selectedMerchandise.size === items.length;
  const hasSelection = selectedMerchandise.size > 0;

  if (!cart || cart.lines.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <>
      {/* 商品列表 */}
      <div className="flex-1 overflow-y-auto">
        {/* 全选 */}
        <div className="border-b border-neutral-200 bg-white px-4 py-3">
          <CartSelectionCheckbox
            checked={allSelected}
            indeterminate={
              selectedMerchandise.size > 0 &&
              selectedMerchandise.size < items.length
            }
            onCheckedChange={handleSelectAll}
            label={
              <span className="text-sm text-neutral-600">
                全选
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-xs text-neutral-400">
                    已选 {selectedItems.length} 件
                  </span>
                )}
              </span>
            }
          />
        </div>

        {/* 商品列表 */}
        <div className="space-y-3 p-4">
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
                className="relative flex gap-3 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <div className="flex-none pt-1">
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
                <div className="relative h-20 w-20 flex-none overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  <Image
                    fill
                    sizes="80px"
                    className="object-cover"
                    alt={
                      item.merchandise.product.featuredImage.altText ||
                      item.merchandise.product.title
                    }
                    src={item.merchandise.product.featuredImage.url}
                  />
                  <div className="absolute left-1 top-1">
                    <DeleteItemButton
                      item={item}
                      optimisticUpdate={updateCartItem}
                    />
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div>
                    <Link
                      href={merchandiseUrl}
                      prefetch
                      className="line-clamp-2 text-sm font-medium text-neutral-900"
                    >
                      {item.merchandise.product.title}
                    </Link>
                    {item.merchandise.title !== DEFAULT_OPTION && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.merchandise.title}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <CartItemQuantityControl
                      merchandiseId={item.merchandise.id}
                      productTitle={item.merchandise.product.title}
                      quantity={item.quantity}
                      optimisticUpdate={updateCartItem}
                    />
                    <Price
                      amount={item.cost.totalAmount.amount}
                      currencyCode={item.cost.totalAmount.currencyCode}
                      className="text-sm font-semibold text-neutral-900"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* 底部固定栏 */}
      <div className="border-t border-neutral-200 bg-white p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <span>合计：</span>
            <Price
              amount={selectedTotals.totalAmount.amount}
              currencyCode={selectedTotals.totalAmount.currencyCode}
              className="text-lg font-semibold text-primary"
            />
            <ChevronUp className="h-4 w-4" />
          </button>
          <form action={redirectToCheckout}>
            <input
              type="hidden"
              name={CART_SELECTED_MERCHANDISE_FORM_FIELD}
              value={serializedSelection}
            />
            <CheckoutButton disabled={!hasSelection} />
          </form>
        </div>
        {!hasSelection && (
          <p className="mt-2 text-xs text-rose-500">请选择至少一件商品</p>
        )}
      </div>

      {/* 订单详情抽屉 */}
      <Transition show={isDetailsOpen} as={Fragment}>
        <Dialog
          onClose={() => setIsDetailsOpen(false)}
          className="relative z-50"
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="fixed inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-start justify-between">
                <Dialog.Title className="text-lg font-semibold text-neutral-900">
                  订单概览
                </Dialog.Title>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <dl className="space-y-3 text-sm text-neutral-600">
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
                      className="text-sm text-neutral-900"
                    />
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>运费</dt>
                  <dd className="text-sm text-neutral-500">以结算页计算为准</dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
                  <dt>应付总计</dt>
                  <dd>
                    <Price
                      amount={selectedTotals.totalAmount.amount}
                      currencyCode={selectedTotals.totalAmount.currencyCode}
                      className="text-base font-semibold text-neutral-900"
                    />
                  </dd>
                </div>
              </dl>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
