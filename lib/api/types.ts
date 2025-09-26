export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type SEO = {
  title: string;
  description: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  compareAtPrice?: Money | null;
};

export type Product = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
    maxCompareAtPrice?: Money | null;
    minCompareAtPrice?: Money | null;
  };
  variants: ProductVariant[];
  featuredImage: Image;
  images: Image[];
  seo?: SEO;
  tags: string[];
  updatedAt: string;
};

export type Collection = {
  handle: string;
  title: string;
  description: string;
  seo?: SEO;
  updatedAt: string;
  path: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Menu = {
  title: string;
  path: string;
};

export type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  href: string;
  tags?: string[];
  highlight?: boolean;
  publishedAt: string;
  bodyHtml: string;
  updatedAt?: string;
  seo?: SEO;
};

export type Address = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneCountryCode?: string;
  company?: string;
  country: string;
  countryCode: string;
  province?: string;
  city: string;
  district?: string;
  postalCode?: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
  formatted?: string[];
};

export type AddressInput = {
  id?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  phoneCountryCode?: string;
  company?: string;
  country: string;
  countryCode: string;
  province?: string;
  city: string;
  district?: string;
  postalCode?: string;
  address1: string;
  address2?: string;
  isDefault?: boolean;
};

export type ShippingMethod = {
  id: string;
  name: string;
  carrier: string;
  description?: string;
  price: Money;
  estimatedDelivery?: string;
};

export type PaymentMethodType = "qr_code" | "external" | "cash_on_delivery";

export type PaymentMethod = {
  id: string;
  name: string;
  description?: string;
  type: PaymentMethodType;
  disabled?: boolean;
  instructions?: string;
};

export type PointTransactionType = "earn" | "redeem" | "adjust";

export type PointTransaction = {
  id: string;
  type: PointTransactionType;
  amount: number;
  balanceAfter: number;
  occurredAt: string;
  description?: string;
  referenceOrderId?: string;
};

export type Point = {
  userId: string;
  balance: number;
  updatedAt: string;
};

export type PointAccount = Point & {
  transactions: PointTransaction[];
};

export type PointRuleKind = "earn" | "redeem" | "notice";

export type PointRule = {
  id: string;
  title: string;
  description: string;
  kind?: PointRuleKind;
};

export type MembershipTierProgress = {
  title: string;
  requirement: string;
};

export type Membership = {
  id: string;
  tier: string;
  level: number;
  since: string;
  expiresAt?: string;
  benefits: string[];
  next?: MembershipTierProgress;
};

export type IdentityDocument = {
  frontImageUrl: string;
  backImageUrl: string;
  uploadedAt: string;
};

export type IdentityVerificationStatus = "unverified" | "verified";

export type IdentityVerification = {
  status: IdentityVerificationStatus;
  document?: IdentityDocument;
};

export type IdentityDocumentInput = {
  frontImage: string;
  backImage: string;
};

export type SurveyQuestionType =
  | "text"
  | "single_choice"
  | "multiple_choice"
  | "date"
  | "upload";

export type SurveyOption = {
  value: string;
  label: string;
  description?: string;
};

type SurveyQuestionBase<Type extends SurveyQuestionType> = {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  type: Type;
};

export type SurveyTextQuestion = SurveyQuestionBase<"text"> & {
  placeholder?: string;
  maxLength?: number;
};

export type SurveySingleChoiceQuestion = SurveyQuestionBase<"single_choice"> & {
  options: SurveyOption[];
};

export type SurveyMultipleChoiceQuestion =
  SurveyQuestionBase<"multiple_choice"> & {
    options: SurveyOption[];
    minChoices?: number;
    maxChoices?: number;
  };

export type SurveyDateQuestion = SurveyQuestionBase<"date"> & {
  min?: string;
  max?: string;
};

export type SurveyUploadQuestion = SurveyQuestionBase<"upload"> & {
  accept?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
};

export type SurveyQuestion =
  | SurveyTextQuestion
  | SurveySingleChoiceQuestion
  | SurveyMultipleChoiceQuestion
  | SurveyDateQuestion
  | SurveyUploadQuestion;

export type SurveyAnswerValue = string | string[] | SurveyUploadedFile[];

export type SurveyAnswer = {
  questionId: string;
  value: SurveyAnswerValue;
};

export type SurveyUploadedFile = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export type SurveyTemplate = {
  id: string;
  title: string;
  description?: string;
  category: string;
  productTags?: string[];
  productIds?: string[];
  questions: SurveyQuestion[];
  updatedAt: string;
};

export type SurveyAssignmentStatus = "pending" | "submitted";

export type SurveyAssignment = {
  id: string;
  userId: string;
  orderId: string;
  orderNumber: string;
  category: string;
  templateId: string;
  productIds: string[];
  productTitles: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  status: SurveyAssignmentStatus;
  answers: SurveyAnswer[];
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nickname?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  defaultAddress?: Address;
  addresses: Address[];
  loyalty?: PointAccount;
  membership?: Membership;
  coupons?: CustomerCoupon[];
  identityVerification?: IdentityVerification;
};

export type UserProfileInput = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phone?: string;
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type CartCost = {
  subtotalAmount: Money;
  totalAmount: Money;
  totalTaxAmount: Money;
  dutiesAmount?: Money;
  discountAmount?: Money;
};

export type CouponType = "percentage" | "fixed_amount" | "free_shipping";

export type Coupon = {
  id: string;
  code: string;
  title: string;
  description?: string;
  type: CouponType;
  value: number;
  currencyCode?: string;
  startsAt?: string;
  expiresAt?: string;
  minimumSubtotal?: Money;
  appliesToProductIds?: string[];
  appliesToCollectionHandles?: string[];
};

export type AppliedCoupon = {
  coupon: Coupon;
  amount: Money;
};

export type CustomerCouponState = "active" | "used" | "expired" | "scheduled";

export type CustomerCoupon = {
  id: string;
  coupon: Coupon;
  state: CustomerCouponState;
  assignedAt: string;
  usedAt?: string;
  orderId?: string;
  note?: string;
  source?: string;
  expiresAt?: string;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  cost: CartCost;
  lines: CartItem[];
  totalQuantity: number;
  note?: string;
  updatedAt?: string;
  buyer?: User;
  appliedCoupons?: AppliedCoupon[];
};

export type OrderStatus =
  | "draft"
  | "pending"
  | "paid"
  | "processing"
  | "fulfilled"
  | "cancelled";

export type FinancialStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "partially_refunded"
  | "refunded"
  | "voided";

export type FulfillmentStatus =
  | "unfulfilled"
  | "partial"
  | "fulfilled"
  | "restocked";

export type OrderLineItem = {
  id: string;
  productId: string;
  productTitle: string;
  variantId?: string;
  variantTitle?: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
  image?: Image;
};

export type OrderTracking = {
  carrier?: string;
  trackingNumber: string;
  url?: string;
};

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  financialStatus: FinancialStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  fulfilledAt?: string;
  subtotalPrice: Money;
  totalPrice: Money;
  totalTax: Money;
  totalShipping: Money;
  currencyCode: string;
  lineItems: OrderLineItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod?: ShippingMethod;
  customerId: string;
  appliedCoupons?: AppliedCoupon[];
  loyaltyDelta?: number;
  tracking?: OrderTracking;
};

export type NotificationCategory = "system" | "order";

export type Notification = {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  createdAt: string;
  readAt?: string;
};
