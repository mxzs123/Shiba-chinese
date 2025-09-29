# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的电商前端应用 (Shiba Edition),采用双外壳架构 (桌面/移动端分离),通过 middleware 实现设备分流。系统默认使用 mock 数据进行开发,便于在无后端环境下进行组件调试和页面开发。

**当前开发状态**:

- 桌面端外壳 (`/d`) 已完成,包含所有核心业务流程
- 移动端外壳 (`/m`) 尚未实现,当前移动设备访问会自动回退到桌面版本
- 所有业务逻辑已在 `app/_shared/` 中实现,为移动端开发做好准备

## 技术栈

- **框架**: Next.js 15.5.3 (App Router + Turbopack)
- **UI**: React 19, React Server Components, Server Actions
- **样式**: Tailwind CSS v4 + shadcn/ui 组件
- **状态**: Zustand (客户端状态管理)
- **动画**: Framer Motion
- **类型**: TypeScript 5.8.2
- **代码质量**: ESLint + Prettier (2 空格缩进)

## 常用命令

```bash
npm run dev              # 启动开发服务器 (Turbopack)
npm run build            # 生产构建
npm run start            # 预览生产构建
npm run lint             # ESLint 代码检查
npm run prettier         # 格式化代码
npm run prettier:check   # 格式检查 (CI 使用)
npm run test             # 运行测试 (当前为 prettier:check)
```

## 快速参考

开发时必须遵守的核心规范：

- **页面复用**：新页面必须在 `app/_shared` 实现业务逻辑，`app/d` 只做外壳引用
- **代码质量**：提交前必须运行 `npm run lint` 和 `npm run prettier:check`
- **数据访问**：统一通过 `lib/api`，扩展时同步更新 `types.ts` 和 `mock-data.ts`
- **设备分流**：由 `middleware.ts` 自动处理，不要在组件内做设备判断
- **Server Actions**：集中在 `_shared/*/actions.ts`，统一返回 `{ success, data, error }` 结构

## 项目架构

### 目录结构

```
app/
├── _shared/          # 跨外壳的共享业务逻辑 (领域层)
│   ├── account/      # 账户相关组件、表单、Server Actions
│   ├── checkout/     # 结算流程、优惠券、支付
│   ├── coupons/      # 优惠券兑换
│   ├── auth/         # 认证相关
│   ├── address/      # 地址管理
│   ├── layouts/      # 共享布局 (DesktopAppLayout, CmsLayout 等)
│   ├── pages/        # 按业务领域组织的页面模块 (home, news, product, search 等)
│   └── index.ts      # 统一出口
├── d/                # 桌面端外壳 (通过 middleware 路由)
├── m/                # 移动端外壳 (待完善)
├── api/              # API 路由 (revalidate, auth 等)
├── product/          # 商品页
├── search/           # 搜索页
├── news/             # 新闻页
└── [page]/           # CMS 动态页面

components/           # 可复用 UI 组件
├── cart/             # 购物车相关
├── layout/           # 布局组件 (navbar, footer, product-grid 等)
├── product/          # 商品展示组件
├── icons/            # 图标封装 (基于 lucide-react)
└── ui/               # shadcn/ui 组件 (通过 npx shadcn@latest add)

lib/
├── api/              # 数据访问层
│   ├── index.ts      # API 函数 (getProduct, getCart, addToCart 等)
│   ├── types.ts      # 类型定义 (Product, Cart, User, Order 等)
│   ├── mock-data.ts  # 模拟数据
│   ├── auth-store.ts # 服务端认证状态管理
│   └── serializers.ts# 数据序列化工具
├── constants.ts      # 全局常量
├── utils.ts          # 通用工具函数 (cn 等)
├── currency.ts       # 货币格式化
└── pricing.ts        # 价格计算

middleware.ts         # 设备分流逻辑 (query → cookie → UA)
```

### 核心架构原则

1. **共享页面壳 (`app/_shared/`)**

   - 所有业务逻辑必须在 `_shared` 中实现
   - `/d` 和 `/m` 外壳层只负责引入页面壳并传参,不包含业务逻辑
   - 新增页面时,先在 `_shared/pages/` 创建页面组件,再在外壳层引用

