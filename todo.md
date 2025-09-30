# 移动端外壳 TODO

## 阶段 0 · 现状盘点 ✅

### `/d` → `/m` 路由映射

#### ✅ 已实现（V1 核心功能）

- ✅ `/` → `app/m/page.tsx` - 首页（轮播图、分类、活动速递、热门推荐）
- ✅ `/cart` → `app/m/cart/page.tsx` - 购物车（商品管理、上拉抽屉显示详情）
- ✅ `/categories` → `app/m/categories/page.tsx` - 分类页（左侧导航+右侧商品列表）
- ✅ `/account` → `app/m/account/page.tsx` - 我的（个人中心入口）

#### 🚧 待实现（V2 计划）

- [ ] `/login` → `app/m/(auth)/login/page.tsx`
- [ ] `/register` → `app/m/(auth)/register/page.tsx`
- [ ] `/<page>` → `app/m/[page]/page.tsx` - CMS 动态页面
- [ ] `/about` → `app/m/about/page.tsx`
- [ ] `/account/profile` → `app/m/account/profile/page.tsx`
- [ ] `/account/addresses` → `app/m/account/addresses/page.tsx`
- [ ] `/account/coupons` → `app/m/account/coupons/page.tsx`
- [ ] `/account/membership` → `app/m/account/membership/page.tsx`
- [ ] `/account/orders` → `app/m/account/orders/page.tsx`
- [ ] `/account/orders/[orderId]` → `app/m/account/orders/[orderId]/page.tsx`
- [ ] `/account/surveys` → `app/m/account/surveys/page.tsx`
- [ ] `/account/surveys/[assignmentId]` → `app/m/account/surveys/[assignmentId]/page.tsx`
- [ ] `/checkout` → `app/m/checkout/page.tsx`
- [ ] `/checkout/success` → `app/m/checkout/success/page.tsx`
- [ ] `/checkout/failed` → `app/m/checkout/failed/page.tsx`
- [ ] `/checkout/prescription-review` → `app/m/checkout/prescription-review/page.tsx`
- [ ] `/faq` → `app/m/faq/page.tsx`
- [ ] `/news` → `app/m/news/page.tsx`
- [ ] `/news/[slug]` → `app/m/news/[slug]/page.tsx`
- [ ] `/product/[handle]` → `app/m/product/[handle]/page.tsx`
- [ ] `/search` → `app/m/search/page.tsx`
- [ ] `/search/[collection]` → `app/m/search/[collection]/page.tsx`

### 任务清单

- ✅ 生成当前 `/d` 路由清单，与团队确认 `/m` 的一一对应目标
- ✅ 审阅 `_shared/layouts/desktop-app-layout.tsx`，标记必须在移动外壳复用的 provider 与 hook
  - 已确认：CartProvider、Toaster、PrescriptionComplianceReminder、数据获取函数
- ✅ 整理 `components/layout`、`components/cart` 中已有的移动端变体
  - 已复用：CartBadge、CartSelectionCheckbox、DeleteItemButton、QuantityInput
- ✅ 收集移动端特有的交互诉求
  - 底部四项导航栏：首页/分类/购物车/我的
  - 顶部栏：搜索+消息中心
  - 购物车上拉抽屉显示详情
  - 分类页左右分栏布局

## 阶段 1 · `app/m` 脚手架 ✅

- ✅ 新建 `app/m/layout.tsx`，复用桌面外壳的调用方式但切换为 `MobileAppLayout`
- ✅ 在 `app/_shared/layouts/mobile-app-layout.tsx` 中实现移动外壳，接入共享 provider（`CartProvider`、`Toaster`、处方提醒）
  - 已实现：正确传参 PrescriptionComplianceReminder（orderId、orderNumber、productTitles 等）
  - 已实现：集成 MobileBottomNav 底部导航
  - 已实现：pb-16 为底部导航预留空间
- ✅ 在 `app/m/page.tsx` 引用 `_shared/pages/home` 作为冒烟测试，确认布局可渲染且无运行时错误
  - 已复用：HomeHeroSection、HomeQuickCategoryShortcuts、HomeActivityNotice、HomeRecommendations
