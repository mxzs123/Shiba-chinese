import type { NewsArticle, PaymentMethod, ShippingMethod } from "../types";
import { cloneMoney } from "./money";

export function cloneNewsArticle(article: NewsArticle): NewsArticle {
  return {
    ...article,
    tags: article.tags ? [...article.tags] : undefined,
  };
}

export function cloneShippingMethod(method: ShippingMethod): ShippingMethod {
  return {
    ...method,
    price: cloneMoney(method.price),
  };
}

export function clonePaymentMethod(method: PaymentMethod): PaymentMethod {
  return { ...method };
}
