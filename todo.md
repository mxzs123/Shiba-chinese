# 移动端外壳 TODO

## 阶段 0 · 现状盘点

### `/d` → `/m` 路由映射

- `/` → `app/d/page.tsx` → 建议：`app/m/page.tsx`
- `/login` → `app/d/(auth)/login/page.tsx` → 建议：`app/m/(auth)/login/page.tsx`
- `/register` → `app/d/(auth)/register/page.tsx` → 建议：`app/m/(auth)/register/page.tsx`
- `/<page>` → `app/d/[page]/page.tsx` → 建议：`app/m/[page]/page.tsx`
- `/about` → `app/d/about/page.tsx` → 建议：`app/m/about/page.tsx`
- `/account` → `app/d/account/page.tsx` → 建议：`app/m/account/page.tsx`
- `/account/profile` → `app/d/account/profile/page.tsx` → 建议：`app/m/account/profile/page.tsx`
- `/account/addresses` → `app/d/account/addresses/page.tsx` → 建议：`app/m/account/addresses/page.tsx`
- `/account/coupons` → `app/d/account/coupons/page.tsx` → 建议：`app/m/account/coupons/page.tsx`
- `/account/membership` → `app/d/account/membership/page.tsx` → 建议：`app/m/account/membership/page.tsx`
- `/account/orders` → `app/d/account/orders/page.tsx` → 建议：`app/m/account/orders/page.tsx`
- `/account/orders/[orderId]` → `app/d/account/orders/[orderId]/page.tsx` → 建议：`app/m/account/orders/[orderId]/page.tsx`
- `/account/surveys` → `app/d/account/surveys/page.tsx` → 建议：`app/m/account/surveys/page.tsx`
- `/account/surveys/[assignmentId]` → `app/d/account/surveys/[assignmentId]/page.tsx` → 建议：`app/m/account/surveys/[assignmentId]/page.tsx`
- `/cart` → `app/d/cart/page.tsx` → 建议：`app/m/cart/page.tsx`
- `/checkout` → `app/d/checkout/page.tsx` → 建议：`app/m/checkout/page.tsx`
- `/checkout/success` → `app/d/checkout/success/page.tsx` → 建议：`app/m/checkout/success/page.tsx`
- `/checkout/failed` → `app/d/checkout/failed/page.tsx` → 建议：`app/m/checkout/failed/page.tsx`
- `/checkout/prescription-review` → `app/d/checkout/prescription-review/page.tsx` → 建议：`app/m/checkout/prescription-review/page.tsx`
- `/faq` → `app/d/faq/page.tsx` → 建议：`app/m/faq/page.tsx`
- `/news` → `app/d/news/page.tsx` → 建议：`app/m/news/page.tsx`
- `/news/[slug]` → `app/d/news/[slug]/page.tsx` → 建议：`app/m/news/[slug]/page.tsx`
- `/product/[handle]` → `app/d/product/[handle]/page.tsx` → 建议：`app/m/product/[handle]/page.tsx`
- `/search` → `app/d/search/page.tsx` → 建议：`app/m/search/page.tsx`
- `/search/[collection]` → `app/d/search/[collection]/page.tsx` → 建议：`app/m/search/[collection]/page.tsx`

- [ ] 生成当前 `/d` 路由清单（例如 `find app/d -name 'page.tsx'`），与团队确认 `/m` 的一一对应目标。
- [ ] 审阅 `_shared/layouts/desktop-app-layout.tsx`，标记必须在移动外壳复用的 provider 与 hook。
- [ ] 整理 `components/layout`、`components/cart` 中已有的移动端变体（如 `navbar/mobile-menu.tsx`），并列出缺失的实现。
- [ ] 收集移动端特有的交互诉求（导航层级、底部标签、购物车入口等），记录 `_shared` 数据契约是否需要补充。

## 阶段 1 · `app/m` 脚手架

- [ ] 新建 `app/m/layout.tsx`，复用桌面外壳的调用方式但切换为 `MobileAppLayout`。
- [ ] 在 `app/_shared/layouts/mobile-app-layout.tsx` 中实现移动外壳，接入共享 provider（`CartProvider`、`Toaster`、处方提醒）并先放置临时导航框架。
- [ ] 在 `app/m/page.tsx` 引用 `_shared/pages/home` 作为冒烟测试，确认布局可渲染且无运行时错误。
- [ ] 更新 `app/_shared/layouts/index.ts` 暴露新的移动外壳导出，与桌面保持一致的调用习惯。

