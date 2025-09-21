"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton } from "app/_shared";
import {
  addAddressAction,
  applyCouponAction,
  removeCouponAction,
  setDefaultAddressAction,
} from "./actions";
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
import { Check, Loader2, Plus, Ticket, Truck, Wallet } from "lucide-react";

type CheckoutClientProps = {
  cart?: Cart;
  customer?: User;
  shippingMethods: ShippingMethod[];
  paymentMethods: PaymentMethod[];
  availableCoupons: Coupon[];
};

type AddressFormState = Omit<AddressInput, "id">;

const DEFAULT_ADDRESS_FORM: AddressFormState = {
  firstName: "",
  lastName: "",
  phone: "",
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
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function CheckoutClient({
  cart,
  customer,
  shippingMethods,
  paymentMethods,
  availableCoupons,
}: CheckoutClientProps) {
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
  const [currentCart, setCurrentCart] = useState<Cart | undefined>(cart);
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
    "CNY";

  const itemsSubtotal = toNumber(currentCart?.cost.subtotalAmount.amount);
  const couponsTotal = toNumber(currentCart?.cost.discountAmount?.amount);
  const shippingFee = toNumber(selectedShipping?.price.amount);
  const payable = Math.max(itemsSubtotal - couponsTotal + shippingFee, 0);

  const loyaltyAccount: PointAccount | undefined = customer?.loyalty;
  const paymentLocked = paymentModalOpen && paymentStep === "pending";

  const handleAddressFieldChange = (
    field: keyof AddressFormState,
    value: string | boolean,
  ) => {
    setAddressForm((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? value : value,
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

    if (!addressForm.phone?.trim()) {
      return "请填写联系方式";
    }

    if (!addressForm.city.trim() || !addressForm.address1.trim()) {
      return "请完善城市与详细地址";
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

    setCurrentCart(result.data);
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

    setCurrentCart(result.data);
    setCouponProcessingCode(null);
    setCouponSuccess(`已移除优惠券 ${code}`);
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

  const handleOpenPayment = () => {
    if (!canProceedToPay) {
      return;
    }

    setPaymentModalOpen(true);
    setPaymentStep("pending");
  };

  const handleClosePayment = () => {
    setPaymentModalOpen(false);
    setPaymentStep("idle");
  };

  const handleMockPaymentComplete = () => {
    setPaymentStep("success");
  };

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
                  return (
                    <li key={address.id}>
                      <label
                        className={cn(
                          "flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition",
                          isSelected
                            ? "border-neutral-900 bg-neutral-900/5"
                            : "border-neutral-200 hover:border-neutral-400",
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
                              {address.phone ? (
                                <p className="text-xs text-neutral-500">
                                  {address.phone}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {address.isDefault ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-medium text-white">
                                <Check className="h-3 w-3" aria-hidden /> 默认
                              </span>
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
                          {(address.formatted && address.formatted.length > 0
                            ? address.formatted
                            : [
                                address.country,
                                address.province,
                                address.city,
                                address.district,
                                address.address1,
                                address.address2,
                                address.postalCode,
                              ]
                          )
                            .filter(Boolean)
                            .map((line, index) => (
                              <p key={index}>{line}</p>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>姓</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.lastName}
                    onChange={(event) =>
                      handleAddressFieldChange("lastName", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>名</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.firstName}
                    onChange={(event) =>
                      handleAddressFieldChange("firstName", event.target.value)
                    }
                    required
                  />
                </label>
              </div>
              <label className="space-y-1 text-xs font-medium text-neutral-600">
                <span>手机号</span>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  value={addressForm.phone}
                  onChange={(event) =>
                    handleAddressFieldChange("phone", event.target.value)
                  }
                  required
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>国家 / 地区</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.country}
                    onChange={(event) =>
                      handleAddressFieldChange("country", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>省份</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.province}
                    onChange={(event) =>
                      handleAddressFieldChange("province", event.target.value)
                    }
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>城市</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.city}
                    onChange={(event) =>
                      handleAddressFieldChange("city", event.target.value)
                    }
                    required
                  />
                </label>
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>区 / 县</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.district}
                    onChange={(event) =>
                      handleAddressFieldChange("district", event.target.value)
                    }
                  />
                </label>
              </div>
              <label className="space-y-1 text-xs font-medium text-neutral-600">
                <span>详细地址</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  value={addressForm.address1}
                  onChange={(event) =>
                    handleAddressFieldChange("address1", event.target.value)
                  }
                  required
                />
              </label>
              <label className="space-y-1 text-xs font-medium text-neutral-600">
                <span>楼栋 / 房间号（可选）</span>
                <input
                  type="text"
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  value={addressForm.address2}
                  onChange={(event) =>
                    handleAddressFieldChange("address2", event.target.value)
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-xs font-medium text-neutral-600">
                  <span>邮编（可选）</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                    value={addressForm.postalCode}
                    onChange={(event) =>
                      handleAddressFieldChange("postalCode", event.target.value)
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    checked={addressForm.isDefault}
                    onChange={(event) =>
                      handleAddressFieldChange(
                        "isDefault",
                        event.target.checked,
                      )
                    }
                  />
                  设为默认地址
                </label>
              </div>
              <div className="flex gap-3">
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
                      ? "border-neutral-900 bg-neutral-900/5"
                      : "border-neutral-200 hover:border-neutral-400",
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
          <div className="mt-4 space-y-3">
            {availableCoupons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-500">
                当前无可用优惠券。
              </p>
            ) : (
              availableCoupons.map((coupon) => {
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
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition",
                          isApplied
                            ? "border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-950"
                            : "border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900",
                        )}
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
                      </button>
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
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-neutral-900">
              <Wallet className="h-5 w-5" aria-hidden />
              <h2 className="text-lg font-semibold">积分抵扣</h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] font-medium text-white">
              功能待接入
            </span>
          </header>
          <p className="mt-2 text-sm text-neutral-500">
            当前积分余额：
            <span className="font-semibold text-neutral-900">
              {loyaltyAccount ? loyaltyAccount.balance : 0}
            </span>
            分。抵扣规则将在确认后补充，目前仅展示样式。
          </p>
          <div className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
            积分抵扣逻辑尚未实现，等待后端策略确认后接入。
          </div>
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
                      ? "border-neutral-900 bg-neutral-900/5"
                      : "border-neutral-200 hover:border-neutral-400",
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
                <>
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
                </>
              ) : null}
              {paymentStep === "success" ? (
                <div className="w-full rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  支付成功（模拟）。待后端接入后将根据真实回调更新状态。
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
