# README 大纲建议

## 项目简介

- 目标：交付一套基于 Next.js App Router 的电商前端展示与交互层，支持桌面/移动外壳分流。
- 当前状态：首个阶段（桌面外壳 `/d` 与核心业务流程）已完成，默认接入 `lib/api/mock-data.ts` 作为统一 mock 入口（内部已按领域拆分到 `mock-account.ts`、`mock-checkout.ts`、`mock-products.ts`、`mock-orders.ts`、`mock-surveys.ts`）。

## 技术栈速览

- Next.js 15（App Router、Server Components、Server Actions、Middleware）。
- React 19、TypeScript 5、Tailwind CSS v4、Framer Motion、Zustand。
- UI 与图标：`shadcn/ui` 体系、`lucide-react`、自研组件位于 `components/`。

## 目录结构概述

- `app/`：页面路由，按桌面 `/d`、共享 `_shared`、通用页面组织。
- `app/_shared/`：领域组件、Server Actions、复用页面模块。
- `components/`：跨页面复用组件，按业务域划分。
- `lib/api/`：数据访问层（mock 与替换点），`mock-data.ts`（聚合）、`mock-*.ts` 与 `types.ts` 保持契约。
- `docs/backend-handoff/`：本次准备的交接说明集。

## 设备分流策略

- `middleware.ts` 负责 query → cookie → UA 判定并重写至 `/d` 或 `/m`。
- 请求与响应写入 `x-device` 头，附带 `Vary: x-device`，确保缓存隔离。
- Query 覆盖时写回 `device` cookie，地址栏保持用户 URL。

## 常用脚手架命令

```bash
pnpm dev            # 启动开发（Turbopack）
pnpm build          # 生产构建
pnpm start          # 本地预览生产包
pnpm lint           # ESLint 校验
pnpm prettier       # 自动格式化
pnpm prettier:check # 仅校验格式（CI 推荐）
```

## 环境变量与示例

- `.env.example` 已列出：`COMMERCE_API_URL`、`COMMERCE_CHECKOUT_URL`、`REVALIDATION_SECRET`、`NEXT_PUBLIC_JPY_TO_CNY_RATE`。
- README 可补充默认值说明、与真实服务对接的配置样例。
- 约定：新增变量需同步 `.env.example`、README、相关文档。

## Mock 数据与真实接口切换

- 默认走 `lib/api/mock-data.ts` 与内存购物车存储。
- `lib/api/index.ts` 中各函数可替换为真实 HTTP 调用，保持 `types.ts` 定义不变。
- 切换流程：实现实际 fetch → 对应类型序列化 → 删除/保留 mock 作为开发 fallback。

## 常见问题 / 排错指引

- Middleware 未生效：检查 `device` cookie、`?device=` query、`x-device` 请求头。
- Mock 数据缺字段：同时更新 `mock-data.ts` 与 `types.ts`，并补充 README 说明。
- 构建失败：先运行 `pnpm lint`、`pnpm prettier:check`，确认 Node 版本 ≥ 18。

## 附录

- 指向其他交接文档：架构复用说明、前后端协作、OpenAPI 草案等。
