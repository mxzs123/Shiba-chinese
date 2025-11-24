"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cart, PaymentMethod, ShippingMethod } from "lib/api/types";
import { filterCartBySelectedMerchandise } from "@/components/cart/cart-selection";
import { toNumber } from "../utils";

type UseCheckoutSelectionOptions = {
  cart?: Cart;
  selectedMerchandiseIds?: string[];
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
};

export function useCheckoutSelection({
  cart,
  selectedMerchandiseIds,
  shippingMethods,
  paymentMethods,
}: UseCheckoutSelectionOptions) {
  const selectedMerchandiseIdSet = useMemo(
    () => new Set(selectedMerchandiseIds?.filter(Boolean) ?? []),
    [selectedMerchandiseIds],
  );

  const applySelectionToCart = useCallback(
    (nextCart?: Cart) =>
      filterCartBySelectedMerchandise(nextCart, selectedMerchandiseIdSet),
    [selectedMerchandiseIdSet],
  );

  const [currentCart, setCurrentCart] = useState<Cart | undefined>(() =>
    applySelectionToCart(cart),
  );

  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    shippingMethods[0]?.id || "",
  );

  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    paymentMethods[0]?.id || "",
  );

  // 当 cart prop 变化时更新 currentCart
  useEffect(() => {
    setCurrentCart(applySelectionToCart(cart));
  }, [applySelectionToCart, cart]);

  // 当 shippingMethods 变化时确保选中项有效
  useEffect(() => {
    if (!shippingMethods.length) {
      setSelectedShippingId("");
      return;
    }

    const exists = shippingMethods.some(
      (method) => method.id === selectedShippingId,
    );

    if (!exists) {
      setSelectedShippingId(shippingMethods[0]!.id);
    }
  }, [shippingMethods, selectedShippingId]);

  // 当 paymentMethods 变化时确保选中项有效
  useEffect(() => {
    if (!paymentMethods.length) {
      setSelectedPaymentId("");
      return;
    }

    const exists = paymentMethods.some(
      (method) => method.id === selectedPaymentId,
    );

    if (!exists) {
      setSelectedPaymentId(paymentMethods[0]!.id);
    }
  }, [paymentMethods, selectedPaymentId]);

  const selectedShipping = useMemo(
    () => shippingMethods.find((entry) => entry.id === selectedShippingId),
    [shippingMethods, selectedShippingId],
  );

  const selectedPayment = useMemo(
    () => paymentMethods.find((entry) => entry.id === selectedPaymentId),
    [paymentMethods, selectedPaymentId],
  );

  const cartCurrency =
    currentCart?.cost.totalAmount.currencyCode ||
    selectedShipping?.price.currencyCode ||
    "JPY";

  const itemsSubtotalRaw = toNumber(currentCart?.cost.subtotalAmount.amount);
  const couponsTotalRaw = toNumber(currentCart?.cost.discountAmount?.amount);
  const shippingFeeRaw = toNumber(selectedShipping?.price.amount);

  const itemsSubtotal = Number.isFinite(itemsSubtotalRaw)
    ? itemsSubtotalRaw
    : 0;
  const couponsTotal = Number.isFinite(couponsTotalRaw) ? couponsTotalRaw : 0;
  const shippingFee = Number.isFinite(shippingFeeRaw) ? shippingFeeRaw : 0;

  const cartIsEmpty = !currentCart || currentCart.lines.length === 0;

  return {
    currentCart,
    setCurrentCart,
    selectedShippingId,
    setSelectedShippingId,
    selectedPaymentId,
    setSelectedPaymentId,
    selectedShipping,
    selectedPayment,
    cartCurrency,
    itemsSubtotal,
    couponsTotal,
    shippingFee,
    cartIsEmpty,
    applySelectionToCart,
  };
}