2. **设备分流 (middleware.ts)**

   - 判定顺序: query `?device=d|m` → cookie `device` → User Agent
   - 所有请求重写到 `/${device}${pathname}`,地址栏保持原始 URL
   - 响应头设置 `x-device` 和 `Vary: x-device` 以隔离缓存
   - **临时回退**: 移动端 (`/m`) 尚未实现,middleware 会将所有移动设备流量临时回退到 `/d`
   - **待开发**: 移动端外壳完成后需移除 `middleware.ts:53-57` 的 fallback 逻辑

3. **数据访问 (`lib/api/`)**

   - 所有数据访问统一通过 `lib/api/index.ts` 中的函数
   - 未配置 `COMMERCE_API_URL` 时使用 `mock-data.ts` 中的模拟数据
   - 扩展 API 时必须同步更新 `types.ts` 和相关文档

4. **状态管理**

   - 使用 Zustand 管理客户端状态 (store 放在 `hooks/`)
   - 登录态通过 `hooks/useAuthStore.ts` 和 `lib/api/auth-store.ts` 协同
   - Server Actions 写入 `auth_session` cookie

5. **购物车实现**
   - 基于服务端 Cookie 存储 (`cartId`, `cartState`)
   - 购物车数据存储在内存 Map (开发环境) 或可替换为 Redis
   - 选中态通过 `CART_SELECTED_MERCHANDISE_COOKIE` 管理

## 开发规范

### 代码风格

- **TypeScript**: 使用函数组件,保持 2 空格缩进
- **导入顺序**: 第三方包 → `lib/` → 相对路径
- **命名规范**:
  - 组件文件与导出: PascalCase
  - hooks: camelCase
  - 常量: SCREAMING_SNAKE_CASE
- **Tailwind 类**: 按布局 → 间距 → 视觉顺序书写
- **提交前**: 必须运行 `npm run lint` 和 `npm run prettier:check`

### 组件开发

1. **shadcn/ui 集成**

   ```bash
   npx shadcn@latest add <component>
   ```

   - 生成的组件位于 `components/ui/`
   - 主题变量在 `app/globals.css` 中维护

2. **图标使用**

   - 统一使用 `lucide-react`
   - 新增图标通过 `components/icons/` 封装并语义化命名

3. **动画实现**

   - 使用 Framer Motion,集中声明动画变体
   - 避免分散的动画实现

4. **共享组件复用**
   - 优先使用 `_shared` 已定义的组件 (如 `PrimaryButton`, `CheckoutActionButton`)
   - 需要新样式时,先评估是否可通过 props 扩展

### Server Actions

- 集中在 `_shared/*/actions.ts` 中实现 (如 `_shared/account/actions.ts`, `_shared/checkout/actions.ts`)
- 统一返回 `{ success: boolean; data?: any; error?: string }` 结构
- 扩展能力时直接在对应 action 扩展,保持返回结构一致

## 关键功能模块

### 搜索与商品

- **搜索页**: `app/d/search/page.tsx` 和 `app/d/search/[collection]/page.tsx`
- **URL 参数**: `q` (关键词), `sort` (排序), `page` (分页)
- **配置**: `app/_shared/search/config.ts` 维护默认品类和分页常量
- **组件**: `SearchPageShell`, `SearchResultsGrid`, `SearchPagination`, `DesktopSearchSidebar`
- **商品网格**: `components/layout/product-grid-items.tsx` 支持 `interactive` 和 `animate` 开关

### 购物车与结算

- **购物车**: `components/cart/` 管理购物车入口、上下文与条目操作
- **选中态**: 使用 `cart-selection` 工具与 `CART_SELECTED_MERCHANDISE_COOKIE`
- **结算页**: `_shared/checkout/CheckoutClient` 聚合地址、配送、支付、优惠券、处方提示
- **优惠券**: `_shared/coupons/CouponRedeemForm` 提供兑换 UI
- **处方药**: `components/prescription/PrescriptionComplianceReminder.tsx` 和 `_shared/checkout/PrescriptionComplianceSteps.tsx`

### 账户中心

