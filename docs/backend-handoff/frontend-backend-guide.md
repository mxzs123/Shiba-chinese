# 前后端协作指南

## 数据访问层概览

- 所有数据统一经由 `lib/api/index.ts` 导出，函数命名遵循 `get*` / `update*` / `redeem*` 等语义。
- 默认实现通过 `lib/api/mock-data.ts` 作为聚合入口读取 mock 数据（实际存放在 `mock-account.ts`、`mock-checkout.ts`、`mock-products.ts`、`mock-orders.ts`、`mock-surveys.ts` 等文件），并在内存中维护购物车（`CartStore`）。真实接入时可逐个函数替换为远端 HTTP/GraphQL 请求。
- `lib/api/types.ts` 定义了全部领域模型：`Product`、`Collection`、`Cart`、`Order`、`User`、`SurveyAssignment` 等；扩展/修改字段务必同步此文件与对应 mock 模块。

## 函数分组与契约

- **通用内容**：`getPage(handle)`、`getPages()`、`getMenu(handle)`、`getCollections()`、`getLatestNews`、`getNews()`、`getNewsArticle(slug)`。
- **商品与搜索**：`getProduct(handle)`、`getProductById(id)`、`getProductRecommendations(handle)`、`getProducts({ collectionHandle, query, sort, page })`、`getCollectionProducts()`。
- **购物车与优惠券**：`createCart`、`getCart`、`addToCart({ merchandiseId, quantity })`、`updateCart(lineId, quantity)`、`removeFromCart(lineIds)`、`applyCouponToCart(code)`、`removeCouponFromCart(code)`、`getAvailableCoupons()`。
- **账户与地址**：`getCurrentUser`、`getUserById`、`updateUserProfile(input)`、`getCustomerAddresses(userId)`、`addCustomerAddress`、`upsertCustomerAddress`、`setDefaultCustomerAddress`、`deleteCustomerAddress`。
- **订单与积分**：`getUserOrders(userId)`、`getOrderById(orderId)`、`getLoyaltyAccount(userId)`、`getPointRules()`、`getCustomerCoupons(userId)`、`redeemCouponForUser(code)`。
- **实名认证与问卷**：`getIdentityVerification(userId)`、`submitIdentityVerification(input)`、`getSurveyTemplates()`、`getSurveyAssignmentsByUser(userId)`、`saveSurveyAssignmentDraft`、`submitSurveyAssignment`。
- **通知与消息流**：`getNotifications({ categories })` 返回按类别过滤的通知列表。

## 真实接口对接要求

- **标识字段**：所有实体必须保持唯一 `id`（string），页面/集合/新闻需额外提供 `handle` 或 `slug` 以兼容现有路由。
- **金额类型**：遵循 `Money` 结构 `{ amount: string; currencyCode: string }`，后端应返回字符串金额，保留小数精度。
- **分页与筛选**：搜索接口建议支持 `query`、`collectionHandle`、`sort`、`page`，返回 `{ items: Product[]; pageInfo }` 或直接对齐现有 mock 返回结构。
- **购物车交互**：
  - `Cart` 结构包含 `lines: CartItem[]`、`cost`（含 `subtotalAmount`、`totalAmount`）、`currencyCode`、`appliedCoupons`。
  - `CartItem` 需要 `merchandiseId`、`quantity`、`cost`、`merchandise: ProductVariant`。
  - 返回时后端需负责价格重算与库存校验；优惠券接口遵循 success/data 结构。
- **账户资料**：`User` 需包含 profile（`name`、`email`、`phone`）、`defaultAddressId`、`memberships`、`pointAccount` 等字段。
- **问卷与调查**：`SurveyTemplate`、`SurveyAssignment` 定义题型（单选、多选、文本、上传），保持现有字段以支撑前端组件渲染。

## revalidate 机制

- `app/api/revalidate/route.ts` 接收后端 Webhook（需携带 `REVALIDATION_SECRET`）。
- 成功后触发 `revalidateTag(TAGS.CATALOG)` 等缓存失效；新增接口应返回相应标签以便增量刷新。

## 对接流程建议

1. 与后端确认实体字段映射 → 更新 `types.ts` → 同步 mock 数据结构。
2. 分域替换 `lib/api/index.ts` 中的实现，保留相同函数签名。
3. 按域编写联调备注（超时、错误码、重试策略），记录在 PR 或 `docs` 中。
4. 合作阶段保持 mock fallback，确保后端不可用时前端仍可演示。

## 附注

- 若需认证或鉴权，请通过 `auth_session` cookie 或 Header 传递，会在 `getUserFromSessionCookie` 中解析。
- 错误处理建议统一返回 `{ success: false, error: { code, message } }`，前端再按需提示。
