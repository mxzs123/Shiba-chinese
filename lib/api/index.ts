// ============================================================================
// lib/api/index.ts - 聚合导出（保持兼容）
// ============================================================================

// Utils
export {
  CART_ID_COOKIE,
  shouldUseSecureCookies,
  getCartCookieOptions,
} from "./utils";

// Cart
export {
  createCart,
  addToCart,
  removeFromCart,
  updateCart,
  getCart,
  applyCouponToCart,
  removeCouponFromCart,
} from "./cart";

// Coupon
export {
  getAvailableCoupons,
  getCartAvailableCoupons,
  getCouponByCode,
  getCustomerCoupons,
  redeemCouponForUser,
} from "./coupon";

// Address
export {
  getCustomerAddresses,
  addCustomerAddress,
  upsertCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
} from "./address";

// User
export {
  getCurrentUser,
  getUserById,
  updateUserProfile,
  getIdentityVerification,
  submitIdentityVerification,
} from "./user";

// Order
export { getUserOrders, getOrderById } from "./order";

// Loyalty
export { getLoyaltyAccount, getPointRules } from "./loyalty";

// Survey
export {
  getSurveyTemplates,
  getSurveyTemplateById,
  getSurveyAssignmentsByUser,
  getSurveyAssignmentById,
  saveSurveyAssignmentDraft,
  submitSurveyAssignment,
} from "./survey";

// Product
export {
  getProduct,
  getProductById,
  getVariantById,
  getProductRecommendations,
  getProducts,
} from "./product";

// Collection
export { getCollection, getCollectionProducts, getCollections } from "./collection";

// News
export {
  getLatestNews,
  getHighlightedNewsArticle,
  getNews,
  getNewsArticle,
} from "./news";

// Content
export { getMenu, getPage, getPages } from "./content";

// Shipping & Payment
export { getNotifications, getShippingMethods, getPaymentMethods } from "./shipping";

// Revalidate
export { revalidate } from "./revalidate";

// Goods (re-export from ./goods)
export {
  mockGetAllGoodsCategories as getAllGoodsCategories,
  mockGetGoodsDetail as getGoodsDetail,
  mockGetGoodsPageList as getGoodsPageList,
  mockGetGoodsRecommendList as getGoodsRecommendList,
  mockGetProductInfo as getBackendProductInfo,
  findGoodsProductByHandle,
  findGoodsProductByBackendId,
  findGoodsProductByInternalId,
  findGoodsVariantByObjectId,
} from "./goods";
