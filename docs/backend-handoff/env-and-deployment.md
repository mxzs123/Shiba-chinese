# 环境变量与部署需求

## 必填变量清单

| 变量名                        | 默认值/示例                    | 用途                           | 备注                            |
| ----------------------------- | ------------------------------ | ------------------------------ | ------------------------------- |
| `COMMERCE_API_URL`            | _未设置时使用 mock_            | 指向后端商品/内容聚合服务      | 切换至真实服务时必填            |
| `COMMERCE_CHECKOUT_URL`       | `https://example.com/checkout` | 结算跳转地址                   | `lib/api/index.ts` 作为回退链接 |
| `REVALIDATION_SECRET`         | 手动生成                       | `/api/revalidate` Webhook 验证 | 与后端共享密钥，用于增量刷新    |
| `NEXT_PUBLIC_JPY_TO_CNY_RATE` | `0.052`                        | 汇率展示用公开变量             | 前端直接读取，注意同步文档      |

## 推荐补充

- `NEXT_PUBLIC_ASSET_BASE_URL`（如有 CDN）
- `NEXT_PUBLIC_ANALYTICS_ID`（埋点/统计）
- 图片域名配置：在 `next.config.ts` 的 `images.remotePatterns` 中维护。

## 本地 vs 生产差异

- 本地允许缺省 `COMMERCE_API_URL` 并自动使用 mock 数据。
- 生产需填写全部变量，并确保 `COMMERCE_CHECKOUT_URL` 指向真实结算页。
- 生产环境建议设置 `NODE_ENV=production` 以启用安全 Cookie (`secure: true`)。

## 基础设施需求

- **CDN/静态托管**：提供静态资源与 SSR 运行环境（如 Vercel、自建 Node 服务器）。
- **图片域名**：后端若返回远程图片，需要在部署前更新 `next.config.ts` 的 `images.remotePatterns`。
- **Webhook 接入**：后端更新商品/集合后调用 `/api/revalidate`，Header `Authorization: Bearer <REVALIDATION_SECRET>`。
- **会话与 Cookie**：
  - 前端依赖 `auth_session`、`cartId`、`device`（Middleware）三类 Cookie。
  - 若由网关/后端写入，需要同域或配置 `domain` 以便共享。

## 部署流程提示

1. 安装依赖并构建：`npm ci && npm run build`。
2. 导出 `.next` 构建产物和 `public/` 目录，部署到 Node 运行环境（`npm run start`）。
3. 确认环境变量在运行时可用，特别是 `REVALIDATION_SECRET`。
4. 若使用容器化，推荐在镜像内执行 `npm ci --omit=dev`（Next.js 15 仍需部分 devDependencies，用 `--include=dev` 视需求调整）。

## 运行监控

- 关键指标：构建日志、Middleware 命中、`x-device` header、未经缓存的响应比例。
- 可选：配置 CDN 缓存策略时，确保 `Vary: x-device` 被尊重，避免外壳错配。
