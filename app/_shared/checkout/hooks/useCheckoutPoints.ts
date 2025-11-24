"use client";

import { useCallback, useEffect, useState } from "react";
import type { PointAccount } from "lib/api/types";

type UseCheckoutPointsOptions = {
  loyaltyAccount?: PointAccount;
  payableBeforePoints: number;
  internalTestingEnabled: boolean;
};

export function useCheckoutPoints({
  loyaltyAccount,
  payableBeforePoints,
  internalTestingEnabled,
}: UseCheckoutPointsOptions) {
  const [pointsInput, setPointsInput] = useState("");
  const [pointsApplied, setPointsApplied] = useState(0);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [pointsSuccess, setPointsSuccess] = useState<string | null>(null);

  const loyaltyBalance = loyaltyAccount?.balance ?? 0;
  const maxPointRedeemable = Math.min(
    loyaltyBalance,
    Math.floor(payableBeforePoints),
  );
  const effectivePointsApplied = internalTestingEnabled ? 0 : pointsApplied;
  const pointsRemaining = Math.max(loyaltyBalance - pointsApplied, 0);

  // 当 maxPointRedeemable 变化时自动调整 pointsApplied
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

  const handlePointsInputChange = useCallback((value: string) => {
    if (!/^[0-9]*$/.test(value)) {
      return;
    }
    setPointsInput(value);
    setPointsError(null);
    setPointsSuccess(null);
  }, []);

  const applyPoints = useCallback(
    (rawValue: number) => {
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
    },
    [maxPointRedeemable],
  );

  const handleApplyPoints = useCallback(() => {
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
  }, [loyaltyBalance, pointsInput, applyPoints]);

  const handleApplyMaxPoints = useCallback(() => {
    applyPoints(maxPointRedeemable);
  }, [applyPoints, maxPointRedeemable]);

  const handleResetPoints = useCallback(() => {
    setPointsApplied(0);
    setPointsInput("");
    setPointsError(null);
    setPointsSuccess(null);
  }, []);

  return {
    pointsInput,
    pointsApplied,
    pointsError,
    pointsSuccess,
    loyaltyBalance,
    maxPointRedeemable,
    effectivePointsApplied,
    pointsRemaining,
    handlePointsInputChange,
    handleApplyPoints,
    handleApplyMaxPoints,
    handleResetPoints,
  };
}
