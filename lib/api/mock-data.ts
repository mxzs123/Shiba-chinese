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
  ShippingMethod,
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

const matchaProduct = products[0]!;
const herbalProduct = products[1]!;
const bottleProduct = products[3]!;
const matchaVariant = matchaProduct.variants[1]!;
const herbalVariant = herbalProduct.variants[1]!;
const bottleVariant = bottleProduct.variants[1]!;

export const orders: Order[] = [
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
];

export const collections: CollectionRecord[] = [
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
    body: "# 常见问题\n\n配送时效、退换货政策与客服联系方式。",
    bodySummary: "售后与咨询说明。",
    seo: {
      title: "常见问题",
      description: "了解配送、售后与客服信息",
    },
    createdAt: `${thisYear}-01-15T00:00:00.000Z`,
    updatedAt: `${thisYear}-02-20T08:00:00.000Z`,
  },
];

export const menus: Record<string, Menu[]> = {
  "next-js-frontend-header-menu": [
    { title: "全部商品", path: "/search" },
    { title: "冲泡饮品", path: "/search/beverage" },
    { title: "日常健康", path: "/search/wellness" },
    { title: "生活器具", path: "/search/accessories" },
    { title: "品牌故事", path: "/page/about" },
  ],
  "next-js-frontend-footer-menu": [
    { title: "配送与退换", path: "/page/faq" },
    { title: "联系我们", path: "mailto:hello@example.com" },
    { title: "隐私政策", path: "/page/faq" },
  ],
};

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
