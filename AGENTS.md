# AGENT 交接说明

> 实时进度、任务勾选与优先级以 `todo.md` 为最新来源；本文主要提供架构背景与协作规范。

## 项目速览

- 技术栈：Next.js 15（App Router）+ TypeScript + Tailwind v4 + Zustand + shadcn/ui。
- 架构：单 URL，middleware 按设备分流至 `app/d`（桌面）与 `app/m`（移动），核心业务封装在 `app/_shared` 供双外壳复用。
- 数据：统一走 `lib/api`，默认使用 mock 数据；扩展接口时同步维护 `types.ts`、`mock-data.ts` 与相关 finder。

## 当前交付状态

- 桌面端 (`app/d`)：全量上线，作为参考实现。
- 移动端 (`app/m`)：
  - ✅ 首页、分类、购物车、我的入口。
  - ✅ 账户子页：个人信息、地址、优惠券、会员权益、订单列表与详情、我的审核及问卷详情。
  - ✅ 认证与结算全流程（登录/注册、结算、支付成功/失败、处方审核）、商品详情。
  - 🚧 内容与搜索线待补：CMS 动态页、News 列表/详情、Search 列表/集合页仍缺移动壳；About、FAQ 已完成移动适配。
- 共享层：`app/_shared` 已涵盖账户、结算、优惠券、商品页等逻辑；新增页面需优先在此扩展。
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
5. **质量门槛**：提交前跑 `npm run lint` 与 `npm run prettier:check`；构建需保持绿灯。
6. **路径约束**：移动端页面不要复制桌面逻辑，务必复用 `_shared`；新增账户 Tab 先扩展 `_shared/account/nav-items.ts`。

### 测试命令

- `npm run lint`：ESLint 全量检查。
- `npm run build`：确保生产构建通过。
- `npm run dev`：Turbopack 开发模式（调试前先跑一次以装载缓存）。
- 如需补测试脚本，请在合并前本地跑通相应命令（`npm run test` 等），并在 PR 描述中标注。

## 常用命令

```bash
npm run dev              # 本地开发（Turbopack）
npm run build            # 生产构建
npm run start            # 预览生产构建
npm run lint             # ESLint
npm run prettier         # 自动格式化
npm run prettier:check   # CI 用格式检查
```

## 推荐工作流

1. 先阅读 `todo.md` 获取最新待办与优先级；按模块执行（内容线、搜索线、体验加固等）。
2. 修改或新增页面：
   - 在 `_shared/pages/*` 或对应领域目录补齐逻辑。
   - 在 `app/m/...` 创建壳文件并引用共享组件，必要时传入 `variant="mobile"` 等参数。
3. 数据层改动后更新 `mock-data.ts`、`types.ts`，同步写注释说明。
4. 变更完成后跑 lint / prettier，必要时补充 Playwright/单测（resolveDevice、Search/CMS/News 等）。
5. 回写 `todo.md`，保持交接透明。

## 未竟事项 & 风险提示

- 移动内容线 & 搜索线缺页面；上线前需补齐并验证富文本排版、筛选/抽屉交互。
- `ProductCard`、`SkuSelector` 等共享组件仍偏桌面，需要 `compact`/移动布局支持。
- 分类页商品列表仍为占位；后端真实数据接入前要在 QA 备注清楚。
- 关键 QA：
  - 搜索 → 商品 → 加购 → 购物车 → 结算 → 支付成功/失败 → 订单全链路。
  - 处方药审核（问卷 + 实名）流程。
  - 各主要设备安全区和字号检查（iPhone SE、15 Pro Max、Pixel 7、iPad Mini）。
- 国际化与深色模式暂不需要；保持中文站、浅色主题即可。

## 文档 & 参考

- `todo.md`：任务拆解与近期进展。
- `docs/`：设计说明、字体策略等补充文档。
- `middleware.ts`：设备分流核心逻辑，改动需谨慎并补测试。
- `_shared/` 各领域目录：务必熟悉，避免在外壳重复实现业务。

祝顺利接手，保持 `todo.md` 和 commit 记录清晰即可快速同步上下文。
