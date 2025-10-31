# 移动端开发任务追踪

## 🔄 最近改动

- 2025-10-02：完成移动端共享组件适配（PrimaryButton 触屏高度、ProductCard compact、SkuSelector sheet），新增 design tokens 记录。
- 2025-02：新增移动端账户子页、优惠券状态调整、会员权益返回按钮、问卷交互等；提交 `b6f6349`。
- 2025-02（当前回合）：
  - 清理移动端 TODO，修复 checkout 结果页 `/m` 硬编码路径。
  - 重新编排 `todo.md`，拆解 content/search 任务、QA 计划与发布 checklist。
  - 新增 `/m/about` 与 `/m/faq` 移动壳，提取共享数据源并回写 `todo.md`、`AGENTS.md` 状态。
  - 完成 `/m/news` 列表与详情：加载更多节奏、移动卡片样式、富文本排版与外链样式统一。

## ✅ 已交付里程碑

### 布局与基础设施

- [x] 建立 `app/m/layout.tsx`，接入 `MobileAppLayout` 及共享 Provider（CartProvider、Toaster、处方提示）
- [x] 实装顶部 `MobileHeader`、底部 `MobileBottomNav`，同步导航高亮与购物车徽章
- [x] 调整 middleware 分流逻辑，移动设备直达 `/m/*`，移除桌面兜底
- [x] 通过 `pnpm lint`、`pnpm prettier:check`、`pnpm build` 等质量基线

### 已上线页面

- [x] 首页 `/`（轮播、快捷入口、活动、推荐、品质承诺、客服时间、Footer）
- [x] 分类页 `/categories`（左右联动、占位数据）
- [x] 购物车 `/cart`（批量操作、抽屉式费用明细）
- [x] 我的入口 `/account`
- [x] 账户子页：`/account/profile`、`/account/addresses`、`/account/coupons`、`/account/membership`
- [x] 订单管理：`/account/orders`、`/account/orders/[orderId]`
- [x] 我的审核：`/account/surveys`、`/account/surveys/[assignmentId]`
- [x] 认证流程：`/login`、`/register`
- [x] 结算流程：`/checkout`、`/checkout/success`、`/checkout/failed`、`/checkout/prescription-review`
- [x] 商品详情：`/product/[handle]`

## 🚧 待办拆解

### 1. 内容与资讯线路

- [x] CMS 动态页 `app/m/[page]/page.tsx`
  - [x] 复制桌面端渲染逻辑到移动壳，复用 `_shared/pages/cms`
  - [x] 补充空态与 Loading（骨架/占位）
  - [x] 验证富文本段落在窄屏的排版与样式
- [x] 关于我们 `/about`
  - [x] 引用 `_shared/pages/about`，按移动排版拆分区块
  - [x] 校验资质图片、证书列表在 360px 下的展示
- [x] 常见问题 `/faq`
  - [x] 复用 FAQ 折叠组件，确保手风琴在触摸设备的可点击区域
  - [x] 增加搜索/筛选占位交互（若后端未接入）
- [x] 资讯列表 `/news`
  - [x] 构建列表页，复用 `_shared/pages/news` 数据源
  - [x] 补充分页或“加载更多”逻辑
- [x] 资讯详情 `/news/[slug]`
  - [x] 对接富文本渲染，处理图片、引用块在移动端的间距
  - [x] 跳出链接样式统一（颜色、下划线、可点击区域）

### 2. 搜索与集合

- [ ] 搜索主页 `/search`
  - [ ] （需求确认中）移动端壳暂缓，保持桌面实现即可
  - [ ] 检查搜索输入框、历史记录与结果的交互差异
  - [ ] 补充空态 & 未命中提示
- [ ] 专题集合 `/search/[collection]`
  - [ ] 支持根据 collection slug 预加载 Banner、筛选条件
  - [ ] 与桌面端保持筛选项一致，校验滚动定位

### 3. 体验与组件加固

- [ ] 购物车与导航交互
  - [x] 测试购物车抽屉的焦点锁定、滚动穿透、返回手势
  - [x] 检查通知中心 Popover 在移动端的触达范围
- [ ] 共享组件移动适配
  - [x] 审核 `_shared/components/product/ProductCard` 的栅格与阴影，新增 `compact` 配置
  - [x] 为 `_shared/components/sku-selector` 增加移动布局（全屏弹层/底部抽屉）
  - [x] 验证 `_shared/account` 表单的输入框高度与分组间距
  - [ ] 记录需要的 Tailwind token 或 CSS 变量，若新增需同步 `docs/`
- [ ] 认证/结算表单
  - [ ] 手机键盘遮挡处理（滚动容器、定位）
  - [ ] 二维码或支付提示图的自适应宽度

### 4. 技术债 & 测试

- [ ] 为 `resolveDevice` 编写回归测试（query/cookie/UA 三种分支）
- [ ] Search/CMS/News 等新页面补充基本单测或 Playwright 冒烟脚本
- [ ] 收集移动端性能指标：TTFB、LCP、Hydration warning（对比上线前后）

### 5. QA 测试计划

- [ ] 手动走查主流程：搜索 → 商品详情 → 加购 → 购物车 → 结算 → 支付成功/失败 → 订单列表
- [ ] 账户模块：资料更新、地址 CRUD、默认地址切换、优惠券兑换、问卷提交
- [ ] 处方药流程：结算触发处方提醒 → 处方审核页 → 上传资料/问卷
- [ ] 不同设备下的安全区与字号验证（iPhone SE、iPhone 15 Pro Max、Pixel 7、iPad Mini）

### 6. 文档 & 发布准备

- [ ] 更新 README/设计文档，新增移动端截图与使用说明
- [ ] 与设计、QA 对齐验收标准与设备矩阵
- [ ] 规划上线后监控与报警（middleware 分流、API 报错）
- [ ] 准备回滚方案：通过 `device` cookie 强制桌面壳或 Feature Flag

## 📌 补充备注

- 分类页右侧商品仍为占位数据，待后端接口提供后接入
- 后续若新增账户 Tab，请先扩展 `_shared/account/nav-items.ts`，再补 `/m/account/*`
- 相关命令：`pnpm dev`（Turbopack）、`pnpm build`、`pnpm lint`、`pnpm prettier:check`
