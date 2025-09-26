"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PrimaryButton } from "app/_shared";
import { AddressFormFields } from "@/app/_shared/address";
import { DefaultBadge } from "@/app/_shared/account/DefaultBadge";
import { CouponRedeemForm } from "app/_shared/coupons";
import {
  addAddressAction,
  applyCouponAction,
  removeCouponAction,
  setDefaultAddressAction,
  redeemCouponCodeAction,
} from "./actions";
import { filterCartBySelectedMerchandise } from "@/components/cart/cart-selection";
import { cn } from "lib/utils";
import type {
  Address,
  Cart,
  Coupon,
  PaymentMethod,
  PointAccount,
  ShippingMethod,
  User,
  AddressInput,
} from "lib/api/types";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Plus,
  Ticket,
  Truck,
  Wallet,
} from "lucide-react";

type CheckoutClientProps = {
  cart?: Cart;
  customer?: User;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  availableCoupons: Coupon[];
  selectedMerchandiseIds?: string[];
  requiresPrescriptionReview?: boolean;
};

type AddressFormState = Omit<AddressInput, "id">;

const DEFAULT_ADDRESS_FORM: AddressFormState = {
  firstName: "",
  lastName: "",
  phone: "",
  phoneCountryCode: "+86",
  company: "",
  country: "中国",
  countryCode: "CN",
  province: "",
  city: "",
  district: "",
  postalCode: "",
  address1: "",
  address2: "",
  isDefault: false,
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

function formatAddressLines(address: Address) {
  if (address.formatted && address.formatted.length > 0) {
    return address.formatted;
  }

  const lines = [
    address.address1,
    address.address2,
    [address.city, address.district].filter(Boolean).join(", "),
    [address.province, address.postalCode].filter(Boolean).join(" "),
    [
      address.country,
      address.countryCode ? `(${address.countryCode.toUpperCase()})` : undefined,
    ]
      .filter(Boolean)
      .join(" "),
  ].filter((value) => Boolean(value && value.trim().length > 0));

  return lines;
}

function formatAddressPhone(address: Address) {
  const parts = [address.phoneCountryCode, address.phone]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0));

  return parts.join(" ");
}

type CheckoutActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "accent" | "accentOutline" | "ghost";
  size?: "default" | "sm";
};

function CheckoutActionButton({
  variant = "primary",
  size = "default",
  type = "button",
  className,
  ...props
}: CheckoutActionButtonProps) {
  const sizeClasses = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";

  const variantClasses =
    variant === "primary"
      ? "bg-[#049e6b] text-white hover:brightness-105 disabled:bg-[#049e6b]/40 disabled:text-white/80"
      : variant === "secondary"
        ? "border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 disabled:border-neutral-200 disabled:text-neutral-300"
        : variant === "accent"
          ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-200 disabled:text-white/80"
          : variant === "accentOutline"
            ? "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 disabled:border-emerald-200 disabled:text-emerald-200"
            : "text-xs font-semibold text-emerald-600 hover:text-emerald-500 disabled:text-neutral-300";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition disabled:cursor-not-allowed",
        sizeClasses,
        variantClasses,
        className,
      )}
      {...props}
    />
  );
}

const SELECTABLE_CARD_SELECTED_CLASSES = "border-[#049e6b] bg-[#049e6b]/10";
const SELECTABLE_CARD_UNSELECTED_CLASSES =
  "border-neutral-200 hover:border-[#049e6b]/60 hover:bg-[#049e6b]/5 focus-within:border-[#049e6b]/60 focus-within:bg-[#049e6b]/5";