## 阶段 2 · 导航与框架

- [ ] 设计移动端头部与导航（顶栏、汉堡菜单、搜索入口、消息中心入口），在可能的情况下复用 `components/layout/navbar` 的现有组件。
- [ ] 实现常驻的移动端购物车入口（悬浮按钮或底部栏），串联 `CartSheet`。
- [ ] 构建底部四项导航栏（首页/分类/购物车/我的），并确保在展示处方合规提示时导航与页脚能优雅降级。
- [ ] 检查移动端导航与购物车浮层的焦点状态、滚动锁定与关闭交互。

## 阶段 3 · 路由对齐
- [ ] 底部导航四个 Tab（首页、分类、购物车、我的）分别指向 `/`、`/categories`（或既有分类路由）、`/cart`、`/account`，并在移动端壳层内配置高亮逻辑。

- [ ] 为每个 `/d` 路由（`page.tsx`、动态段、嵌套路由）在 `app/m/` 下创建对应文件，直接引用 `_shared` 页面模块。
- [ ] 特别关注 `(auth)` 与 `[page]` 等嵌套结构，确认共享参数（如 `ACCOUNT_NAV_ITEMS`）满足移动端需求。
- [ ] 仅在桌面已有差异的场景补充移动端特有的 loading/error 状态，其他逻辑继续在 `_shared` 维护。
- [ ] 对需要后续动画或手势优化的移动包装组件添加 TODO 备注，方便迭代。

### 移动端页面布局规范
- 首页：顶部包含搜索栏与消息中心入口；依次展示轮播图（与桌面端保持相同比例）、分类快捷入口、活动速递广播、热门药品推荐、移动优化的品质承诺、移动优化的客服时间、底栏基础信息。
- 分类：顶部保留搜索栏与消息中心；左侧呈现医药品/OTC 等一级分类的垂直列表，右侧列表展示当前分类下所有商品。
- 购物车：维持桌面端的商品管理与批量操作；结算按钮旁仅显示总金额，详细费用改为上拉抽屉展示。
- 我的：新增四象限功能入口（个人信息、收货地址、优惠券、我的审核、会员权益、订单管理），每项跳转到对应的新页面。

## 阶段 4 · 共享组件适配

- [ ] 审核 `_shared` 组件是否存在固定列数、大间距等宽度假设，并通过新增 props 支持双外壳安全切换。
- [ ] 为 `ProductCard`、`SkuSelector` 等组件扩展移动友好配置，同时保持桌面端兼容。
- [ ] 验证认证、地址、结算等表单在小屏上的可访问性（键盘避让、输入分组、按钮尺寸）。
- [ ] 如需新增移动端间距或字号变量，更新 Tailwind token 或 CSS 变量，并在 `docs/` 记录。

## 阶段 5 · 中间件与分流

- [ ] 在关键 `/m` 路由可用后，更新 `middleware.ts` 移除临时桌面回退逻辑，真正将移动 UA 重写到 `/m`。
- [ ] 为 `resolveDevice` 增加覆盖 query、cookie、UA 多分支的回归测试（单测或集成测试）。
- [ ] 对比移动端上线前后的首屏指标（TTFB、水合告警），确认无明显回退。

## 阶段 6 · QA 与加固

- [ ] 运行 `npm run lint` 与 `npm run prettier:check`，保持基础质量阈值。
- [ ] 在移动宽度下手动走查：主页 → 商品 → 购物车 → 结算、账号页签、问卷、优惠券兑换、处方提示等全流程。
- [ ] 验证 `next/link` 预取、浏览器前进后退与 `x-device` 响应头在设备切换时表现正常。
- [ ] 整理已知问题或暂缓打磨项，在正式发布前创建后续跟进任务。

## 阶段 7 · 上线准备

- [ ] 更新 README 与相关文档，加入移动外壳的使用说明与界面截图。
- [ ] 与设计/QA 对齐验收标准，记录设备矩阵（iOS/Android、Safari/Chrome 等）。
- [ ] 上线后监控日志，关注 `middleware` 分流异常或移动端触发的 API 报错。
- [ ] 准备回滚方案（特性开关或强制设定 `device` cookie），以备发布后出现严重问题时快速切换。
