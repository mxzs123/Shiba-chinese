import { clsx, type ClassValue } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const createUrl = (
  pathname: string,
  params: URLSearchParams | ReadonlyURLSearchParams,
) => {
  const paramsString = params.toString();
  const queryString = `${paramsString.length ? "?" : ""}${paramsString}`;

  return `${pathname}${queryString}`;
};

export const validateEnvironmentVariables = () => {
  if (!process.env.COMMERCE_API_URL) {
    console.warn(
      "[commerce] COMMERCE_API_URL 未配置，系统将使用内置的模拟数据。",
    );
  }

  const rate = process.env.NEXT_PUBLIC_JPY_TO_CNY_RATE;
  if (rate && Number.isNaN(Number.parseFloat(rate))) {
    console.warn(
      "[commerce] NEXT_PUBLIC_JPY_TO_CNY_RATE 配置无效，将使用默认的 0.052。",
    );
  }
};
