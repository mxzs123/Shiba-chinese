import type {
  Address,
  AppliedCoupon,
  Collection,
  Coupon,
  CustomerCoupon,
  Membership,
  Menu,
  Notification,
  Order,
  Page,
  PaymentMethod,
  PointAccount,
  PointRule,
  Product,
  NewsArticle,
  ShippingMethod,
  SurveyAnswer,
  SurveyAssignment,
  SurveyTemplate,
  User,
} from "./types";

type ProductRecord = Product & {
  collections: string[];
  bestsellerRank: number;
};

type CollectionRecord = Collection & {
  isHidden?: boolean;
};

const CURRENCY = "JPY";
const CHECKOUT_FALLBACK = "/checkout";

const now = new Date();
const thisYear = now.getFullYear();

const featuredImage = (url: string, altText: string) => ({
  url,
  altText,
  width: 1600,
  height: 1600,
});

const demoAddress: Address = {
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

const officeAddress: Address = {
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

const membership: Membership = {
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

export const coupons: Coupon[] = [
  welcomeCoupon,
  springCoupon,
  freeShippingCoupon,
];

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

export const loyaltyAccounts: PointAccount[] = [loyaltyAccount];
export const shippingMethods = desktopShippingMethods;
export const paymentMethods = desktopPaymentMethods;
export const pointRules = loyaltyRules;

export const products: ProductRecord[] = [
  {
    id: "prod-adhd-medication",
    handle: "adhd-focus-prescription",
    availableForSale: true,
    title: "专注力调节处方药 30 粒",
    description:
      "用于缓解成人注意力缺陷与多动症状的处方药，仅限经医生诊断后使用。",
    descriptionHtml:
      "<p>处方药信息仅供演示使用，请在执业医师指导下合理用药。</p>",
    options: [
      {
        id: "opt-adhd-dosage",
        name: "剂量",
        values: ["18mg"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "399", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "399", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-adhd-18mg",
        title: "18mg",
        availableForSale: true,
        selectedOptions: [{ name: "剂量", value: "18mg" }],
        price: { amount: "399", currencyCode: CURRENCY },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1582719478148-9fffe0c0f6f3?auto=format&fit=crop&w=1600&q=80",
      "专注力调节处方药",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1582719478148-9fffe0c0f6f3?auto=format&fit=crop&w=1600&q=80",
        "专注力调节处方药包装图",
      ),
    ],
    seo: {
      title: "专注力调节处方药 30 粒",
      description: "ADHD 专用处方药，仅限凭处方购买。",
    },
    tags: ["prescription", "rx:adhd"],
    updatedAt: `${thisYear}-04-28T12:00:00.000Z`,
    collections: ["pharmacy"],
    bestsellerRank: 1,
  },
  {
    id: "prod-matcha-kit",
    handle: "matcha-latte-kit",
    availableForSale: true,
    title: "抹茶拿铁冲泡套装",
    description: "日式抹茶粉搭配燕麦奶与砂糖的基础套装，适合每日自制风味饮品。",
    descriptionHtml:
      "<p>精选宇治抹茶粉与低温烘焙燕麦奶粉，三分钟完成顺滑拿铁。套装附送咖啡师量勺与配方指南。</p>",
    options: [
      {
        id: "opt-matcha-size",
        name: "规格",
        values: ["2 杯装", "4 杯装"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "68", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "96", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-matcha-2",
        title: "2 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "2 杯装" }],
        price: { amount: "68", currencyCode: CURRENCY },
      },
      {
        id: "var-matcha-4",
        title: "4 杯装",
        availableForSale: true,
        selectedOptions: [{ name: "规格", value: "4 杯装" }],
        price: { amount: "96", currencyCode: CURRENCY },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
      "抹茶拿铁冲泡套装",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1600&q=80",
        "抹茶拿铁冲泡套装",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1600&q=80",
        "抹茶冲泡细节",
      ),
    ],
    seo: {
      title: "抹茶拿铁冲泡套装",
      description: "宇治抹茶粉与燕麦奶组合，三分钟享受日式风味。",
    },
    tags: ["featured", "drink-kit"],
    updatedAt: `${thisYear}-01-15T09:00:00.000Z`,
    collections: [
      "hidden-homepage-featured-items",
      "hidden-homepage-carousel",
      "beverage",
    ],
    bestsellerRank: 1,
  },
  {
    id: "prod-herbal",
    handle: "herbal-relax-tea",
    availableForSale: true,
    title: "草本放松花茶",
    description: "薰衣草、菊花与柠檬草的轻盈组合，日间舒缓紧张情绪。",
    descriptionHtml:
      "<p>采用低温烘干的整片花材，天然散发草本香气。无咖啡因，可作为日常补水饮品。</p>",
    options: [
      {
        id: "opt-herbal-size",
        name: "包装",
        values: ["12 袋", "24 袋"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "48", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "78", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-herbal-12",
        title: "12 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "12 袋" }],
        price: { amount: "48", currencyCode: CURRENCY },
      },
      {
        id: "var-herbal-24",
        title: "24 袋",
        availableForSale: true,
        selectedOptions: [{ name: "包装", value: "24 袋" }],
        price: { amount: "78", currencyCode: CURRENCY },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1600&q=80",
      "草本放松花茶",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=1600&q=80",
        "草本放松花茶包装",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1451743503519-47aed9b9c699?auto=format&fit=crop&w=1600&q=80",
        "草本花茶冲泡",
      ),
    ],
    seo: {
      title: "草本放松花茶",
      description: "无咖啡因花草茶，日间办公与夜间休息皆宜。",
    },
    tags: ["wellness", "herbal"],
    updatedAt: `${thisYear}-02-02T11:30:00.000Z`,
    collections: ["hidden-homepage-featured-items", "wellness", "seasonal"],
    bestsellerRank: 3,
  },
  {
    id: "prod-vitamin",
    handle: "vitamin-gummies",
    availableForSale: true,
    title: "每日维生素软糖",
    description: "基于天然果汁的综合维生素软糖，轻松补充日常所需。",
    descriptionHtml:
      "<p>含维生素 A/C/D/E 及锌，采用果胶基础配方，无人工色素。适合成年人及青少年。</p>",
    options: [
      {
        id: "opt-vitamin-flavor",
        name: "口味",
        values: ["柑橘", "莓果"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "88", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "88", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-vitamin-citrus",
        title: "柑橘",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "柑橘" }],
        price: { amount: "88", currencyCode: CURRENCY },
      },
      {
        id: "var-vitamin-berry",
        title: "莓果",
        availableForSale: true,
        selectedOptions: [{ name: "口味", value: "莓果" }],
        price: { amount: "88", currencyCode: CURRENCY },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
      "每日维生素软糖",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80",
        "每日维生素软糖",
      ),
    ],
    seo: {
      title: "每日维生素软糖",
      description: "营养补充的轻松选择，果汁风味更易坚持。",
    },
    tags: ["nutrition", "bestseller"],
    updatedAt: `${thisYear}-03-22T10:05:00.000Z`,
    collections: ["hidden-homepage-carousel", "wellness", "bestsellers"],
    bestsellerRank: 2,
  },
  {
    id: "prod-bottle",
    handle: "insulated-bottle",
    availableForSale: true,
    title: "真空不锈钢随行杯",
    description: "316 不锈钢双层真空结构，长效保温保冷，轻巧便携。",
    descriptionHtml:
      "<p>杯盖采用食品级硅胶密封圈，倒置不漏水。附赠茶漏，适合冲泡花茶或咖啡。</p>",
    options: [
      {
        id: "opt-bottle-color",
        name: "颜色",
        values: ["云灰", "湖蓝"],
      },
    ],
    priceRange: {
      minVariantPrice: { amount: "128", currencyCode: CURRENCY },
      maxVariantPrice: { amount: "138", currencyCode: CURRENCY },
    },
    variants: [
      {
        id: "var-bottle-grey",
        title: "云灰",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "云灰" }],
        price: { amount: "128", currencyCode: CURRENCY },
      },
      {
        id: "var-bottle-blue",
        title: "湖蓝",
        availableForSale: true,
        selectedOptions: [{ name: "颜色", value: "湖蓝" }],
        price: { amount: "138", currencyCode: CURRENCY },
      },
    ],
    featuredImage: featuredImage(
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80",
      "真空不锈钢随行杯",
    ),
    images: [
      featuredImage(
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80",
        "随行杯正面",
      ),
      featuredImage(
        "https://images.unsplash.com/photo-1526402468470-e0655142a49c?auto=format&fit=crop&w=1600&q=80",
        "随行杯生活场景",
      ),
    ],
    seo: {
      title: "真空不锈钢随行杯",
      description: "保温保冷兼备，附茶漏的轻便随行杯。",
    },
    tags: ["accessories"],
    updatedAt: `${thisYear}-04-12T08:20:00.000Z`,
    collections: [
      "hidden-homepage-featured-items",
      "hidden-homepage-carousel",
      "accessories",
    ],
    bestsellerRank: 4,
  },
];

const adhdProduct = products.find(
  (product) => product.id === "prod-adhd-medication",
)!;
const matchaProduct = products.find(
  (product) => product.id === "prod-matcha-kit",
)!;
const herbalProduct = products.find((product) => product.id === "prod-herbal")!;
const bottleProduct = products.find((product) => product.id === "prod-bottle")!;

const matchaVariant = matchaProduct.variants[1]!;
const herbalVariant = herbalProduct.variants[1]!;
const bottleVariant = bottleProduct.variants[1]!;
const adhdVariant = adhdProduct.variants[0]!;

export const orders: Order[] = [
  {
    id: "ord-demo-002",
    number: "ORD-00002",
    status: "processing",
    financialStatus: "paid",
    fulfillmentStatus: "unfulfilled",
    createdAt: `${thisYear}-04-27T14:12:00.000Z`,
    updatedAt: `${thisYear}-04-27T14:20:00.000Z`,
    processedAt: `${thisYear}-04-27T14:15:00.000Z`,
    subtotalPrice: { amount: "399.00", currencyCode: CURRENCY },
    totalPrice: { amount: "419.00", currencyCode: CURRENCY },
    totalTax: { amount: "0.00", currencyCode: CURRENCY },
    totalShipping: { amount: "20.00", currencyCode: CURRENCY },
    currencyCode: CURRENCY,
    lineItems: [
      {
        id: "ord-demo-002-line-1",
        productId: adhdProduct.id,
        productTitle: adhdProduct.title,
        variantId: adhdVariant.id,
        variantTitle: adhdVariant.title,
        quantity: 1,
        unitPrice: adhdVariant.price,
        totalPrice: { amount: "399.00", currencyCode: CURRENCY },
        image: adhdProduct.featuredImage,
      },
    ],
    shippingAddress: demoAddress,
    billingAddress: demoAddress,
    shippingMethod: desktopShippingMethods[1],
    customerId: "user-demo",
    appliedCoupons: [],
    loyaltyDelta: 120,
  },
  {
    id: "ord-demo-001",
    number: "ORD-00001",
    status: "fulfilled",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    createdAt: `${thisYear}-04-16T08:12:00.000Z`,
    updatedAt: `${thisYear}-04-18T12:30:00.000Z`,
    processedAt: `${thisYear}-04-16T08:15:00.000Z`,
    fulfilledAt: `${thisYear}-04-18T11:40:00.000Z`,
    subtotalPrice: { amount: "408.00", currencyCode: CURRENCY },
    totalPrice: { amount: "387.20", currencyCode: CURRENCY },
    totalTax: { amount: "0.00", currencyCode: CURRENCY },
    totalShipping: { amount: "20.00", currencyCode: CURRENCY },
    currencyCode: CURRENCY,
    lineItems: [
      {
        id: "ord-demo-001-line-1",
        productId: matchaProduct.id,
        productTitle: matchaProduct.title,
        variantId: matchaVariant.id,
        variantTitle: matchaVariant.title,
        quantity: 2,
        unitPrice: matchaVariant.price,
        totalPrice: { amount: "192.00", currencyCode: CURRENCY },
        image: matchaProduct.featuredImage,
      },
      {
        id: "ord-demo-001-line-2",
        productId: herbalProduct.id,
        productTitle: herbalProduct.title,
        variantId: herbalVariant.id,
        variantTitle: herbalVariant.title,
        quantity: 1,
        unitPrice: herbalVariant.price,
        totalPrice: { amount: "78.00", currencyCode: CURRENCY },
        image: herbalProduct.featuredImage,
      },
      {
        id: "ord-demo-001-line-3",
        productId: bottleProduct.id,
        productTitle: bottleProduct.title,
        variantId: bottleVariant.id,
        variantTitle: bottleVariant.title,
        quantity: 1,
        unitPrice: bottleVariant.price,
        totalPrice: { amount: "138.00", currencyCode: CURRENCY },
        image: bottleProduct.featuredImage,
      },
    ],
    shippingAddress: demoAddress,
    billingAddress: demoAddress,
    shippingMethod: desktopShippingMethods[1],
    customerId: "user-demo",
    appliedCoupons: [welcomeAppliedCoupon],
    loyaltyDelta: 300,
    tracking: {
      carrier: "顺丰速运",
      trackingNumber: "SF1234567890",
    },
  },
  {
    id: "ord-demo-000",
    number: "ORD-00000",
    status: "fulfilled",
    financialStatus: "paid",
    fulfillmentStatus: "fulfilled",
    createdAt: `${thisYear}-03-22T10:05:00.000Z`,
    updatedAt: `${thisYear}-03-24T18:30:00.000Z`,
    processedAt: `${thisYear}-03-22T10:08:00.000Z`,
    fulfilledAt: `${thisYear}-03-24T16:40:00.000Z`,
    subtotalPrice: { amount: "399.00", currencyCode: CURRENCY },
    totalPrice: { amount: "419.00", currencyCode: CURRENCY },
    totalTax: { amount: "0.00", currencyCode: CURRENCY },
    totalShipping: { amount: "20.00", currencyCode: CURRENCY },
    currencyCode: CURRENCY,
    lineItems: [
      {
        id: "ord-demo-000-line-1",
        productId: adhdProduct.id,
        productTitle: adhdProduct.title,
        variantId: adhdVariant.id,
        variantTitle: adhdVariant.title,
        quantity: 1,
        unitPrice: adhdVariant.price,
        totalPrice: { amount: "399.00", currencyCode: CURRENCY },
        image: adhdProduct.featuredImage,
      },
    ],
    shippingAddress: demoAddress,
    billingAddress: demoAddress,
    shippingMethod: desktopShippingMethods[1],
    customerId: "user-demo",
    appliedCoupons: [],
    loyaltyDelta: 120,
    tracking: {
      carrier: "顺丰速运",
      trackingNumber: "SF0987654321",
    },
  },
];

const adhdSurveyTemplate: SurveyTemplate = {
  id: "survey-template-adhd",
  title: "ADHD 用药随访问卷",
  description: "请确认近期的就诊情况、药物反应与使用目的，便于药师复核。",
  category: "rx:adhd",
  productTags: ["rx:adhd"],
  questions: [
    {
      id: "adhd-symptom-notes",
      type: "text",
      title: "近 30 天用药与症状变化",
      description: "请概述服药频率、是否按照医嘱调整剂量以及症状缓解情况。",
      required: true,
      placeholder: "例如：每日早晨 1 粒，症状保持稳定，无明显副作用。",
      maxLength: 400,
    },
    {
      id: "adhd-side-effects",
      type: "single_choice",
      title: "是否出现副作用",
      description: "若存在不适，请在备注中补充具体表现。",
      options: [
        { value: "none", label: "未出现副作用" },
        { value: "mild", label: "出现轻微副作用，可自行缓解" },
        { value: "severe", label: "出现明显副作用，已联系医生" },
      ],
      required: true,
    },
    {
      id: "adhd-reason",
      type: "multiple_choice",
      title: "本次购买的主要目的",
      description: "可多选，帮助我们了解复购背景。",
      options: [
        { value: "focus", label: "维持专注度" },
        { value: "inventory", label: "补齐库存，防止断档" },
        { value: "doctor", label: "医生建议继续服用" },
        { value: "other", label: "其他" },
      ],
      minChoices: 1,
      maxChoices: 3,
    },
    {
      id: "adhd-last-visit",
      type: "date",
      title: "最近一次复诊日期",
      description: "如暂未复诊，可填写计划复诊日期。",
      required: true,
    },
    {
      id: "adhd-id-proof",
      type: "upload",
      title: "处方/诊断证明",
      description: "请上传处方或医生开具的诊断证明照片，最多 2 张。",
      accept: ["image/jpeg", "image/png", "image/webp"],
      maxFiles: 2,
      maxSizeMB: 5,
    },
  ],
  updatedAt: `${thisYear}-04-20T12:00:00.000Z`,
};

const surveyAssignmentPending: SurveyAssignment = {
  id: "survey-assignment-ord-demo-002-adhd",
  userId: "user-demo",
  orderId: "ord-demo-002",
  orderNumber: "ORD-00002",
  category: "rx:adhd",
  templateId: adhdSurveyTemplate.id,
  productIds: [adhdProduct.id],
  productTitles: [adhdProduct.title],
  createdAt: `${thisYear}-04-27T14:15:00.000Z`,
  updatedAt: `${thisYear}-04-27T14:15:00.000Z`,
  status: "pending",
  answers: [
    {
      questionId: "adhd-symptom-notes",
      value: "坚持每日早晨服用 18mg，症状保持稳定。",
    },
    {
      questionId: "adhd-side-effects",
      value: "none",
    },
    {
      questionId: "adhd-reason",
      value: ["focus", "inventory"],
    },
    {
      questionId: "adhd-last-visit",
      value: `${thisYear}-04-12`,
    },
    {
      questionId: "adhd-id-proof",
      value: [],
    },
  ],
};

const surveyAssignmentSubmitted: SurveyAssignment = {
  id: "survey-assignment-ord-demo-000-adhd",
  userId: "user-demo",
  orderId: "ord-demo-000",
  orderNumber: "ORD-00000",
  category: "rx:adhd",
  templateId: adhdSurveyTemplate.id,
  productIds: [adhdProduct.id],
  productTitles: [adhdProduct.title],
  createdAt: `${thisYear}-03-22T10:10:00.000Z`,
  updatedAt: `${thisYear}-03-23T09:10:00.000Z`,
  submittedAt: `${thisYear}-03-23T09:10:00.000Z`,
  status: "submitted",
  answers: [
    {
      questionId: "adhd-symptom-notes",
      value: "按照医嘱每日上午 1 粒，注意力明显提升。",
    },
    {
      questionId: "adhd-side-effects",
      value: "mild",
    },
    {
      questionId: "adhd-reason",
      value: ["doctor"],
    },
    {
      questionId: "adhd-last-visit",
      value: `${thisYear}-03-18`,
    },
    {
      questionId: "adhd-id-proof",
      value: [
        {
          id: "proof-front",
          name: "prescription-front.jpg",
          url: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&q=80",
          uploadedAt: `${thisYear}-03-23T09:08:00.000Z`,
        },
      ],
    },
  ],
};

export const surveyTemplates: SurveyTemplate[] = [adhdSurveyTemplate];
export const surveyAssignments: SurveyAssignment[] = [
  surveyAssignmentPending,
  surveyAssignmentSubmitted,
];

export const collections: CollectionRecord[] = [
  {
    handle: "pharmacy",
    title: "处方药专区",
    description: "仅限凭处方购买的专属药品与用药指导问卷。",
    seo: {
      title: "处方药专区",
      description: "严选处方药品，需完成合规问卷后发货。",
    },
    updatedAt: `${thisYear}-04-20T00:00:00.000Z`,
    path: "/search/pharmacy",
  },
  {
    handle: "hidden-homepage-featured-items",
    title: "主页推荐",
    description: "用于首页三格展示的精选商品。",
    seo: {
      title: "主页推荐",
      description: "精选商品快速浏览",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
  },
  {
    handle: "hidden-homepage-carousel",
    title: "轮播精选",
    description: "首页轮播使用的隐藏集合。",
    seo: {
      title: "轮播精选",
      description: "首页轮播展示的商品",
    },
    updatedAt: `${thisYear}-01-01T00:00:00.000Z`,
    path: "/search",
    isHidden: true,
  },
  {
    handle: "beverage",
    title: "冲泡饮品",
    description: "风味饮品与冲泡套装。",
    seo: {
      title: "冲泡饮品",
      description: "好喝又好做的饮品解决方案",
    },
    updatedAt: `${thisYear}-01-20T00:00:00.000Z`,
    path: "/search/beverage",
  },
  {
    handle: "wellness",
    title: "日常健康",
    description: "补给、调理与放松类产品。",
    seo: {
      title: "日常健康",
      description: "让身体恢复平衡的精选产品",
    },
    updatedAt: `${thisYear}-02-10T00:00:00.000Z`,
    path: "/search/wellness",
  },
  {
    handle: "accessories",
    title: "生活器具",
    description: "随行杯、量具等配件。",
    seo: {
      title: "生活器具",
      description: "让冲泡更简单的生活配件",
    },
    updatedAt: `${thisYear}-03-05T00:00:00.000Z`,
    path: "/search/accessories",
  },
];

export const pages: Page[] = [
  {
    id: "page-about",
    title: "品牌故事",
    handle: "about",
    body: "# 关于芝园药局\n\n我们与多家日本制造工厂合作，将轻配方饮品与健康补给带到中国市场。",
    bodySummary: "关于品牌的介绍页。",
    seo: {
      title: "关于芝园药局",
      description: "了解我们的理念与产品溯源",
    },
    createdAt: `${thisYear}-01-01T00:00:00.000Z`,
    updatedAt: `${thisYear}-03-12T10:00:00.000Z`,
  },
  {
    id: "page-faq",
    title: "常见问题",
    handle: "faq",
    body: `# 常见问题\n\n涵盖下单支付、配送签收、售后退换以及会员积分等高频问题。页面将根据客服反馈定期更新。`,
    bodySummary: "了解下单、配送、售后与会员权益的常见问题。",
    seo: {
      title: "常见问题",
      description: "了解芝园药局的下单流程、配送时效、退货规则与客服支持渠道",
    },
    createdAt: `${thisYear}-01-15T00:00:00.000Z`,
    updatedAt: `${thisYear}-02-12T08:00:00.000Z`,
  },
];

export const menus: Record<string, Menu[]> = {
  "next-js-frontend-header-menu": [
    { title: "商品一览", path: "/search" },
    { title: "常见疑问", path: "/faq" },
    { title: "会员中心", path: "/account/membership" },
    { title: "关于我们", path: "/about" },
  ],
  "next-js-frontend-footer-menu": [
    { title: "配送与退换", path: "/faq" },
    { title: "联系我们", path: "mailto:hello@example.com" },
    { title: "隐私政策", path: "/faq" },
  ],
};

const newsArticles: NewsArticle[] = [
  {
    id: "news-rx-telemedicine",
    slug: "telemedicine-rx-full-workflow",
    title: "处方复诊全流程上线线上问诊，48 小时内完成审方发药",
    summary:
      "芝园联合权威三甲医院医生团队，支持 ADHD、慢病复诊线上问诊，药师复核后优先发货。",
    href: "/news/telemedicine-rx-full-workflow",
    tags: ["医疗服务", "处方药"],
    highlight: true,
    publishedAt: `${thisYear}-05-28T08:30:00.000Z`,
    updatedAt: `${thisYear}-05-28T12:00:00.000Z`,
    seo: {
      title: "处方复诊支持线上问诊 | 芝园资讯",
      description: "48 小时内完成审方发药，适配慢病复诊与 ADHD 客户。",
    },
    bodyHtml: `
      <p>芝园药局与上海嘉宁医院达成战略合作，围绕 ADHD 与慢性病复诊场景搭建线上问诊流程。</p>
      <p>用户可在芝园 App 中提交既往处方与病历，24 小时内由三甲主治医师进行问诊评估，审方完成后由执业药师复核并发货。</p>
      <ul>
        <li>支持复诊药品覆盖注意力缺陷、焦虑、部分心血管疾病。</li>
        <li>全过程支持电子病历与电子处方存档，方便线下复核。</li>
        <li>48 小时内完成审方发药，核心城区可选择当日速配。</li>
      </ul>
      <p>若涉及需进一步线下面诊的情况，医生会提供转诊建议。芝园将持续优化线上问诊体验。</p>
    `,
  },
  {
    id: "news-health-supplement",
    slug: "member-day-supplement-offer",
    title: "会员日限定：精选保健食品第 2 件享 8 折",
    summary:
      "高人气的维生素与肝脏呵护组合参与活动，加入购物车自动应用优惠，库存有限速抢。",
    href: "/news/member-day-supplement-offer",
    tags: ["促销", "会员"],
    publishedAt: `${thisYear}-05-26T10:00:00.000Z`,
    updatedAt: `${thisYear}-05-27T09:20:00.000Z`,
    seo: {
      title: "会员日保健食品 8 折活动 | 芝园资讯",
      description: "热门维生素、肝脏呵护组合参与活动，会员第 2 件享 8 折。",
    },
    bodyHtml: `
      <p>5 月会员日即将开启，芝园准备了丰富的健康补给组合，覆盖免疫调理、肝脏呵护、女性健康等主题。</p>
      <p>活动期间，会员登录后自动享受“第 2 件 8 折”优惠，无需额外输入优惠码，可与积分抵扣叠加。</p>
      <p>热门组合包括：</p>
      <ol>
        <li>全天然维生素 C + 锌含片，日常免疫守护。</li>
        <li>护肝营养包：水飞蓟素胶囊搭配高纯度卵磷脂。</li>
        <li>女性专属：复合维生素 B 群与铁元素补给组合。</li>
      </ol>
      <p>活动库存有限，售完即止。如有特殊用药需求，请提前咨询营养师或执业药师。</p>
    `,
  },
  {
    id: "news-pharmacy-safety",
    slug: "insulin-storage-summer-tips",
    title: "用药提醒：近期高温天气，请按药箱指引存放胰岛素类药物",
    summary:
      "药师建议保持 2-8℃ 冷藏，外出配送全程冷链，签收后请尽快放入冷藏包以免失效。",
    href: "/news/insulin-storage-summer-tips",
    tags: ["用药安全"],
    publishedAt: `${thisYear}-05-24T09:15:00.000Z`,
    seo: {
      title: "高温季胰岛素存放指南 | 芝园资讯",
      description: "药师提醒：签收后尽快冷藏，外出请使用保温包确保药效。",
    },
    bodyHtml: `
      <p>随着气温持续攀升，芝园药师团队提醒糖尿病客户务必关注胰岛素的存储条件。</p>
      <p>冷链配送：芝园采用全程冷链，签收时请检查外包装是否完好，若有异样请立即联系客户服务。</p>
      <p>家庭存放建议：</p>
      <ul>
        <li>未开封胰岛素：保持 2-8℃ 冷藏，可使用家用冰箱冷藏层。</li>
        <li>使用中的胰岛素：可在 25℃ 以下存放 28 天，避免阳光直射。</li>
        <li>外出携带：请使用附赠的冷藏包或冰袋，确保低温环境。</li>
      </ul>
      <p>如遇到胰岛素出现变色、沉淀等异常情况，请立即停止使用并联系在线药师。</p>
    `,
  },
];

export const news = newsArticles;

export const notifications: Notification[] = [
  {
    id: "notice-system-001",
    category: "system",
    title: "积分体系升级完毕",
    description: "新的积分换购商品已经上线，快去看看有哪些惊喜。",
    createdAt: `${thisYear}-05-20T09:00:00.000Z`,
  },
  {
    id: "notice-order-001",
    category: "order",
    title: "订单 #ZY240518 已发货",
    description: "顺丰速运已经揽收，预计 1-2 个工作日送达。",
    createdAt: `${thisYear}-05-18T12:30:00.000Z`,
  },
  {
    id: "notice-system-002",
    category: "system",
    title: "补贴券到账提醒",
    description: "本月会员补贴券已发放 2 张，可在下单时叠加使用。",
    createdAt: `${thisYear}-05-15T08:00:00.000Z`,
    readAt: `${thisYear}-05-15T09:05:00.000Z`,
  },
  {
    id: "notice-order-002",
    category: "order",
    title: "订单 #ZY240510 已完成",
    description: "感谢你的耐心等待，欢迎对本次购物体验进行评价。",
    createdAt: `${thisYear}-05-12T19:45:00.000Z`,
    readAt: `${thisYear}-05-13T08:12:00.000Z`,
  },
];

export const checkoutUrl = CHECKOUT_FALLBACK;
export const defaultCurrency = CURRENCY;

export function findVariantById(variantId: string) {
  for (const product of products) {
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

export function findProductByHandle(handle: string) {
  return products.find((product) => product.handle === handle);
}

export function findCollectionByHandle(handle: string) {
  return collections.find((collection) => collection.handle === handle);
}

export function listVisibleCollections() {
  return collections.filter((collection) => !collection.isHidden);
}
