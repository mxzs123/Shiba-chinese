import { now, thisYear } from "./mock-shared";
import type { Address, Membership, PointAccount, PointRule, User } from "./types";
import { customerCoupons } from "./mock-checkout";

export const demoAddress: Address = {
  id: "addr-demo-home",
  firstName: "芝园",
  lastName: "会员",
  phone: "+86 13800000000",
  country: "中国",
  countryCode: "CN",
  province: "上海市",
  city: "上海",
  district: "黄浦区",
  postalCode: "200001",
  address1: "中山东一路 12 号",
  address2: "1001 室",
  isDefault: true,
  formatted: ["上海市黄浦区中山东一路 12 号", "1001 室", "上海", "中国 200001"],
};

export const officeAddress: Address = {
  id: "addr-demo-office",
  firstName: "芝园",
  lastName: "会员",
  phone: "+86 13800000000",
  country: "中国",
  countryCode: "CN",
  province: "上海市",
  city: "上海",
  district: "杨浦区",
  postalCode: "200082",
  address1: "政益路 88 号",
  address2: "A 座 502",
  isDefault: false,
  formatted: ["上海市杨浦区政益路 88 号", "A 座 502", "上海", "中国 200082"],
};

export const membership: Membership = {
  id: "member-tier-gold",
  tier: "金卡会员",
  level: 3,
  since: `${thisYear}-01-05T08:00:00.000Z`,
  expiresAt: `${thisYear}-12-31T23:59:59.000Z`,
  benefits: ["消费满 ¥199 免运费", "每月 2 张补贴券", "专属客服与线下快线"],
  next: {
    title: "升级至铂金会员",
    requirement: "年度消费满 ¥5,000 或积分累计 5,000 以上",
  },
};

const loyaltyAccount: PointAccount = {
  userId: "user-demo",
  balance: 320,
  updatedAt: now.toISOString(),
  transactions: [
    {
      id: "point-earn-001",
      type: "earn",
      amount: 300,
      balanceAfter: 320,
      occurredAt: `${thisYear}-04-18T10:15:00.000Z`,
      description: "完成订单 ORD-00001 获得积分",
      referenceOrderId: "ord-demo-001",
    },
    {
      id: "point-adjust-001",
      type: "adjust",
      amount: 20,
      balanceAfter: 20,
      occurredAt: `${thisYear}-03-08T11:30:00.000Z`,
      description: "联系客服补发积分",
    },
  ],
};

const loyaltyRules: PointRule[] = [
  {
    id: "rule-earn-order",
    title: "下单即得积分",
    description: "每消费 ¥1 获得 1 积分，订单完成后 24 小时内到账",
    kind: "earn",
  },
  {
    id: "rule-redeem",
    title: "积分抵扣规则",
    description: "100 积分可抵扣 ¥10，无最低消费限制，可与优惠券叠加使用",
    kind: "redeem",
  },
  {
    id: "rule-expire",
    title: "有效期说明",
    description: "积分以自然年为周期，于次年 3 月 31 日统一清零，请及时使用",
    kind: "notice",
  },
];

export const loyaltyAccounts: PointAccount[] = [loyaltyAccount];
export const pointRules: PointRule[] = loyaltyRules;

export const users: User[] = [
  {
    id: "user-demo",
    email: "member@shiba-commerce.cn",
    firstName: "芝园",
    lastName: "会员",
    phone: "+86 13800000000",
    nickname: "芝园会员",
    createdAt: `${thisYear}-01-05T08:00:00.000Z`,
    updatedAt: now.toISOString(),
    defaultAddress: demoAddress,
    addresses: [demoAddress, officeAddress],
    loyalty: loyaltyAccount,
    membership,
    coupons: customerCoupons,
    identityVerification: {
      status: "unverified",
    },
  },
];
