# 架构与复用说明

## 分层关系

- **App Router**：根目录 `app/`，通过 `middleware.ts` 将外部 URL 重写到 `/d` 或未来的 `/m`。
- **桌面外壳 (`app/d`)**：负责布局、导航、页脚等容器结构，每个页面仅组合 `_shared` 提供的页面模块。
- **共享层 (`app/_shared`)**：领域逻辑单一事实来源，按业务域划分：`account/`、`checkout/`、`pages/`、`layouts/`、`search/` 等。
- **组件层 (`components/`)**：通用 UI 与业务组件，按功能域如 `cart/`、`layout/`、`product/` 分类。

## 页面壳与业务模块解耦

- `/d/(shell)/layout.tsx`（及未来 `/m` 对应文件）统一注入导航、主题、全局状态。
- 业务页面入口（如 `app/d/product/[handle]/page.tsx`）仅负责获取数据 + 渲染 `_shared/pages/product/ProductPage`。
- `_shared/layouts/` 暴露 `DesktopAppLayout`、`CmsLayout` 等壳体；`_shared/pages/` 将领域模块组合为完整页面。

## 复用组件入口

- `app/_shared/index.ts` 汇总主力组件与 action，供 `/d` 与 `/m` 统一导入。
- 购物流程相关组件：`AddToCartButton`、`CartSheet`、`CheckoutClient`。
- 导航/快捷入口：`components/layout/`（Mega Menu、工具栏）、`components/cart/`（悬浮购物车、徽标）。
- 搜索/商品列表：`app/_shared/search/*`，包括侧边栏、分页、数据加载器，可被桌面/移动两端复用。

## 状态管理与 Server Actions

- **Zustand**：`hooks/useAuthStore.ts` 当前维护登录态，可按需扩展更多 store，并通过 selector 减少渲染开销。
- **Server Actions**：集中在 `_shared/*/actions.ts`（账户、结算、优惠券等），返回形如 `{ success: boolean; data?: T; error?: string }`。
- **Auth 协议**：`hooks/useAuthStore.ts` 与 `lib/api/auth-store.ts` 配合；服务端写 `auth_session` cookie，客户端统一从 store 读取。

## 扩展与二次开发建议

- 新页面：优先在 `_shared/pages/xxx` 内组合模块，再创建 `/d/xxx/page.tsx` 调用；若存在移动外壳，新增 `/m/xxx/page.tsx` 复用相同入口。
- 新 UI 样式：先尝试扩展 `_shared` 或 `components/` 既有组件，通过 props 切换样式或动画；确实不合适再新增组件。
- 新领域模块：遵循现有目录命名，补齐 `index.ts` 出口、Server Action、mock 数据与类型。
- 动画与图标：分别放在 Framer Motion 变体与 `components/icons/` 内集中管理，避免散落。

## 参考索引

- `app/d` 页面清单：`search`、`product`、`account`、`checkout` 等与共享层一一对应。
- `_shared/account`：账户壳体、导航、地址/优惠券/问卷模块。
- `_shared/checkout`：`CheckoutClient`、`PrescriptionComplianceSteps`、Server Action。
- `_shared/coupons`：兑换表单、列表 UI，与账户/结算共享逻辑。
