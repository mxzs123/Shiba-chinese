# OpenAPI 3.0 草案规划

> 目标：基于当前前端 mock 使用情况，整理后端需提供的 REST 接口列表，为后续编写 OpenAPI 3.0 规范做准备。

## 统一约定

- 响应结构：`{ "success": boolean, "data"?: T, "error"?: { code: string, message: string } }`。
- 认证：
  - 服务端会话通过 `auth_session` Cookie；若使用 Token，可在 Header `Authorization: Bearer <token>`。
  - 所有受保护接口返回 `401`（未登录）、`403`（权限不足）。
- 错误码建议：`VALIDATION_ERROR`、`NOT_FOUND`、`RATE_LIMITED`、`INTERNAL_ERROR`。
- 限流：对写操作（购物车、问卷、身份认证）启用基础限流（例如 60 req/min/IP）并在 Header 暴露 `X-RateLimit-Remaining`。

## 产品与搜索

| Endpoint                             | Method | 描述                         | 请求示例                                               | 响应数据                   |
| ------------------------------------ | ------ | ---------------------------- | ------------------------------------------------------ | -------------------------- |
| `/products`                          | GET    | 列表、支持分页/排序/集合过滤 | `?collection=summer&query=mask&page=1&sort=price-desc` | `Product[]` + `pageInfo`   |
| `/products/{handle}`                 | GET    | 商品详情                     | -                                                      | `Product`                  |
| `/products/{handle}/recommendations` | GET    | 推荐商品                     | `?limit=4`                                             | `Product[]`                |
| `/collections`                       | GET    | 集合列表                     | -                                                      | `Collection[]`             |
| `/collections/{handle}`              | GET    | 集合详情                     | -                                                      | `Collection` + `Product[]` |
| `/search/suggestions`                | GET    | 关键词联想（可选）           | `?q=mask`                                              | `string[]`                 |

## 内容与新闻

| Endpoint            | Method | 描述                         |
| ------------------- | ------ | ---------------------------- |
| `/menus/{handle}`   | GET    | 导航/快捷入口菜单            |
| `/pages/{handle}`   | GET    | CMS 单页内容（关于、FAQ 等） |
| `/news`             | GET    | 新闻列表（支持分页/分类）    |
| `/news/{slug}`      | GET    | 单篇新闻                     |
| `/news/highlighted` | GET    | 首页高亮新闻                 |

## 购物车与结算

| Endpoint                  | Method | 描述                                   |
| ------------------------- | ------ | -------------------------------------- | ----------------------------------- |
| `/cart`                   | GET    | 获取当前购物车（根据 `cartId` Cookie） |
| `/cart`                   | POST   | 创建/替换购物车，返回 `cartId`         |
| `/cart/lines`             | POST   | 添加商品                               | body: `{ merchandiseId, quantity }` |
| `/cart/lines/{lineId}`    | PATCH  | 更新数量                               | body: `{ quantity }`                |
| `/cart/lines/bulk-remove` | POST   | 批量删除                               | body: `{ lineIds: string[] }`       |
| `/cart/coupons`           | POST   | 应用优惠券                             | body: `{ code }`                    |
| `/cart/coupons/{code}`    | DELETE | 移除优惠券                             |
| `/cart/checkout`          | POST   | 生成结算链接或预约信息                 | 返回 `checkoutUrl`/支付引导         |

## 优惠券与积分

| Endpoint                     | Method | 描述                 |
| ---------------------------- | ------ | -------------------- | ---------------- |
| `/coupons/available`         | GET    | 通用优惠券列表       |
| `/users/{id}/coupons`        | GET    | 用户优惠券（含状态） |
| `/users/{id}/coupons/redeem` | POST   | 兑换优惠券           | body: `{ code }` |
| `/users/{id}/points`         | GET    | 积分账户与流水       |
| `/point-rules`               | GET    | 积分规则展示         |

## 账户与地址

| Endpoint                                    | Method       | 描述                    |
| ------------------------------------------- | ------------ | ----------------------- | ------------------------ |
| `/me`                                       | GET          | 当前登录用户信息        |
| `/users/{id}`                               | PATCH        | 更新资料                | body: `UserProfileInput` |
| `/users/{id}/addresses`                     | GET/POST     | 地址列表 / 新增         |
| `/users/{id}/addresses/{addressId}`         | PATCH/DELETE | 更新 / 删除             |
| `/users/{id}/addresses/{addressId}/default` | POST         | 设为默认地址            |
| `/identity/verification`                    | GET/POST     | 实名信息读取 / 提交审核 |

## 问卷与合规

| Endpoint                          | Method | 描述                   |
| --------------------------------- | ------ | ---------------------- |
| `/survey/templates`               | GET    | 问卷模板（题目、选项） |
| `/survey/assignments`             | GET    | 用户问卷任务列表       |
| `/survey/assignments/{id}`        | GET    | 单个问卷任务           |
| `/survey/assignments/{id}/draft`  | POST   | 保存草稿               |
| `/survey/assignments/{id}/submit` | POST   | 提交问卷               |

## 通知与即时信息

| Endpoint         | Method | 描述                                   |
| ---------------- | ------ | -------------------------------------- |
| `/notifications` | GET    | 按类别获取通知，支持 `?category=order` |

## 安全策略

- 传输：HTTPS 必选，禁止明文。
- 身份：登陆接口由后端掌控，返回 `auth_session` 等 Cookie，需设置 `HttpOnly`、`SameSite=Lax`。
- 速率 & 重试：提供 `Retry-After`，前端对 429 做指数退避。
- 日志：接口需具备 Trace ID（如 `X-Request-Id`），前端传递以便排查。

## 下一步

1. 后端确认字段并补充缺失的响应属性。
2. 基于此草案生成 OpenAPI 3.0 YAML/JSON，提交到共享仓库。
3. 前端根据 OpenAPI 生成类型或 SDK，替换 mock 实现。
