# 上架展示改造 TODO（今日内完成）

> 状态说明：本文件记录的是上架展示改造阶段的一次集中改造任务，大部分内容已落地到 `lib/api/goods.ts`、购物车 mock 等模块，当前作为历史背景与接口对齐说明保留，后续迭代不再在此维护新 TODO。

## 背景

- 需在今日内让桌面端商品一览/购物车等页面“看起来已对接后端”，以便向 B 端客户展示上架商品。
- 实际后端尚未完成；我们暂以 mock 数据兜底，但前端的类型、API 契约、页面结构必须与后端预期保持一致，后续才可无痛切换到真实接口。
- 现有实现还停留在 `lib/api` 本地 store + 硬编码分类，无法复用后端的层级分类与购物车接口。

## 参考接口（来自最新后端文档）

### 商品 Good 模块

| 接口                                                           | 说明                                                                        | 备注                                                                                |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `POST /api/Good/GetAllCategories`                              | 获取所有商品分类栏目数据；后端存在“大类 + 子类”结构，小类需在大类展开时展示 | 无需参数；响应格式为 `{ status, msg, data, code, ... }`                             |
| `POST /api/Good/GetGoodsPageList`                              | 基于条件的分页商品列表                                                      | 请求体示例：`{ "page": number, "limit": number, "order": string, "where": string }` |
| `POST /api/Good/GetDetial` / `POST /api/Good/GetDetialByToken` | 商品详情（含 SKU、图文、库存）；`ByToken` 版本需要登录                      | 请求体：`{ "id": number, "data": string }`；响应同上                                |
| `POST /api/Good/GetGoodsParams`                                | 单个商品参数                                                                | —                                                                                   |
| `POST /api/Good/GetProductInfo`                                | 获取单个货品（SKU）信息，含 `type`、`groupId` 等字段                        | 请求体：`{ "id": number, "type": string, "groupId": number }`                       |
| `POST /api/Good/GetGoodsComment`                               | 商品评价分页                                                                | —                                                                                   |
| `POST /api/Good/GetGoodsRecommendList`                         | 随机推荐商品，用于详情页推荐区                                              | 请求体：`{ "id": number, "data": string }`                                          |

### 购物车 Cart 模块

| 接口                                    | 说明                                                                                                     | 备注                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `POST /api/Cart/AddCart`                | 添加单个货品到购物车（Auth）；需要 `nums`, `productId`, `type`, `cartType`, `objectId`                   | 响应 `{ status, msg, data }` |
| `POST /api/Cart/GetList`                | 获取购物车列表（Auth）；请求体 `{ userId, ids, type, areaId, point, couponCode, receiptType, objectId }` | 用于全局 `getCart()`         |
| `POST /api/Cart/SetCartNum`             | 设置购物车商品数量（Auth）；请求体 `{ id, nums }`                                                        | 购物车行 ID 由后端返回       |
| `POST /api/Cart/DoDelete`               | 删除购物车行（Auth）；请求体 `{ id, data }`                                                              |                              |
| `POST /api/Cart/GetCartAvailableCoupon` | 根据提交数据判断可用优惠券（Auth）                                                                       | 接口文档已给出               |

> **注意：** 文档未提供 `data` 字段的具体 schema。以下任务会按现有 UI 需求推测字段，并在 mock 中保持一致，等真实 schema 下发后再次校正。

## 待办事项（务必今日内完成）

1. **统一类型定义与 mock 契约**
   - 在 `lib/api/types.ts` 为分类、商品、SKU、购物车行补齐后端字段（如 `categoryId/parentId/children[]`、`productId/objectId/type/cartType/groupId`、购物车行 `id`）。
   - `lib/api/mock-data.ts` 中的样本数据同步扩展这些字段；若缺真实值，用明确占位符（`TODO_BACKEND_*`）并注释。
   - `lib/api/index.ts` 的导出函数签名与返回结构更新为“后端版”结构（即 `{ status, msg, data }` or `data` 直接解包），内部暂仍读 mock。

2. **重写商品分类/搜索结构**
   - 新建 `lib/api/goods.ts`（或扩展现有 loader）来模拟 `GetAllCategories`、`GetGoodsPageList`。
   - `app/_shared/search/config.ts` 改为读取 mock 分类树，支持“大类点击展开小类”。
   - `DesktopSearchSidebar` & `SearchPageShell` 适配新的层级结构、URL 规则（大类 slug -> 展开小类；小类 slug 映射 `where` 条件）。

3. **商品列表 & 详情契约**
   - `loadSearchResult` 调整为调用新的 mock `GetGoodsPageList`：支持 `page/limit/order/where`、返回 `items`, `total`, `pageInfo`.
   - 详情页 (`app/_shared/pages/product/*`) 改用 `GetDetial`/`GetProductInfo` mock 结构，确保 SKU、图片、参数、推荐列表等字段与后端接口名一致。

4. **购物车动作对齐接口**
   - `components/cart/actions.ts` 的 `addItem/removeItem/updateItemQuantity` 改为构造后端需要的 payload (`productId`, `objectId`, `type`, `cartType`, `nums`)；返回值解析 `{ status, msg, data }`。
   - `useCart` 乐观状态从“variant id”切到“后端 line id”，但仍保存 `merchandise.id` 以兼容 UI。
   - `lib/api/index.ts` 中 `addToCart/updateCart/removeFromCart/getCart` 暂时调用 mock 版接口实现，确保签名与后端一致。

5. **优惠券/结算流程**
   - 结算页 (`app/d/checkout/page.tsx`, `app/_shared/checkout/actions.ts`) 改为依赖新 `GetCartAvailableCoupon` mock。
   - `components/cart/cart-selection.ts` 中的优惠券折扣计算保留，但需标注：最终以后端返回为准；添加 TODO 说明接入真实接口后清理。

6. **QA & 交接说明**
   - 在 `docs/` 新增本文件（当前已创建），并在 PR 描述/提交信息中引用，确保后续接手者理解 mock vs. backend 契约。
   - 每一步调整后至少自测 `/search`、`/cart`、`/checkout` 三个主要流程，确认 UI 不回退。

## 依赖 & 风险

- **缺少具体响应 schema**：本文档中字段推断需在后端提供正式 schema 后复核；请预留 TODO 标注。
- **Auth 方案待确认**：`Cart` 多个接口需要 Auth，mock 阶段先跳过，接入时需确保 `auth_session` cookie 透传。
- **时间限制**：目标是“今日完成”——请优先实现结构性改造，细节优化（文案、样式）可后置。

如需后续接口/字段更新，请在此文档追加说明，或在 `docs/fenxiao/` 目录内开专章追踪。