- ✅ 更新 `app/_shared/layouts/index.ts` 暴露新的移动外壳导出（通过直接导入实现）

## 阶段 2 · 导航与框架 ✅ (部分)

- ✅ 设计移动端头部与导航（顶栏、搜索入口、消息中心入口）
  - 已实现：`components/layout/mobile-header.tsx`
  - 已实现：复用 NotificationLink 组件
  - 已实现：支持搜索输入框和占位按钮两种模式（showSearchInput prop）
- ✅ 实现常驻的移动端购物车入口（底部导航栏中的购物车 tab）
  - 已实现：`components/layout/mobile-bottom-nav.tsx`
  - 已实现：集成 CartBadge 显示购物车数量
  - 已实现：购物车 icon 显示未读数量徽章
- ✅ 构建底部四项导航栏（首页/分类/购物车/我的）
  - 已实现：fixed 定位在底部
  - 已实现：根据当前路径高亮 active 状态
  - 已实现：z-50 确保在内容之上
- [ ] 检查移动端导航与购物车浮层的焦点状态、滚动锁定与关闭交互
  - 待测试：购物车上拉抽屉的交互体验
  - 待测试：通知中心 Popover 的移动端表现

## 阶段 3 · 路由对齐 ⚠️ (核心完成)

- ✅ 底部导航四个 Tab（首页、分类、购物车、我的）分别指向 `/`、`/categories`、`/cart`、`/account`
  - 已实现：`components/layout/mobile-bottom-nav.tsx` 中的路由配置
  - 已实现：根据 pathname 自动高亮 active 状态
  - 已实现：购物车 tab 显示商品数量徽章

### ✅ V1 已实现的核心页面

#### 首页（app/m/page.tsx）

- ✅ 顶部包含搜索栏与消息中心入口（MobileHeader）
- ✅ 轮播图（HomeHeroSection，与桌面端保持相同比例）
- ✅ 分类快捷入口（HomeQuickCategoryShortcuts）
- ✅ 活动速递广播（HomeActivityNotice）
- ✅ 热门药品推荐（HomeRecommendations）
- ✅ 移动优化的品质承诺（HomeAdvantagesSection）
- ✅ 移动优化的客服时间（HomeSupportScheduleSection）
- ✅ 底栏基础信息（Footer）

#### 分类页（app/m/categories/page.tsx + categories-content.tsx）

- ✅ 顶部保留搜索栏与消息中心（MobileHeader）
- ✅ 左侧呈现医药品/OTC 等一级分类的垂直列表（w-24 宽度）
- ✅ 右侧列表展示当前分类信息（包含占位，待实现商品列表）
- ✅ 分类选中状态管理（useState + useRouter）

#### 购物车页（app/m/cart/page.tsx + cart-content.tsx）

- ✅ 维持桌面端的商品管理与批量操作
  - 全选/单选功能
  - 数量调整（QuantityInput）
  - 删除商品（DeleteItemButton）
- ✅ 结算按钮旁仅显示总金额
- ✅ 详细费用改为上拉抽屉展示（Headless UI Dialog + Transition）
  - 已选商品数量
  - 商品金额
  - 运费提示
  - 应付总计

#### 我的页面（app/m/account/page.tsx）

- ✅ 用户信息卡片（头像、姓名、邮箱）
- ✅ 功能入口列表：
  - 个人信息
  - 收货地址
  - 优惠券
  - 我的审核
  - 会员权益
  - 订单管理
- ✅ 每项跳转到对应的新页面路径（复用 ACCOUNT_NAV_ITEMS）

### 🚧 待实现的其他路由（V2 计划）

- [ ] 认证页面：`/login`、`/register`
- [ ] 商品详情：`/product/[handle]`
- [ ] 搜索页：`/search`、`/search/[collection]`
- [ ] 结算流程：`/checkout`、`/checkout/success`、`/checkout/failed`、`/checkout/prescription-review`
- [ ] 账户子页面：`/account/*`（profile、addresses、coupons、membership、orders、surveys 等）
- [ ] CMS 页面：`/[page]`、`/about`、`/faq`
- [ ] 新闻页：`/news`、`/news/[slug]`

