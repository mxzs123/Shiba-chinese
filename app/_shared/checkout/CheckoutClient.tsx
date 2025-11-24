"use client";

import { cn } from "lib/utils";
import type {
  Cart,
  Coupon,
  PaymentMethod,
  ShippingMethod,
  User,
} from "lib/api/types";

import { MobileCheckoutSummary } from "./MobileCheckoutSummary";
import { EmptyCartState, PaymentModal } from "./components";
import {
  useCheckoutAddresses,
  useCheckoutSelection,
  useCheckoutCoupons,
  useCheckoutPoints,
  usePaymentFlow,
} from "./hooks";
import {
  AddressSection,
  ShippingSection,
  CouponSection,
  PointsSection,
  PaymentMethodSection,
  OrderSummaryAside,
} from "./sections";
import type { CheckoutVariant } from "./types";

type CheckoutClientProps = {
  cart?: Cart;
  customer?: User;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  availableCoupons: Coupon[];
  selectedMerchandiseIds?: string[];
  requiresPrescriptionReview?: boolean;
  variant?: CheckoutVariant;
  internalTestingEnabled?: boolean;
};

export function CheckoutClient({
  cart,
  customer,
  shippingMethods,
  paymentMethods,
  availableCoupons,
  selectedMerchandiseIds,
  requiresPrescriptionReview = false,
  variant = "desktop",
  internalTestingEnabled = false,
}: CheckoutClientProps) {
  const initialAddresses = customer?.addresses ?? [];

  // 地址管理
  const addressState = useCheckoutAddresses({
    customer,
    initialAddresses,
  });

  // 购物车、配送、支付选择
  const selectionState = useCheckoutSelection({
    cart,
    selectedMerchandiseIds,
    shippingMethods,
    paymentMethods,
  });

  // 优惠券
  const couponState = useCheckoutCoupons({
    customer,
    availableCoupons,
    currentCart: selectionState.currentCart,
    applySelectionToCart: selectionState.applySelectionToCart,
    setCurrentCart: selectionState.setCurrentCart,
  });

  // 计算应付金额（优惠券折扣前）
  const effectiveCouponsTotal = internalTestingEnabled
    ? 0
    : selectionState.couponsTotal;
  const rawPayable =
    selectionState.itemsSubtotal -
    effectiveCouponsTotal +
    selectionState.shippingFee;
  const payableBeforePoints = Number.isFinite(rawPayable)
    ? Math.max(rawPayable, 0)
    : 0;

  // 积分抵扣
  const pointsState = useCheckoutPoints({
    loyaltyAccount: customer?.loyalty,
    payableBeforePoints,
    internalTestingEnabled,
  });

  // 最终应付金额
  const payable = Math.max(
    payableBeforePoints - pointsState.effectivePointsApplied,
    0,
  );

  // 是否可以进入支付
  const canProceedToPay = Boolean(
    !selectionState.cartIsEmpty &&
      addressState.selectedAddress &&
      selectionState.selectedShipping &&
      selectionState.selectedPayment,
  );

  // 支付流程
  const paymentState = usePaymentFlow({
    customer,
    selectedAddress: addressState.selectedAddress,
    selectedShipping: selectionState.selectedShipping,
    selectedPayment: selectionState.selectedPayment,
    payable,
    cartCurrency: selectionState.cartCurrency,
    pointsApplied: pointsState.pointsApplied,
    variant,
    requiresPrescriptionReview,
    canProceedToPay,
    cartIsEmpty: selectionState.cartIsEmpty,
  });

  // 空购物车态
  if (paymentState.shouldShowCartEmptyState) {
    return <EmptyCartState />;
  }

  const isMobile = variant === "mobile";

  return (
    <div
      className={cn(
        "grid gap-8",
        isMobile ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_360px]",
      )}
    >
      <div
        className={cn(
          "space-y-8",
          isMobile && "pb-[calc(6rem+env(safe-area-inset-bottom))]",
          paymentState.paymentLocked && "pointer-events-none opacity-50",
        )}
      >
        {/* 收货地址 */}
        <AddressSection
          addresses={addressState.addresses}
          selectedAddressId={addressState.selectedAddressId}
          addressForm={addressState.addressForm}
          addressError={addressState.addressError}
          isAddingAddress={addressState.isAddingAddress}
          editingAddressId={addressState.editingAddressId}
          defaultUpdatingId={addressState.defaultUpdatingId}
          addressSubmitting={addressState.addressSubmitting}
          variant={variant}
          disabled={paymentState.paymentLocked}
          onSelect={addressState.setSelectedAddressId}
          onEdit={addressState.handleEditAddress}
          onSubmit={addressState.handleSubmitAddress}
          onSetDefault={addressState.handleSetDefaultAddress}
          onToggleAdd={addressState.handleToggleAddAddress}
          onFormChange={addressState.updateAddressForm}
          onCancel={addressState.handleCancelAddAddress}
        />

        {/* 配送方式 */}
        <ShippingSection
          shippingMethods={shippingMethods}
          selectedShippingId={selectionState.selectedShippingId}
          variant={variant}
          disabled={paymentState.paymentLocked}
          onSelect={selectionState.setSelectedShippingId}
        />

        {/* 优惠券（内测模式隐藏） */}
        {!internalTestingEnabled && (
          <CouponSection
            availableCouponList={couponState.availableCouponList}
            appliedCouponCodes={couponState.appliedCouponCodes}
            couponProcessingCode={couponState.couponProcessingCode}
            couponError={couponState.couponError}
            couponSuccess={couponState.couponSuccess}
            variant={variant}
            disabled={paymentState.paymentLocked}
            onApply={couponState.handleApplyCoupon}
            onRemove={couponState.handleRemoveCoupon}
            onRedeem={couponState.handleRedeemCoupon}
          />
        )}

        {/* 积分抵扣（内测模式隐藏） */}
        {!internalTestingEnabled && (
          <PointsSection
            loyaltyBalance={pointsState.loyaltyBalance}
            maxPointRedeemable={pointsState.maxPointRedeemable}
            pointsInput={pointsState.pointsInput}
            pointsApplied={pointsState.pointsApplied}
            pointsRemaining={pointsState.pointsRemaining}
            pointsError={pointsState.pointsError}
            pointsSuccess={pointsState.pointsSuccess}
            variant={variant}
            disabled={paymentState.paymentLocked}
            cartCurrency={selectionState.cartCurrency}
            onInputChange={pointsState.handlePointsInputChange}
            onApply={pointsState.handleApplyPoints}
            onApplyMax={pointsState.handleApplyMaxPoints}
            onReset={pointsState.handleResetPoints}
          />
        )}

        {/* 支付方式（内测模式隐藏） */}
        {!internalTestingEnabled && (
          <PaymentMethodSection
            paymentMethods={paymentMethods}
            selectedPaymentId={selectionState.selectedPaymentId}
            variant={variant}
            disabled={paymentState.paymentLocked}
            onSelect={selectionState.setSelectedPaymentId}
          />
        )}
      </div>

      {/* 桌面端订单摘要 */}
      {!isMobile && (
        <OrderSummaryAside
          cartLines={selectionState.currentCart?.lines || []}
          itemsSubtotal={selectionState.itemsSubtotal}
          couponsTotal={effectiveCouponsTotal}
          pointsApplied={pointsState.effectivePointsApplied}
          shippingFee={selectionState.shippingFee}
          payable={payable}
          currencyCode={selectionState.cartCurrency}
          canProceedToPay={canProceedToPay}
          paymentModalOpen={paymentState.paymentModalOpen}
          internalTestingEnabled={internalTestingEnabled}
          onPayment={paymentState.handleOpenPayment}
        />
      )}

      {/* 移动端订单摘要 */}
      {isMobile && (
        <MobileCheckoutSummary
          cartLines={selectionState.currentCart?.lines || []}
          itemsSubtotal={selectionState.itemsSubtotal}
          couponsTotal={effectiveCouponsTotal}
          pointsApplied={pointsState.effectivePointsApplied}
          shippingFee={selectionState.shippingFee}
          payable={payable}
          currencyCode={selectionState.cartCurrency}
          canProceedToPay={canProceedToPay}
          onPayment={paymentState.handleOpenPayment}
          paymentDisabled={paymentState.paymentModalOpen}
        />
      )}

      {/* 支付弹窗 */}
      <PaymentModal
        open={paymentState.paymentModalOpen}
        step={paymentState.paymentStep}
        notifySubmitting={paymentState.notifySubmitting}
        notifyError={paymentState.notifyError}
        onClose={paymentState.handleClosePayment}
        onConfirmPaid={paymentState.handleConfirmPaid}
        onNavigateToSuccess={paymentState.handleNavigateToSuccess}
        onStepChange={paymentState.setPaymentStep}
      />
    </div>
  );
}
