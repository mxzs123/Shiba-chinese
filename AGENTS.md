# AGENT 交接说明

> 本文主要提供架构背景与协作规范。

## 项目速览

- 技术栈：Next.js 15（App Router）+ TypeScript + Tailwind v4 + Zustand + shadcn/ui。
- 架构：单 URL，middleware 按设备分流至 `app/d`（桌面）与 `app/m`（移动），核心业务封装在 `app/_shared` 供双外壳复用。
- 数据：统一走 `lib/api`，默认使用 mock 数据；扩展接口时同步维护 `types.ts`、`mock-data.ts` 与相关 finder。

## 当前交付状态

- 桌面端 (`app/d`)：V1 已上线（参考实现）。
- 移动端 (`app/m`)：V1 已上线（首页、分类、搜索/内容、购物车、账户与订单、结算与支付、处方审核、商品详情等主要流程）。
- 共享层：`app/_shared` 已涵盖账户、结算、优惠券、商品页等逻辑；新增页面需优先在此扩展。
- 分销平台：新增独立模块，代码位于 `apps/distributor`；配套文档与任务在 `docs/fenxiao/`。
- 最新文档：`todo.md` 已重新梳理，包含细颗粒任务拆解；主流程链接统一去掉 `'/m'` 前缀。

## 核心规范（务必遵守）

1. **业务只写在 `_shared`**：`app/d`、`app/m` 页面仅做壳层与布局，传参调用共享组件/页面模块。
2. **链接规范**：`next/link` 与渐进增强跳转一律使用用户感知路径（无 `/d`、`/m` 前缀）。
3. **数据与 Server Action**：
   - 所有接口经 `lib/api`；若增字段，记得更新类型、mock 数据与 finder。
   - Server Action 必须返回 `{ success, data, error }` 结构，放在 `_shared/*/actions.ts`。
4. **样式 & 交互**：
   - Tailwind 原子按“布局 → 间距 → 视觉”顺序；复杂交互前可加简短注释。
   - 状态管理统一使用 Zustand，必要时 selector 降低重渲染。
   - 组件命名：组件 PascalCase、hook camelCase、常量 SCREAMING_SNAKE_CASE。
5. **质量门槛**：提交前跑 `pnpm lint` 与 `pnpm prettier:check`；构建需保持绿灯。
6. **路径约束**：移动端页面不要复制桌面逻辑，务必复用 `_shared`；新增账户 Tab 先扩展 `_shared/account/nav-items.ts`。
7. **设备切换**：middleware 会根据 UA/`device` cookie 自动分流；本地想在桌面浏览器调试移动壳，请先访问 `/?device=m` 或任意 `/m/...` 写入 `device=m`，需要回桌面则访问 `/?device=d`。

### 测试命令

- `pnpm lint`：ESLint 全量检查。
- `pnpm build`：确保生产构建通过。
- `pnpm dev`：Turbopack 开发模式（调试前先跑一次以装载缓存）。
- 如需补测试脚本，请在合并前本地跑通相应命令（`pnpm test` 等），并在 PR 描述中标注。

## 常用命令

```bash
pnpm dev              # 本地开发（Turbopack）
pnpm build            # 生产构建
pnpm start            # 预览生产构建
pnpm lint             # ESLint
pnpm prettier         # 自动格式化
pnpm prettier:check   # CI 用格式检查
```

## 新增模块：分销平台

- 目录：`apps/distributor`
- 文档：`docs/fenxiao/`（含 AGENTS.md、todo.md 与技术方案）
- 常用命令：`pnpm dev:distributor`（开发）、`pnpm build:distributor`（构建）、`pnpm lint:distributor`（Lint）
- UI 依赖：分销端复用 `components/ui/*` 的 shadcn 组件，并依赖 `@radix-ui/react-progress` 等 Radix 套件；新增组件时保持依赖在根/子 workspace 的 `package.json` 内一致声明。
- 规范：建议沿用本文核心规范（接口经 `lib/api`、类型与 mock 同步、Server Action 返回 `{ success, data, error }`），保持跨模块一致性。

## 后续迭代 & 风险提示

- 富文本内容与搜索筛选/抽屉交互需在各主流设备充分回归，关注安全区与字号。
- `ProductCard`、`SkuSelector` 等共享组件建议继续加强 `compact`/移动布局支持。
- 分类页商品列表真实数据接入依赖后端，未接入前请在 QA 备注清楚。
- 关键 QA：
  - 搜索 → 商品 → 加购 → 购物车 → 结算 → 支付成功/失败 → 订单全链路。
  - 处方药审核（问卷 + 实名）流程。
  - 各主要设备安全区和字号检查（iPhone SE、15 Pro Max、Pixel 7、iPad Mini）。
- 国际化与深色模式暂不需要；保持中文站、浅色主题即可。

## 文档 & 参考

- `todo.md`：任务拆解与近期进展。
- `docs/`：设计说明、字体策略等补充文档。
- `docs/fenxiao/`：分销平台说明与任务。
- `apps/distributor/README.md`：分销平台应用说明。
- `middleware.ts`：设备分流核心逻辑，改动需谨慎并补测试。
- `_shared/` 各领域目录：务必熟悉，避免在外壳重复实现业务。