- **框架**: `_shared/account/AccountShell` 提供导航与响应式框架
- **Server Actions**: `_shared/account/actions.ts` 覆盖资料更新、地址维护、优惠券兑换、问卷保存/提交
- **导航配置**: `nav-items.ts` 定义 tab 列表
- **面板**: 全部在 `_shared/account/` 维护 (资料、地址、优惠券、积分、问卷、身份认证等)

## 环境配置

必须配置的环境变量 (复制 `.env.example` 为 `.env.local`):

```bash
# 商品服务地址 (未配置时使用 mock 数据)
COMMERCE_API_URL=

# 下单跳转地址
COMMERCE_CHECKOUT_URL=

# 重新验证接口的安全令牌
REVALIDATION_SECRET=

# 日元至人民币汇率 (公开,默认 0.052)
NEXT_PUBLIC_JPY_TO_CNY_RATE=0.052
```

**注意**:

- 新增环境变量必须同步 `.env.example` 和 README
- 展示型变量使用 `NEXT_PUBLIC_*` 前缀
- 远程图片域名需在 `next.config.ts` 的 `images.remotePatterns` 中配置

## 测试清单

### 当前需验证（桌面端）

- 搜索 → 商品详情 → 加入购物车 → 结算流程
- 桌面端导航交互和响应式布局
- 深浅色主题切换
- 多语言文案展示
- 账户中心: 资料更新、地址增删改、默认地址切换、优惠券兑换、问卷保存
- 结算页: 选中商品同步、优惠券应用/移除、处方药提醒、下单结果页
- `?device=d` 参数强制桌面版
- 移动设备访问时自动回退到桌面版

### 移动端开发后需验证

- 移动端完整购物流程
- 移动端导航和手势交互
- `?device=m` 参数强制移动版
- 设备间缓存隔离（检查 `x-device` 和 `Vary` 头）
- `device` cookie 在桌面和移动版间切换

## 对接后端

1. **API 替换**:

   - 在 `lib/api/index.ts` 中替换 mock 数据相关实现
   - 保持 `types.ts` 中的类型定义不变
   - 扩展分页或排序时同步前端筛选项

2. **购物车存储**:

   - 当前基于内存 Map,可替换为 Redis 或数据库
   - 修改 `lib/api/index.ts` 中的 `getCartStore()` 实现

3. **增量刷新**:

   - 后端 Webhook 可调用 `/api/revalidate?secret=${REVALIDATION_SECRET}`
   - 支持按 `tag` 或 `path` 触发重新验证

4. **认证集成**:
   - Server Actions 通过 `getUserFromSessionCookie()` 获取当前用户
   - 客户端通过 `hooks/useAuthStore.ts` 读取登录态

## 移动端开发指引

当前 `app/m` 尚未实现，开发时需要：

1. **复制路由结构**: 将 `app/d` 的路由结构复制到 `app/m`，保持路径一致
2. **创建移动布局**: 创建移动端专用的 `layout.tsx`，实现移动端导航和页眉页脚
3. **复用业务逻辑**: 页面文件引用 `_shared` 中相同的业务组件，只传递不同的布局参数
4. **移除临时回退**: 更新 `middleware.ts:53-57`，移除桌面回退逻辑，让移动流量正确路由到 `/m`
5. **测试验证**: 验证 SSR、导航预取、缓存隔离、水合一致性在移动端的表现

## 安全注意事项

- 禁止提交 `.env.local`、模拟账号或后端凭证
- 身份认证/证件上传仅保留占位数据
- 引入第三方脚本时在 PR 中说明用途与数据流向
- 上线前补齐所有必需的环境变量

## 重要提示

- **新页面或路由**: 必须复用 `app/_shared` 页面壳,外壳层只承载差异
- **所有改动**: 提交前运行 `npm run lint` 与 `npm run prettier:check`
- **数据访问**: 中央化在 `lib/api`,扩展后同步更新类型定义与文档
- **设备分流**: 遵循 `middleware.ts` 的判定逻辑,不要在组件内做设备判断
- **图标与动画**: 统一使用 `lucide-react` + `components/icons/` 和 Framer Motion
- **Server Action**: 已在 `_shared` 内封装,扩展时保持 `success/data` 结构