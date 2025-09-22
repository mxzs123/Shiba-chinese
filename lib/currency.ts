import type { Money } from "lib/api/types";

const DEFAULT_JPY_TO_CNY_RATE = 0.052;

function parseRate(rate: string | undefined) {
  if (!rate) {
    return undefined;
  }

  const parsed = Number.parseFloat(rate);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return parsed;
}

export function getJpyToCnyRate() {
  const envRate = parseRate(process.env.NEXT_PUBLIC_JPY_TO_CNY_RATE);
  return envRate ?? DEFAULT_JPY_TO_CNY_RATE;
}

export function convertJpyToCny(value: Money, rate = getJpyToCnyRate()) {
  const amount = Number.parseFloat(value.amount);
  if (!Number.isFinite(amount)) {
    return {
      amount: "0.00",
      currencyCode: "CNY",
    } satisfies Money;
  }

  const converted = amount * rate;
  return {
    amount: converted.toFixed(2),
    currencyCode: "CNY",
  } satisfies Money;
}
