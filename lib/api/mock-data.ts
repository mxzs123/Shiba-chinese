import { goodsProducts } from "./mock-goods";
import {
  coupons,
  shippingMethods,
  paymentMethods,
  checkoutUrl,
  defaultCurrency,
} from "./mock-checkout";
import { users, loyaltyAccounts, pointRules } from "./mock-account";
import {
  products,
  collections,
  findProductByHandle,
  findCollectionByHandle,
  listVisibleCollections,
} from "./mock-products";
import { orders } from "./mock-orders";
import { surveyAssignments, surveyTemplates } from "./mock-surveys";

export { pages, menus, news, notifications } from "./mock-content";

export {
  coupons,
  shippingMethods,
  paymentMethods,
  checkoutUrl,
  defaultCurrency,
  users,
  loyaltyAccounts,
  pointRules,
  products,
  collections,
  orders,
  surveyAssignments,
  surveyTemplates,
};

export function findVariantById(variantId: string) {
  for (const product of [...products, ...goodsProducts]) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) {
      return {
        product,
        variant,
      };
    }
  }

  return undefined;
}

export { findProductByHandle, findCollectionByHandle, listVisibleCollections };
