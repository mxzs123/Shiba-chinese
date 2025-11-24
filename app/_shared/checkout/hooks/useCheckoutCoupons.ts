"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Cart, Coupon, User } from "lib/api/types";
import {
  applyCouponAction,
  removeCouponAction,
  redeemCouponCodeAction,
} from "../actions";
import { isCouponCurrentlyActive } from "../utils";

type UseCheckoutCouponsOptions = {
  customer?: User;
  availableCoupons: Coupon[];
  currentCart?: Cart;
  applySelectionToCart: (cart?: Cart) => Cart | undefined;
  setCurrentCart: (cart: Cart | undefined) => void;
};

export function useCheckoutCoupons({
  customer,
  availableCoupons,
  currentCart,
  applySelectionToCart,
  setCurrentCart,
}: UseCheckoutCouponsOptions) {
  const [availableCouponList, setAvailableCouponList] = useState<Coupon[]>(() =>
    availableCoupons.filter(isCouponCurrentlyActive),
  );

  const [couponProcessingCode, setCouponProcessingCode] = useState<
    string | null
  >(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  // 当 availableCoupons 变化时更新列表
  useEffect(() => {
    setAvailableCouponList(availableCoupons.filter(isCouponCurrentlyActive));
  }, [availableCoupons]);

  const appliedCouponCodes = useMemo(() => {
    return new Set(
      (currentCart?.appliedCoupons || []).map((entry) =>
        entry.coupon.code.toLowerCase(),
      ),
    );
  }, [currentCart?.appliedCoupons]);

  const handleApplyCoupon = useCallback(
    async (code: string) => {
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
    },
    [applySelectionToCart, setCurrentCart],
  );

  const handleRemoveCoupon = useCallback(
    async (code: string) => {
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
    },
    [applySelectionToCart, setCurrentCart],
  );

  const handleRedeemCoupon = useCallback(
    async (
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
        if (!isCouponCurrentlyActive(redeemedCoupon)) {
          return prev;
        }
        return [redeemedCoupon, ...prev];
      });

      const displayName = redeemedCoupon.title || redeemedCoupon.code;
      setCouponSuccess(`已兑换优惠券 ${displayName}`);

      return { success: true };
    },
    [customer?.id],
  );

  return {
    availableCouponList,
    couponProcessingCode,
    couponError,
    couponSuccess,
    appliedCouponCodes,
    handleApplyCoupon,
    handleRemoveCoupon,
    handleRedeemCoupon,
  };
}
