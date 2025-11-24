import type {
  BackendApiResponse,
  CartListRequest,
  Coupon,
  CustomerCoupon,
} from "./types";
import { coupons, users } from "./mock-data";
import { cloneCustomerCoupon } from "./serializers";

function findUserRecord(userId: string) {
  return users.find((user) => user.id === userId);
}

function findCouponByCode(code: string) {
  const normalised = code.trim().toLowerCase();
  if (!normalised) {
    return undefined;
  }

  return coupons.find(
    (entry) => entry.code.trim().toLowerCase() === normalised,
  );
}

function determineCouponState(
  coupon: Coupon,
): "active" | "scheduled" | "expired" {
  const now = Date.now();

  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return "scheduled";
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
    return "expired";
  }

  return "active";
}

export async function getAvailableCoupons(): Promise<Coupon[]> {
  return coupons.map((entry) => ({ ...entry }));
}

export async function getCartAvailableCoupons(
  payload?: CartListRequest,
): Promise<BackendApiResponse<Coupon[]>> {
  const data = await getAvailableCoupons();

  return {
    methodDescription: null,
    otherData: payload ? JSON.stringify(payload) : null,
    status: true,
    msg: "接口响应成功",
    data,
    code: 0,
  };
}

export async function getCouponByCode(
  code: string,
): Promise<Coupon | undefined> {
  const coupon = findCouponByCode(code);

  if (!coupon) {
    return undefined;
  }

  return { ...coupon };
}

export async function getCustomerCoupons(
  userId: string,
): Promise<CustomerCoupon[]> {
  const user = findUserRecord(userId);

  if (!user || !user.coupons) {
    return [];
  }

  return user.coupons.map(cloneCustomerCoupon);
}

export async function redeemCouponForUser(
  userId: string,
  code: string,
): Promise<CustomerCoupon> {
  const user = findUserRecord(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const coupon = findCouponByCode(code);

  if (!coupon) {
    throw new Error("优惠券不存在或已下架");
  }

  user.coupons = user.coupons ?? [];

  const exists = user.coupons.some(
    (entry) => entry.coupon.code.toLowerCase() === coupon.code.toLowerCase(),
  );

  if (exists) {
    throw new Error("该优惠券已在账户中，无需重复兑换");
  }

  const state = determineCouponState(coupon);
  const now = new Date().toISOString();

  const customerCoupon: CustomerCoupon = {
    id: `user-coupon-${crypto.randomUUID()}`,
    coupon,
    state,
    assignedAt: now,
    expiresAt: coupon.expiresAt,
    source: "兑换码输入",
  };

  user.coupons.push(customerCoupon);
  user.updatedAt = now;

  return cloneCustomerCoupon(customerCoupon);
}
