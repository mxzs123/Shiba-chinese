"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ChevronUp, CreditCard, X } from "lucide-react";

import { PrimaryButton } from "app/_shared";
import type { CartItem } from "lib/api/types";

type MobileCheckoutSummaryProps = {
  cartLines: CartItem[];
  itemsSubtotal: number;
  couponsTotal: number;
  pointsApplied: number;
  shippingFee: number;
  payable: number;
  currencyCode: string;
  canProceedToPay: boolean;
  onPayment: () => void;
  paymentDisabled?: boolean;
};

function toNumber(amount?: string) {
  return amount ? Number(amount) : 0;
}

function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}

export function MobileCheckoutSummary({
  cartLines,
  itemsSubtotal,
  couponsTotal,
  pointsApplied,
  shippingFee,
  payable,
  currencyCode,
  canProceedToPay,
  onPayment,
  paymentDisabled = false,
}: MobileCheckoutSummaryProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      {/* 底部固定栏 */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-neutral-200 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsDetailsOpen(true)}
            className="flex items-center gap-1.5 text-sm text-neutral-600 active:text-neutral-900"
          >
            <span className="text-xs">应付总计：</span>
            <span className="text-lg font-semibold text-primary">
              {formatCurrency(payable, currencyCode)}
            </span>
            <ChevronUp className="h-4 w-4" />
          </button>
          <PrimaryButton
            type="button"
            onClick={onPayment}
            disabled={!canProceedToPay || paymentDisabled}
            className="h-10 gap-2 px-6"
            leadingIcon={<CreditCard className="h-4 w-4" aria-hidden />}
          >
            去支付
          </PrimaryButton>
        </div>
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
                  订单明细
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  展示本次订单的商品、优惠、积分和运费信息。
                </Dialog.Description>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label="关闭"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 商品列表 */}
              {cartLines.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-medium text-neutral-600">
                    商品列表
                  </h3>
                  <ul className="space-y-3">
                    {cartLines.map((line) => (
                      <li
                        key={line.merchandise.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-neutral-900">
                            {line.merchandise.product.title}
                          </p>
                          {line.merchandise.title &&
                          line.merchandise.title !== "Default Title" ? (
                            <p className="text-xs text-neutral-500">
                              {line.merchandise.title}
                            </p>
                          ) : null}
                          <p className="text-xs text-neutral-400">
                            数量 × {line.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-neutral-900">
                          {formatCurrency(
                            toNumber(line.cost.totalAmount.amount),
                            line.cost.totalAmount.currencyCode,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 价格明细 */}
              <dl className="space-y-3 border-t border-neutral-200 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">商品金额</dt>
                  <dd className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(itemsSubtotal, currencyCode)}
                  </dd>
                </div>
                {couponsTotal > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-600">优惠减免</dt>
                    <dd className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(-couponsTotal, currencyCode)}
                    </dd>
                  </div>
                )}
                {pointsApplied > 0 && (
                  <div className="flex items-center justify-between">
                    <dt className="text-neutral-600">积分抵扣</dt>
                    <dd className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(-pointsApplied, currencyCode)}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-600">运费</dt>
                  <dd className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(shippingFee, currencyCode)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
                  <dt>应付总计</dt>
                  <dd className="text-lg font-semibold text-primary">
                    {formatCurrency(payable, currencyCode)}
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
