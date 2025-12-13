"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  Address,
  PaymentMethod,
  ShippingMethod,
  User,
} from "lib/api/types";
import { confirmPaymentAndNotifyAction } from "../actions";
import type { CheckoutVariant, PaymentStep } from "../types";

type UsePaymentFlowOptions = {
  customer?: User;
  selectedAddress?: Address;
  selectedShipping?: ShippingMethod;
  selectedPayment?: PaymentMethod;
  payable: number;
  cartCurrency: string;
  pointsApplied: number;
  variant: CheckoutVariant;
  requiresPrescriptionReview: boolean;
  canProceedToPay: boolean;
  cartIsEmpty: boolean;
};

export function usePaymentFlow({
  customer,
  selectedAddress,
  selectedShipping,
  selectedPayment,
  payable,
  cartCurrency,
  pointsApplied,
  variant,
  requiresPrescriptionReview,
  canProceedToPay,
  cartIsEmpty,
}: UsePaymentFlowOptions) {
  const router = useRouter();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>("idle");
  const [isPostPaymentFlow, setIsPostPaymentFlow] = useState(false);
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkoutRouteBase = variant === "mobile" ? "/m/checkout" : "/checkout";
  const paymentLocked = paymentModalOpen && paymentStep === "qr";
  const shouldShowCartEmptyState =
    cartIsEmpty && !paymentModalOpen && !isPostPaymentFlow;

  const clearRedirectTimer = useCallback(() => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  }, []);

  const handleNavigateToSuccess = useCallback(() => {
    clearRedirectTimer();
    router.push(
      requiresPrescriptionReview
        ? `${checkoutRouteBase}/prescription-review`
        : `${checkoutRouteBase}/success`,
    );
  }, [
    clearRedirectTimer,
    router,
    requiresPrescriptionReview,
    checkoutRouteBase,
  ]);

  const handleOpenPayment = useCallback(() => {
    if (!canProceedToPay) {
      return;
    }

    clearRedirectTimer();
    setIsPostPaymentFlow(false);
    setPaymentModalOpen(true);
    setPaymentStep("qr");
  }, [canProceedToPay, clearRedirectTimer]);

  const handleClosePayment = useCallback(() => {
    clearRedirectTimer();
    setIsPostPaymentFlow(false);
    setPaymentModalOpen(false);
    setPaymentStep("idle");
  }, [clearRedirectTimer]);

  const handleConfirmPaid = useCallback(async () => {
    if (!selectedAddress || !selectedShipping || !selectedPayment) return;

    try {
      setNotifyError(null);
      setNotifySubmitting(true);

      let key: string | null = null;
      try {
        key = window.localStorage.getItem("qr_pay_idemp");
        if (!key) {
          key = crypto.randomUUID();
          window.localStorage.setItem("qr_pay_idemp", key);
        }
      } catch {
        // ignore storage errors
      }

      const result = await confirmPaymentAndNotifyAction({
        customer,
        address: selectedAddress,
        shipping: selectedShipping,
        payment: selectedPayment,
        payable: { amount: payable, currencyCode: cartCurrency },
        pointsApplied,
        idempotencyKey: key || undefined,
        device: variant,
      });

      if (!result.success) {
        setNotifyError(result.error);
        return;
      }

      setIsPostPaymentFlow(true);
      setPaymentStep("success");
      clearRedirectTimer();
      redirectTimerRef.current = setTimeout(() => {
        handleNavigateToSuccess();
      }, 800);
    } finally {
      setNotifySubmitting(false);
    }
  }, [
    selectedAddress,
    selectedShipping,
    selectedPayment,
    customer,
    payable,
    cartCurrency,
    pointsApplied,
    variant,
    clearRedirectTimer,
    handleNavigateToSuccess,
  ]);

  // 清理定时器
  useEffect(() => {
    return () => {
      clearRedirectTimer();
    };
  }, [clearRedirectTimer]);

  return {
    paymentModalOpen,
    paymentStep,
    isPostPaymentFlow,
    notifySubmitting,
    notifyError,
    paymentLocked,
    shouldShowCartEmptyState,
    checkoutRouteBase,
    setPaymentStep,
    handleOpenPayment,
    handleClosePayment,
    handleConfirmPaid,
    handleNavigateToSuccess,
  };
}
