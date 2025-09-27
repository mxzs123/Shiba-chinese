# Repository Guidelines

## 快速参考

- 新页面或路由必须复用 `app/_shared` 页面壳；`app/d`、`app/m` 只承载外壳差异。
- 所有改动提交前运行 `npm run lint` 与 `npm run prettier:check`，保持 2 空格缩进与命名规范。
- 中央化数据访问在 `lib/api`，扩展后同步更新 `types.ts`、`mock-data.ts` 与相关文档。
- 设备分流依赖 `middleware.ts`：遵循 query → cookie → UA 的判定顺序，并设置 `x-device` 与 `Vary` 头。
- 图标统一通过 `lucide-react` + `components/icons/`；动画由 Framer Motion 驱动，避免分散实现。
- 环境变量写入 `.env.local`，新增字段务必同步 `.env.example` 与 README/Docs，勿提交敏感值。
- 账户、结算等 Server Action 已在 `_shared` 内封装；新增能力时直接扩展现有 action，保持 `success/data` 结构。
- 手动验证覆盖搜索→商品→购物车、结算流程、账户操作、主题切换与多语言展示。

## 目录

1. [项目结构与模块组织](#项目结构与模块组织)
2. [shadcn/ui 集成](#shadcnui-集成)
3. [共享页面壳与组件复用](#共享页面壳与组件复用)
4. [动画、图标与状态管理](#动画图标与状态管理)
5. [字体策略](#字体策略)
6. [代码风格与命名规范](#代码风格与命名规范)
7. [测试指引](#测试指引)
8. [环境与配置提示](#环境与配置提示)
9. [数据与后端协作](#数据与后端协作)
10. [购物车、结算与优惠券](#购物车结算与优惠券)
11. [账户中心与合规模块](#账户中心与合规模块)
12. [使用 MOCK 数据](#使用-mock-数据)
13. [安全与发布提示](#安全与发布提示)
14. [单 URL · 双外壳 · Middleware 重写](#单-url--双外壳--middleware-重写)

## 项目结构与模块组织

- 页面采用 Next.js App Router，核心业务路径位于 `app/`（如 `/product`、`/search`、`/[page]`）。`app/api/revalidate` 负责后端通知后的增量刷新。
- UI 组件按功能域划分在 `components/`，如 `cart/`、`layout/`、`product/`。公共图标集中在 `components/icons/`。
- `app/_shared/` 是跨外壳的领域层：`index.ts` 提供统一出口，子目录按领域（`account/`、`checkout/`、`coupons/`、`layouts/`、`pages/` 等）组织，可同时服务 `/d` 与 `/m`。
- 数据访问封装在 `lib/api/`：`index.ts` 处理实际或模拟 API 交互，`mock-data.ts` 存放演示数据，`types.ts` 维护接口契约与查找函数。
- 字体资源放在 `fonts/`，公共文档统一放在 `docs/` 便于查阅。

## shadcn/ui 集成

- 新增组件请运行 `npx shadcn@latest add <component>`，生成的文件位于 `components/ui/` 并复用 `@/lib/utils` 的 `cn` 工具。
- 主题变量入口为 `app/globals.css`；全局主题调整集中在该文件维护。

## 共享页面壳与组件复用

### `_shared` 目录职责

- `_shared/layouts/`：暴露 `DesktopAppLayout`、`CmsLayout` 等外壳框架。
- `_shared/pages/`：按业务领域（`home/`、`news/`、`product/`、`search/` 等）组合页面模块，供 `/d` 与 `/m` 共享。
- `_shared/account/`、`_shared/checkout/`、`_shared/coupons/`、`_shared/auth/` 等聚合领域组件、表单及 Server Action，保持单一事实来源。

### 页面引用规范

- `/d` 与未来的 `/m` 页面只负责引入 `_shared` 页面壳并传参，不在外壳里落业务逻辑。
- 复用按钮/表单优先使用 `_shared` 已定义的组件（如 `PrimaryButton`、`CheckoutActionButton`）；若需要新样式，先评估是否可通过 props 扩展。
- 账户侧 badge、订单阶段、问卷等 UI 必须在 `_shared/account/` 扩展，避免散落在 `/d/account`。
- 优惠券兑换、地址管理等交互已经在 `_shared` Server Action 内实现，新的 API 能力直接在对应 action 扩展并保持返回结构。

## 动画、图标与状态管理

- 图标统一使用 `lucide-react`，新增图标通过 `components/icons/` 封装并语义化命名。
- 动画采用 Framer Motion，集中在驱动组件或 hooks 中声明动画变体，便于复用与调优。
- 状态管理基于 Zustand，store 统一放在 `hooks/`，使用 selector 减少无关渲染；若需持久化可结合 `zustand/middleware`。
- 登录态通过 `hooks/useAuthStore.ts` 与 `lib/api/auth-store.ts` 协同，Server Action 写入 `auth_session` cookie，客户端统一从 `useAuthStore` 读取。

## 字体策略

- 默认字体为 Inter，在 `app/layout.tsx` 暴露 `--font-inter` 变量。
- `app/globals.css` 的 `--font-sans` 将 Inter 与系统中文字体（`PingFang SC`、`Microsoft YaHei`、`Noto Sans SC` 等）组合，确保中英混排一致。
- 新增组件避免手动覆盖 `font-family`，如需特例请基于 `--font-sans` 或 `--font-inter` 扩展。

## 代码风格与命名规范

- 全部使用 TypeScript 函数组件，保持 2 空格缩进。
- 导入顺序：第三方包 → `lib/` → 相对路径；优先使用命名导出。
- 组件文件与导出采用 PascalCase，hooks 用 camelCase，常量用 SCREAMING_SNAKE_CASE。
- Tailwind v4 原子类按布局 → 间距 → 视觉顺序书写；复用场景可抽提子组件或工具函数。
- 复杂交互需在关键容器添加注释说明设计意图。
- 提交前必须运行 `npm run lint` 与 `npm run prettier:check`。

## 测试指引

- `npm run prettier:check`，确保格式一致。
- 购物流程：搜索 → 商品详情 → 加入购物车。
- 移动端断点、导航交互、深浅色主题切换及样式一致性。
- 多语言文案展示。
- 个人中心：资料更新、地址增删改、默认地址切换、优惠券兑换、问卷保存/提交。
- 结算页：选中商品同步、优惠券应用/移除、处方药提醒、下单结果页。

## 环境与配置提示

- `.env.local` 存放敏感变量：`COMMERCE_API_URL`（缺省使用 mock 数据）、`COMMERCE_CHECKOUT_URL`、`REVALIDATION_SECRET`。
- 展示型变量通过 `NEXT_PUBLIC_*` 暴露，如汇率 `NEXT_PUBLIC_JPY_TO_CNY_RATE`；更新时同步 README 与演示数据。
- 新增环境变量需同步 `.env.example` 与文档，并在 PR 描述提醒。
- 使用远程图片时在 `next.config.ts` 中维护 `images.remotePatterns`；依赖外部 API 要在部署环境配置同名变量。

## 数据与后端协作

- 默认逻辑使用 `lib/api/index.ts` 读取 mock 数据并写入 `cartId` cookie 管理购物车，可无缝切换到会话或 Redis。
- 对接真实服务时替换 `mock-data.ts` 相关实现，但保持 `types.ts` 定义不变；扩展分页或排序需同步前端筛选项。
- 后端 Webhook 可调用 `/api/revalidate`，配合 `REVALIDATION_SECRET` 校验；必要时对产品、集合分别触发 `revalidateTag`。

## 购物车、结算与优惠券

- `components/cart/` 管理购物车入口、上下文与条目操作；选中态使用 `cart-selection` 工具与 `CART_SELECTED_MERCHANDISE_COOKIE`。
- `_shared/checkout/CheckoutClient` 聚合地址、配送、支付、优惠券、处方提示；页面层负责准备 `cart`、`shippingMethods`、`paymentMethods`、`availableCoupons` 等数据。
- 结算相关 Server Action 位于 `_shared/checkout/actions.ts`，统一返回 `success/data` 结构；扩展时遵守该约定。
- 优惠券兑换 UI 由 `_shared/coupons/CouponRedeemForm` 提供，配套逻辑位于 `_shared/account/actions.ts` 与 `_shared/checkout/actions.ts`。
- 处方药合规入口：`components/prescription/PrescriptionComplianceReminder.tsx` 与 `_shared/checkout/PrescriptionComplianceSteps.tsx`；判定逻辑在 `CheckoutPage` 的 `cartNeedsPrescriptionReview` 中基于商品 `tags.prescription`。

## 账户中心与合规模块

- `_shared/account/AccountShell` 提供个人中心导航与响应式框架，`/d/account/*` 页面仅传入 `ACCOUNT_NAV_ITEMS` 与对应面板组件。
- Server Action 集中在 `_shared/account/actions.ts`，覆盖资料更新、地址维护、默认地址切换、优惠券兑换、身份认证、问卷保存/提交；扩展字段需复用统一 `ActionResult`。
- 问卷/健康评估由 `_shared/account/surveys-*` 提供，依赖 `lib/api` 的 `surveyAssignments` 与 `surveyTemplates`；切换后端时保持 assignment/template ID 映射。
- 会员权益、优惠券列表、订单详情等面板全部在 `_shared/account` 维护，新增 tab 时更新 `nav-items.ts` 并确保 `/d/account/[tab]/page.tsx` 只做壳层转发。

## 使用 MOCK 数据

- 仅需前端占位时可在 `mock-data.ts` 扩展集合、商品、优惠券、积分、问卷模板与通知，但要附带清晰注释。
- 如果 mock 数据覆盖关键流程（地址簿、问卷、身份认证等），在测试计划中明确哪些结果来自静态数据，防止 QA 误判。
- 准备接入真实服务时，在 PR 中说明哪些字段仍为模拟值，方便后续替换。

## 安全与发布提示

- 禁止提交 `.env.local`、模拟账号或后端凭证；敏感口令通过内部分发。
- 身份认证/证件上传仅保留占位数据，勿使用真实证件号或照片。
- 上线前补齐 `COMMERCE_API_URL` 等变量，并根据后端安全策略配置允许域名或 IP 白名单。
- 引入埋点或第三方脚本时在 PR 中说明用途与数据流向，必要时同步合规团队。

## 单 URL · 双外壳 · Middleware 重写

### 核心原则

- 对用户暴露单一 URL，真实渲染路径分别位于 `app/d`（桌面）与 `app/m`（移动）。
- middleware 负责设备分流，根布局不进行客户端条件切换，以避免水合错位。
- `_shared` 保持业务逻辑的单一事实来源，外壳差异限定在 `(shell)/layout.tsx`。

### 目录组织

- `app/d`：桌面外壳及布局。
- `app/m`：移动外壳及布局。
- `app/_shared`：领域组件与展示逻辑（如 ProductCard、Price、SkuSelector、格式化工具）。
- `app/page.tsx`：可作为兜底或说明页面。

### Middleware 策略

- 判定顺序：query `?device=d|m` → `device` cookie → `userAgent` 推断（mobile/tablet → `m`，其余 → `d`）。
- 重写路径：将请求重写到 `/${device}${pathname}`，并透传原始地址栏。
- 头部：请求与响应设置 `x-device`，响应附带 `Vary: x-device` 以隔离缓存。
- Cookie：当 query 覆盖与 cookie 不一致时写回 `device` cookie。
- 匹配范围排除静态资源及通用文件（`/_next/*`、`favicon.ico`、`robots.txt`、`sitemap.xml` 等）。

```ts
import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const queryOverride = url.searchParams.get("device");
  const cookieOverride = req.cookies.get("device")?.value;
  const ua = userAgent(req);
  const inferred =
    ua.device.type === "mobile" || ua.device.type === "tablet" ? "m" : "d";
  const override = queryOverride || cookieOverride;
  const device = override === "m" ? "m" : override === "d" ? "d" : inferred;

  const target = url.clone();
  target.pathname = `/${device}${url.pathname}`;

  const headers = new Headers(req.headers);
  headers.set("x-device", device);

  const response = NextResponse.rewrite(target, { request: { headers } });
  response.headers.set("x-device", device);
  response.headers.set("Vary", "x-device");
  if (queryOverride && queryOverride !== cookieOverride) {
    response.cookies.set("device", device, { path: "/" });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
```

### 路由实现与开发清单

- `app/d` 与 `app/m` 路由树保持一致（例如都实现 `product/[slug]/page.tsx`）。
- 外壳 `(shell)/layout.tsx` 承载导航、页眉、页脚等差异，同时尽量保持骨架 DOM 结构一致。
- 组件内 `<Link>` 与编程式跳转始终使用用户 URL，不加 `/d`、`/m` 前缀。
- 需要窗口尺寸时仅用于微交互，严禁改变关键节点的顺序与数量。

### SSR 与水合一致性

- 设备分流在服务端完成，客户端仅处理细节交互，不替换核心 DOM。
- 优先使用 CSS/Tailwind 做响应式；必须读取窗口尺寸时确保不会引发骨架差异。

### 渐进迁移步骤

- 建立并完善 `app/_shared`，将领域组件抽离到该目录。
- 在 `app/d` 与 `app/m` 复制现有页面，主体复用 `_shared` 组合。
- 实现 `middleware.ts` 的 UA 判定、query/cookie 覆盖与重写逻辑。
- 自测确认 SSR、导航预取、缓存及水合均按设备分流。

### 核心验证

- 桌面 UA 命中 `/d`，移动/平板 UA 命中 `/m`，地址栏保持用户 URL。
- 首屏无水合错位或 Hydration 警告。
- `next/link` 预取、浏览器前进/返回、RSC 缓存在设备间相互隔离（检查 `x-device` 与 `Vary`）。
- `?device=m|d` 与 `device` cookie 能稳定切换外壳。
