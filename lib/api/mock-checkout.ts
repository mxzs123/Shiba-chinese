import { thisYear } from "./mock-shared";
import type {
  AppliedCoupon,
  Coupon,
  CustomerCoupon,
  PaymentMethod,
  ShippingMethod,
} from "./types";

const CURRENCY = "JPY" as const;
const CHECKOUT_FALLBACK = "/checkout" as const;

const desktopShippingMethods: ShippingMethod[] = [
  {
    id: "ship-sf-same-day",
    name: "当日速配",
    carrier: "顺丰速运",
    description: "16:00 前支付最快当日送达，限核心城区",
    price: { amount: "25.00", currencyCode: CURRENCY },
    estimatedDelivery: "当日送达",
  },
  {
    id: "ship-sf-standard",
    name: "次日达",
    carrier: "顺丰速运",
    description: "默认线路，支持查看实时物流进度",
    price: { amount: "12.00", currencyCode: CURRENCY },
    estimatedDelivery: "预计 1-2 个工作日送达",
  },
  {
    id: "ship-local-pickup",
    name: "门店自提",
    carrier: "芝园门店",
    description: "下单后 2 小时可到店自提，凭提货码核销",
    price: { amount: "0.00", currencyCode: CURRENCY },
    estimatedDelivery: "2 小时后可提",
  },
];

const desktopPaymentMethods: PaymentMethod[] = [
  {
    id: "pay-qr-shiba",
    name: "自研扫码支付",
    description: "支持微信 / 支付宝扫码，下单后展示二维码",
    type: "qr_code",
    instructions: "扫码完成支付后，由后端回调确认订单状态。",
  },
];

const welcomeCoupon: Coupon = {
  id: "coupon-welcome",
  code: "WELCOME10",
  title: "新人优惠 9 折",
  description: "首次下单立享 9 折优惠",
  type: "percentage",
  value: 10,
  startsAt: `${thisYear}-01-01T00:00:00.000Z`,
  expiresAt: `${thisYear}-12-31T23:59:59.000Z`,
  minimumSubtotal: { amount: "199.00", currencyCode: CURRENCY },
};

const springCoupon: Coupon = {
  id: "coupon-spring-15",
  code: "SPRING15",
  title: "春日茶饮 85 折",
  description: "精选茶饮系列 85 折，部分新品不参加",
  type: "percentage",
  value: 15,
  startsAt: `${thisYear}-03-01T00:00:00.000Z`,
  expiresAt: `${thisYear}-06-30T23:59:59.000Z`,
  appliesToCollectionHandles: ["matcha"],
};

const freeShippingCoupon: Coupon = {
  id: "coupon-free-ship",
  code: "FREESHIP",
  title: "全场免运券",
  description: "一次性免运费，可与积分叠加使用",
  type: "free_shipping",
  value: 0,
  startsAt: `${thisYear}-02-01T00:00:00.000Z`,
  expiresAt: `${thisYear}-08-01T23:59:59.000Z`,
};

const welcomeAppliedCoupon: AppliedCoupon = {
  coupon: welcomeCoupon,
  amount: { amount: "40.80", currencyCode: CURRENCY },
};

const customerCoupons: CustomerCoupon[] = [
  {
    id: "user-coupon-welcome",
    coupon: welcomeCoupon,
    state: "active",
    assignedAt: `${thisYear}-01-05T08:05:00.000Z`,
    expiresAt: welcomeCoupon.expiresAt,
    note: "新人礼包自动发放",
    source: "系统发放",
  },
  {
    id: "user-coupon-spring",
    coupon: springCoupon,
    state: "used",
    assignedAt: `${thisYear}-03-10T10:00:00.000Z`,
    usedAt: `${thisYear}-04-18T10:15:00.000Z`,
    orderId: "ord-demo-001",
    note: "春季茶礼促销活动",
    source: "活动领取",
  },
  {
    id: "user-coupon-ship",
    coupon: freeShippingCoupon,
    state: "expired",
    assignedAt: `${thisYear}-02-02T09:00:00.000Z`,
    expiresAt: `${thisYear}-05-30T23:59:59.000Z`,
    note: "会员日免运福利",
    source: "会员权益",
  },
];

export const coupons: Coupon[] = [welcomeCoupon, springCoupon, freeShippingCoupon];
export const shippingMethods = desktopShippingMethods;
export const paymentMethods = desktopPaymentMethods;
export const checkoutUrl = CHECKOUT_FALLBACK;
export const defaultCurrency = CURRENCY;

export { welcomeAppliedCoupon, customerCoupons };