### 待优化

- [ ] 特别关注 `(auth)` 与 `[page]` 等嵌套结构，确认共享参数满足移动端需求
- [ ] 仅在桌面已有差异的场景补充移动端特有的 loading/error 状态
- [ ] 对需要后续动画或手势优化的移动包装组件添加 TODO 备注

## 阶段 4 · 共享组件适配 🚧

- [ ] 审核 `_shared` 组件是否存在固定列数、大间距等宽度假设，并通过新增 props 支持双外壳安全切换
- [ ] 为 `ProductCard`、`SkuSelector` 等组件扩展移动友好配置，同时保持桌面端兼容
- [ ] 验证认证、地址、结算等表单在小屏上的可访问性（键盘避让、输入分组、按钮尺寸）
- [ ] 如需新增移动端间距或字号变量，更新 Tailwind token 或 CSS 变量，并在 `docs/` 记录

## 阶段 5 · 中间件与分流 ✅ (核心完成)

- ✅ 在关键 `/m` 路由可用后，更新 `middleware.ts` 移除临时桌面回退逻辑
  - 已完成：删除 `middleware.ts:53-57` 的 TEMPORARY 回退代码
  - 已完成：移动设备流量正确路由到 `/m`
  - 已完成：`rewriteTargetDevice` 变量已移除，直接使用 `device`
- [ ] 为 `resolveDevice` 增加覆盖 query、cookie、UA 多分支的回归测试（单测或集成测试）
- [ ] 对比移动端上线前后的首屏指标（TTFB、水合告警），确认无明显回退

## 阶段 6 · QA 与加固 ⚠️ (部分完成)

- ✅ 运行 `npm run lint` 与 `npm run prettier:check`，保持基础质量阈值
  - 已通过：ESLint 检查无错误
  - 已通过：Prettier 格式检查
  - 已通过：TypeScript 类型检查
  - 已通过：生产构建（npm run build）
- [ ] 在移动宽度下手动走查：主页 → 商品 → 购物车 → 结算、账号页签、问卷、优惠券兑换、处方提示等全流程
  - 待测试：首页各模块响应式布局
  - 待测试：分类页左右分栏交互
  - 待测试：购物车上拉抽屉体验
  - 待测试：底部导航栏在各页面的表现
- [ ] 验证 `next/link` 预取、浏览器前进后退与 `x-device` 响应头在设备切换时表现正常
- [ ] 整理已知问题或暂缓打磨项，在正式发布前创建后续跟进任务
  - 已知：分类页商品列表为占位状态，待实现
  - 已知：账户中心各子页面仅有入口，内容页待实现

## 阶段 7 · 上线准备 🚧

- [ ] 更新 README 与相关文档，加入移动外壳的使用说明与界面截图
- [ ] 与设计/QA 对齐验收标准，记录设备矩阵（iOS/Android、Safari/Chrome 等）
- [ ] 上线后监控日志，关注 `middleware` 分流异常或移动端触发的 API 报错
- [ ] 准备回滚方案（特性开关或强制设定 `device` cookie），以备发布后出现严重问题时快速切换

---

## 📊 移动端 V1 完成度总结

### ✅ 已完成（核心功能）

- 移动端布局架构（mobile-app-layout）
- 底部导航栏（首页/分类/购物车/我的）
- 顶部栏（搜索+消息中心）
- 首页完整实现
- 分类页框架（含占位）
- 购物车完整实现（含上拉抽屉）
- 我的页面入口
- Middleware 设备分流
- 代码质量检查通过
- 生产构建成功

### 🚧 V2 待实现

- 认证流程（登录/注册）
- 商品详情页
- 搜索功能
- 结算流程
- 账户中心子页面（15+ 页面）
- CMS 页面
- 新闻页面
- 共享组件移动端优化
- 完整的手动测试与 QA

### 📈 进度估算

- V1 核心功能：**100%** ✅
- 整体移动端完成度：**~35%**
- 预计 V2 需完成：**~20 个页面 + 组件优化**