export function CheckoutClient({
  cart,
  customer,
  shippingMethods,
  paymentMethods,
  availableCoupons,
  selectedMerchandiseIds,
  requiresPrescriptionReview = false,
}: CheckoutClientProps) {
  const router = useRouter();
  const initialAddresses = customer?.addresses ?? [];
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<
    string | undefined
  >(
    initialAddresses.find((entry) => entry.isDefault)?.id ||
      initialAddresses[0]?.id,
  );
  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    shippingMethods[0]?.id || "",
  );
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    paymentMethods[0]?.id || "",
  );
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
  useEffect(() => {
    setCurrentCart(applySelectionToCart(cart));
  }, [applySelectionToCart, cart]);
  const [availableCouponList, setAvailableCouponList] =
    useState<Coupon[]>(availableCoupons);
  const [addressForm, setAddressForm] =
    useState<AddressFormState>(DEFAULT_ADDRESS_FORM);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSubmitting, setAddressSubmitting] = useState(false);
  const [defaultUpdatingId, setDefaultUpdatingId] = useState<string | null>(
    null,
  );
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [couponProcessingCode, setCouponProcessingCode] = useState<
    string | null
  >(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<
    "idle" | "pending" | "success"
  >("idle");
  const [pointsInput, setPointsInput] = useState("");
  const [pointsApplied, setPointsApplied] = useState(0);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [pointsSuccess, setPointsSuccess] = useState<string | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId(undefined);
      return;
    }

    if (selectedAddressId) {
      const exists = addresses.some((entry) => entry.id === selectedAddressId);
      if (exists) {
        return;
      }
    }

    const fallback =
      addresses.find((entry) => entry.isDefault)?.id || addresses[0]?.id;
    setSelectedAddressId(fallback);
  }, [addresses, selectedAddressId]);

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

  const selectedAddress = useMemo(
    () => addresses.find((entry) => entry.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

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

  const rawPayable = itemsSubtotal - couponsTotal + shippingFee;
  const payableBeforePoints = Number.isFinite(rawPayable)
    ? Math.max(rawPayable, 0)
    : 0;

  const loyaltyAccount: PointAccount | undefined = customer?.loyalty;
  const loyaltyBalance = loyaltyAccount?.balance ?? 0;
  const maxPointRedeemable = Math.min(
    loyaltyBalance,
    Math.floor(payableBeforePoints),
  );
  const payable = Math.max(payableBeforePoints - pointsApplied, 0);
  const pointsRemaining = Math.max(loyaltyBalance - pointsApplied, 0);
  const paymentLocked = paymentModalOpen && paymentStep === "pending";

  useEffect(() => {
    if (maxPointRedeemable <= 0) {
      if (pointsApplied !== 0) {
        setPointsApplied(0);
      }
      if (pointsInput !== "") {
        setPointsInput("");
      }
      setPointsError(null);
      setPointsSuccess(null);
      return;
    }

    if (pointsApplied > maxPointRedeemable) {
      setPointsApplied(maxPointRedeemable);
      setPointsInput(String(maxPointRedeemable));
      setPointsError("积分抵扣金额已根据当前应付总计自动调整。");
      setPointsSuccess(null);
    }
  }, [maxPointRedeemable, pointsApplied, pointsInput]);

  const handlePointsInputChange = (value: string) => {
    if (!/^[0-9]*$/.test(value)) {
      return;
    }
    setPointsInput(value);
    setPointsError(null);
    setPointsSuccess(null);
  };

  const applyPoints = (rawValue: number) => {
    if (!maxPointRedeemable || maxPointRedeemable <= 0) {
      setPointsApplied(0);
      setPointsInput("");
      setPointsError("暂无可用积分可抵扣。");
      setPointsSuccess(null);
      return;
    }

    const clamped = Math.max(
      0,
      Math.min(Math.floor(rawValue), maxPointRedeemable),
    );

    if (clamped === 0) {
      setPointsApplied(0);
      setPointsInput("");
      setPointsError(null);
      setPointsSuccess("已取消积分抵扣。");
      return;
    }

    if (clamped !== rawValue) {
      setPointsError(`已自动调整为可抵扣的积分数 ${clamped}。`);
    } else {
      setPointsError(null);
    }

    setPointsApplied(clamped);
    setPointsInput(String(clamped));
    setPointsSuccess(null);
  };

  const handleApplyPoints = () => {
    if (!loyaltyBalance) {
      setPointsError("当前账户暂无积分可用。");
      setPointsSuccess(null);
      return;
    }

    const parsed = Number.parseInt(pointsInput, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setPointsApplied(0);
      setPointsInput("");
      setPointsError(null);
      setPointsSuccess("已取消积分抵扣。");
      return;
    }

    applyPoints(parsed);
  };

  const handleApplyMaxPoints = () => {
    applyPoints(maxPointRedeemable);
  };

  const handleResetPoints = () => {
    setPointsApplied(0);
    setPointsInput("");
    setPointsError(null);
    setPointsSuccess(null);
  };

  const updateAddressForm = (partial: Partial<AddressFormState>) => {
    setAddressForm((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm(DEFAULT_ADDRESS_FORM);
    setAddressError(null);
  };

  const validateAddressForm = () => {
    if (!addressForm.firstName.trim() || !addressForm.lastName.trim()) {
      return "请填写收件人的姓与名";
    }

    if (!addressForm.phoneCountryCode?.trim()) {
      return "请选择国际区号";
    }

    if (!addressForm.phone?.trim()) {
      return "请填写联系方式";
    }

    if (!addressForm.country.trim()) {
      return "请填写国家或地区";
    }

    if (!addressForm.city.trim()) {
      return "请填写城市";
    }

    if (!addressForm.address1.trim()) {
      return "请填写街道地址";
    }

    return null;
  };

  const handleSubmitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddressError(null);

    const validationError = validateAddressForm();
    if (validationError) {
      setAddressError(validationError);
      return;
    }

    if (!customer?.id) {
      setAddressError("未找到当前用户，无法保存地址");
      return;
    }

    try {
      setAddressSubmitting(true);
      const result = await addAddressAction(customer.id, addressForm);

      if (!result.success) {
        setAddressError(result.error);
        return;
      }

      setAddresses(result.data.addresses);
      setSelectedAddressId(result.data.added.id);
      resetAddressForm();
      setIsAddingAddress(false);
    } finally {
      setAddressSubmitting(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!customer?.id) {
      setAddressError("未找到当前用户，无法设置默认地址");
      return;
    }

    try {
      setDefaultUpdatingId(addressId);
      const result = await setDefaultAddressAction(customer.id, addressId);

      if (!result.success) {
        setAddressError(result.error);
        return;
      }

      setAddresses(result.data.addresses);
      setSelectedAddressId(addressId);
    } finally {
      setDefaultUpdatingId(null);
    }
  };

  const handleApplyCoupon = async (code: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    setCouponProcessingCode(code);

    const result = await applyCouponAction(code);

    if (!result.success) {
      setCouponError(result.error);
      setCouponProcessingCode(null);
      return;
    }

    setCurrentCart(applySelectionToCart(result.data));
    setCouponProcessingCode(null);
    setCouponSuccess(`已应用优惠券 ${code}`);
  };

  const handleRemoveCoupon = async (code: string) => {
    setCouponError(null);
    setCouponSuccess(null);
    setCouponProcessingCode(code);

    const result = await removeCouponAction(code);

    if (!result.success) {
      setCouponError(result.error);
      setCouponProcessingCode(null);
      return;
    }

    setCurrentCart(applySelectionToCart(result.data));
    setCouponProcessingCode(null);
    setCouponSuccess(`已移除优惠券 ${code}`);
  };

  const handleRedeemCoupon = async (
    code: string,
  ): Promise<{ success: true } | { success: false; error?: string }> => {
    setCouponError(null);
    setCouponSuccess(null);

    if (!customer?.id) {
      const message = "请登录后再兑换优惠券。";
      return { success: false, error: message };
    }

    const result = await redeemCouponCodeAction(customer.id, code);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const redeemedCoupon = result.data.coupon;

    setAvailableCouponList((prev) => {
      const exists = prev.some(
        (entry) =>
          entry.code.toLowerCase() === redeemedCoupon.code.toLowerCase(),
      );
      if (exists) {
        return prev;
      }
      return [redeemedCoupon, ...prev];
    });

    const displayName = redeemedCoupon.title || redeemedCoupon.code;
    setCouponSuccess(`已兑换优惠券 ${displayName}`);

    return { success: true };
  };

  const appliedCouponCodes = useMemo(() => {
    return new Set(
      (currentCart?.appliedCoupons || []).map((entry) =>
        entry.coupon.code.toLowerCase(),
      ),
    );
  }, [currentCart?.appliedCoupons]);

  const cartIsEmpty = !currentCart || currentCart.lines.length === 0;
  const canProceedToPay =
    !cartIsEmpty && selectedAddress && selectedShipping && selectedPayment;

  const clearRedirectTimer = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
  };

  const handleOpenPayment = () => {
    if (!canProceedToPay) {
      return;
    }

    clearRedirectTimer();
    setPaymentModalOpen(true);
    setPaymentStep("pending");
  };

  const handleClosePayment = () => {
    clearRedirectTimer();
    setPaymentModalOpen(false);
    setPaymentStep("idle");
  };

  const handleNavigateToSuccess = () => {
    clearRedirectTimer();
    setPaymentModalOpen(false);
    setPaymentStep("idle");
    router.push(
      requiresPrescriptionReview
        ? "/checkout/prescription-review"
        : "/checkout/success",
    );
  };

  const handleMockPaymentComplete = () => {
    setPaymentStep("success");
    clearRedirectTimer();
    redirectTimerRef.current = setTimeout(() => {
      handleNavigateToSuccess();
    }, 800);
  };

  const handlePaymentFailed = () => {
    clearRedirectTimer();
    setPaymentModalOpen(false);
    setPaymentStep("idle");
    router.push("/checkout/failed");
  };

  useEffect(() => {
    return () => {
      clearRedirectTimer();
    };
  }, []);

  if (cartIsEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-200 bg-white/80 px-6 py-16 text-center shadow-sm shadow-black/[0.02]">
        <h2 className="text-2xl font-semibold text-neutral-900">购物车为空</h2>
        <p className="mt-3 text-sm text-neutral-500">
          请先挑选商品加入购物车，再返回结算页完成订单。
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-full border border-neutral-900 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            返回购物车
          </Link>
          <Link
            href="/search"
            className="rounded-full border border-neutral-200 px-5 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-900 hover:text-neutral-900"
          >
            浏览商品
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div
        className={cn(
          "space-y-8",
          paymentLocked && "pointer-events-none opacity-50",
        )}
      >
        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">
                收货地址
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                选择已有地址或新增地址用于本次配送。
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingAddress((prev) => !prev);
                setAddressError(null);
              }}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
              disabled={paymentLocked}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> 新增收货地址
            </button>
          </header>
          <div className="mt-6 space-y-4">
            {addresses.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                暂无收货地址，请先新增一个地址。
              </p>
            ) : (
              <ul className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = address.id === selectedAddressId;
                  const isUpdating = defaultUpdatingId === address.id;
                  const displayPhone = formatAddressPhone(address);
                  const addressLines = formatAddressLines(address);
                  return (
                    <li key={address.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition",
                          isSelected
                            ? SELECTABLE_CARD_SELECTED_CLASSES
                            : SELECTABLE_CARD_UNSELECTED_CLASSES,
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="checkout-address"
                              className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                              checked={isSelected}
                              onChange={() => setSelectedAddressId(address.id)}
                              disabled={paymentLocked}
                            />
                            <div>
                              <p className="text-sm font-semibold text-neutral-900">
                                {`${address.lastName}${address.firstName}`}
                              </p>
                              {displayPhone ? (
                                <p className="text-xs text-neutral-500">
                                  {displayPhone}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {address.isDefault ? (
                              <DefaultBadge />
                            ) : (
                              <button
                                type="button"
                                className={cn(
                                  "text-xs font-medium text-neutral-500 transition hover:text-neutral-900",
                                  (paymentLocked || isUpdating) && "opacity-60",
                                )}
                                onClick={() =>
                                  handleSetDefaultAddress(address.id)
                                }
                                disabled={paymentLocked || isUpdating}
                              >
                                {isUpdating ? "设置中..." : "设为默认"}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {addressLines.length === 0
                            ? null
                            : addressLines.map((line) => (
                                <p key={line}>{line}</p>
                              ))}
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {addressError ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {addressError}
            </p>
          ) : null}
          {isAddingAddress ? (
            <form
              className="mt-6 space-y-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/80 p-4"
              onSubmit={handleSubmitAddress}
            >
              <h3 className="text-sm font-semibold text-neutral-800">
                新增收货地址
              </h3>
              <AddressFormFields
                value={addressForm}
                onChange={updateAddressForm}
                disabled={addressSubmitting}
                showDefaultToggle
              />
              <div className="flex gap-3 pt-2">
                <PrimaryButton
                  type="submit"
                  className="w-full justify-center"
                  disabled={addressSubmitting}
                  loading={addressSubmitting}
                  loadingText="保存中..."
                >
                  保存地址
                </PrimaryButton>
                <button
                  type="button"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
                  onClick={() => {
                    setIsAddingAddress(false);
                    resetAddressForm();
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
          <header className="flex items-center gap-2 text-neutral-900">
            <Truck className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-semibold">配送方式</h2>
          </header>
          <p className="mt-1 text-sm text-neutral-500">
            配送费用将根据所选方式更新，可在发货前调整。
          </p>
          <div className="mt-4 grid gap-3">
            {shippingMethods.map((method) => {
              const isSelected = method.id === selectedShippingId;
              return (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition",
                    isSelected
                      ? SELECTABLE_CARD_SELECTED_CLASSES
                      : SELECTABLE_CARD_UNSELECTED_CLASSES,
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="checkout-shipping"
                        className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                        checked={isSelected}
                        onChange={() => setSelectedShippingId(method.id)}
                        disabled={paymentLocked}
                      />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {method.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {method.carrier}
                          {method.estimatedDelivery
                            ? ` · ${method.estimatedDelivery}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    {method.description ? (
                      <p className="text-xs text-neutral-500">
                        {method.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">
                    {formatCurrency(
                      toNumber(method.price.amount),
                      method.price.currencyCode,
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
          <header className="flex items-center gap-2 text-neutral-900">
            <Ticket className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-semibold">优惠券</h2>
          </header>
          <p className="mt-1 text-sm text-neutral-500">
            选择可用优惠券，金额与规则均可在后端配置。
          </p>
          <CouponRedeemForm
            className="mt-4"
            onRedeem={handleRedeemCoupon}
            submitLabel="立即兑换"
            pendingLabel="兑换中..."
          />
          <div className="mt-4 space-y-3">
            {availableCouponList.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                当前无可用优惠券。
              </p>
            ) : (
              availableCouponList.map((coupon) => {
                const isApplied = appliedCouponCodes.has(
                  coupon.code.toLowerCase(),
                );
                const isProcessing = couponProcessingCode === coupon.code;
                return (
                  <div
                    key={coupon.id}
                    className={cn(
                      "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                      isApplied
                        ? "border-emerald-500/60 bg-emerald-50"
                        : "border-neutral-200 bg-white",
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {coupon.title}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {coupon.description}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        适用门槛：
                        {coupon.minimumSubtotal
                          ? `满 ${coupon.minimumSubtotal.amount}${coupon.minimumSubtotal.currencyCode}`
                          : "无"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <CheckoutActionButton
                        variant={isApplied ? "accent" : "accentOutline"}
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          isApplied
                            ? handleRemoveCoupon(coupon.code)
                            : handleApplyCoupon(coupon.code)
                        }
                        disabled={isProcessing || paymentLocked}
                      >
                        {isProcessing ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden
                          />
                        ) : null}
                        {isApplied ? "已使用" : "使用优惠"}
                      </CheckoutActionButton>
                      <span className="text-sm font-semibold text-neutral-900">
                        {coupon.type === "percentage"
                          ? `${coupon.value}%`
                          : coupon.value}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {couponError ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">
              {couponError}
            </p>
          ) : null}
          {couponSuccess ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
              {couponSuccess}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
          <header className="flex items-center gap-2 text-neutral-900">
            <Wallet className="h-5 w-5" aria-hidden />
            <h2 className="text-lg font-semibold">积分抵扣</h2>
          </header>
          <p className="mt-2 text-sm text-neutral-500">
            可用积分
            <span className="mx-1 font-semibold text-neutral-900">
              {loyaltyBalance}
            </span>
            分。
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 transition focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-300">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                  placeholder={
                    maxPointRedeemable
                      ? "请输入想要使用的积分数量"
                      : "当前无可用积分"
                  }
                  value={pointsInput}
                  onChange={(event) =>
                    handlePointsInputChange(event.target.value)
                  }
                  disabled={paymentLocked || !maxPointRedeemable}
                />
                <CheckoutActionButton
                  variant="ghost"
                  size="sm"
                  onClick={handleApplyMaxPoints}
                  disabled={paymentLocked || !maxPointRedeemable}
                  className="shrink-0"
                >
                  全部使用
                </CheckoutActionButton>
              </div>
              <div className="flex items-center gap-2">
                <CheckoutActionButton
                  variant="primary"
                  onClick={handleApplyPoints}
                  disabled={paymentLocked || !loyaltyBalance}
                >
                  确认抵扣
                </CheckoutActionButton>
                <CheckoutActionButton
                  variant="secondary"
                  onClick={handleResetPoints}
                  disabled={paymentLocked || pointsApplied === 0}
                >
                  清除
                </CheckoutActionButton>
              </div>
            </div>
            {pointsApplied > 0 ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                <span>使用积分</span>
                <span className="font-semibold text-neutral-900">
                  {pointsApplied}
                </span>
                <span>抵扣金额</span>
                <span className="font-semibold text-neutral-900">
                  {formatCurrency(pointsApplied, cartCurrency)}
                </span>
                <span>剩余积分</span>
                <span className="font-semibold text-neutral-900">
                  {pointsRemaining}
                </span>
                <span>。</span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                <span>未使用积分抵扣，可根据需要输入积分数量。</span>
              </div>
            )}
          </div>
          {pointsError ? (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500">
              {pointsError}
            </p>
          ) : null}
          {pointsSuccess ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
              {pointsSuccess}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-sm shadow-black/[0.02]">
          <header className="flex items-center gap-2 text-neutral-900">
            <h2 className="text-lg font-semibold">支付方式</h2>
          </header>
          <p className="mt-1 text-sm text-neutral-500">
            目前仅提供自研扫码支付，支付完成由后端回调确认订单状态。
          </p>
          <div className="mt-4 space-y-3">
            {paymentMethods.map((method) => {
              const isSelected = method.id === selectedPaymentId;
              return (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition",
                    isSelected
                      ? SELECTABLE_CARD_SELECTED_CLASSES
                      : SELECTABLE_CARD_UNSELECTED_CLASSES,
                    method.disabled && "opacity-50",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="checkout-payment"
                      className="h-4 w-4 border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      checked={isSelected}
                      onChange={() => setSelectedPaymentId(method.id)}
                      disabled={paymentLocked || method.disabled}
                    />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {method.name}
                      </p>
                      {method.description ? (
                        <p className="text-xs text-neutral-500">
                          {method.description}
                        </p>
                      ) : null}
                      {method.instructions ? (
                        <p className="mt-1 text-xs text-neutral-400">
                          {method.instructions}
                        </p>
                      ) : null}
                      {method.type === "qr_code" ? (
                        <p className="mt-1 text-[11px] text-neutral-400">
                          * 集成完成后支持微信 / 支付宝扫码支付
                        </p>
                      ) : null}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm shadow-black/[0.02]">
        <h2 className="text-lg font-semibold text-neutral-900">订单摘要</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-600">商品列表</h3>
            <ul className="space-y-3">
              {(currentCart?.lines || []).map((line) => (
                <li
                  key={line.merchandise.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {line.merchandise.product.title}
                    </p>
                    {line.merchandise.title ? (
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
          <dl className="space-y-3 border-t border-dashed border-neutral-200 pt-4 text-sm text-neutral-500">
            <div className="flex items-center justify-between">
              <dt>商品金额</dt>
              <dd className="text-sm font-semibold text-neutral-900">
                {formatCurrency(itemsSubtotal, cartCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>优惠减免</dt>
              <dd className="text-sm font-semibold text-emerald-600">
                {formatCurrency(-couponsTotal, cartCurrency)}
              </dd>
            </div>
            {pointsApplied > 0 ? (
              <div className="flex items-center justify-between">
                <dt>积分抵扣</dt>
                <dd className="text-sm font-semibold text-emerald-600">
                  {formatCurrency(-pointsApplied, cartCurrency)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt>运费</dt>
              <dd className="text-sm font-semibold text-neutral-900">
                {formatCurrency(shippingFee, cartCurrency)}
              </dd>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-base font-semibold text-neutral-900">
              <dt>应付总计</dt>
              <dd className="text-base font-semibold text-neutral-900">
                {formatCurrency(payable, cartCurrency)}
              </dd>
            </div>
          </dl>
          <PrimaryButton
            type="button"
            className="w-full justify-center"
            onClick={handleOpenPayment}
            disabled={!canProceedToPay || paymentModalOpen}
          >
            去支付
          </PrimaryButton>
          <p className="text-xs text-neutral-400">
            核对信息无误后点击去支付，支付过程采用二维码方式。
            实际支付成功以后端回调为准，当前为占位实现。
          </p>
        </div>
      </aside>

      {paymentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                自研扫码支付
              </h3>
              <button
                type="button"
                className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
                onClick={handleClosePayment}
              >
                关闭
              </button>
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              二维码为占位图，待接入后端接口后替换为真实支付码。
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex h-56 w-56 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-400">
                {/* TODO: Replace with backend QR code + payment status polling */}
                QR Code Placeholder
              </div>
              {paymentStep === "pending" ? (
                <div className="flex w-full flex-col items-center gap-3">
                  <p className="text-xs text-neutral-500">
                    请使用微信 / 支付宝扫码，完成后点击下方按钮模拟支付完成。
                  </p>
                  <PrimaryButton
                    type="button"
                    onClick={handleMockPaymentComplete}
                    className="w-full justify-center"
                  >
                    模拟支付完成
                  </PrimaryButton>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400 transition hover:text-neutral-600"
                    onClick={handlePaymentFailed}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                    支付遇到问题？
                  </button>
                </div>
              ) : null}
              {paymentStep === "success" ? (
                <div className="flex w-full flex-col items-center gap-3 rounded-xl bg-emerald-50 px-4 py-4 text-sm text-emerald-600">
                  <p>支付成功（模拟），即将跳转到结果页。</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 transition hover:text-emerald-600"
                    onClick={handleNavigateToSuccess}
                  >
                    立即查看结果页
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-500 transition hover:border-neutral-900 hover:text-neutral-900"
                onClick={handleClosePayment}
              >
                返回继续编辑
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
