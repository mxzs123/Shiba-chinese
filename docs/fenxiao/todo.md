# 分销平台前端开发 TODO

> 仅覆盖前端可交付范围，后端由 .NET 团队负责。按阶段推进，完成前一阶段的基线后再展开下一阶段细化。

## Phase 0 — 启动与上下游对齐

- [x] 收集并确认需求文档、技术方案、设计稿交付节奏（Figma 设计节奏：Week1 登录/框架/仪表盘，Week2 销售页面，Week3 分销模块，Week4 公共能力；每周二/五同步）
- [x] 明确角色矩阵：销售人员、分销商、二级分销商的页面与权限差异（分销商仅可申请新增与启停，审批由后台执行）
- [x] 与后端约定接口定义、Mock 发布计划、联调窗期（后端主导 OpenAPI/排期；我们先提交 P0/P1 接口草案、T+3 天内提供 Mock，周二例会+Week3/Week4 联调）
- [x] 建立协作基线：代码规范、Lint/Prettier、CI、分支策略（保留 main，按 feature/ 开分支；提交前跑 `npm run lint`、`npm run prettier:check`、`npm run build`；CI 后续接入 GitHub Actions）

## Phase 1 — 工程与基础设施

- [x] 创建 `apps/distributor` App Router 工程，配置别名、全局样式、shadcn/ui 主题（新增 monorepo workspaces、独立 package、layout/page/globals.css、构建通过）
- [x] 初始化共享 `packages/ui`、`packages/api-client`、`packages/models`（含类型校验）（建立 workspace 包及基础 Badge 组件、API client 基础 request、session/响应 schema 与 zod 校验）
- [x] 建立状态管理（Zustand store 基础骨架）与国际化结构（新增 @shiba/stores session/UI store、@shiba/i18n locale 配置）
- [x] 搭建 Mock 数据源（Server Action/REST 拦截），确保各模块无后端也可开发（`lib/mock` 提供仪表盘、订单、客户、任务数据并支持 `API_USE_MOCK` 开关）
- [ ] 接入错误上报与监控占位（Sentry/Log pipeline），整理环境变量方案

## Phase 2 — 鉴权与壳层布局

- [ ] 对接登录/注册/重置接口，完成 Token 存储与刷新策略
- [ ] 实现角色守卫、路由分流及 403/404 兜底页面
- [ ] 搭建基础布局（头部、侧边导航、面包屑、全局通知），仅提供浅色主题
- [ ] 封装通用组件：表格、分页、筛选抽屉、仪表盘卡片、趋势图表（Mock 数据）

## Phase 3 — 销售端功能闭环

- [ ] 销售仪表盘：销售额趋势、产品维度、客户统计、每日任务列表
- [ ] 订单列表/详情：字段展示、筛选、状态标签、详情抽屉与商品明细
- [ ] 退款申请：表单验证、附件上传组件（先接入临时存储方案）、提交反馈
- [ ] 顾客管理：客户列表、分组筛选、详情抽屉、跟进计划增删改
- [ ] 任务中心：任务列表、展开详情、完成操作与状态同步

## Phase 4 — 分销商端功能闭环

- [ ] 分销商仪表盘：提成数据、产品销售趋势视图
- [ ] 订单列表：区分一级/二级分销订单展示与筛选
- [ ] 二级分销商管理：搜索、筛选、审批流程占位、启停切换
- [ ] 个人中心复用：订单、账户信息、结算方式管理（组件复用销售端）

## Phase 5 — 公共能力与体验增强

- [ ] Server Action/API hooks：切换 Mock 与真实接口的统一封装
- [ ] 文件上传、富文本展示、图表组件的最终封装与文档示例
- [ ] 权限指令（RBAC）与操作审计埋点前端事件，等待后端接入
- [ ] 通知/待办提醒机制：站内信、任务提醒的 UI/数据协议

## Phase 6 — 联调与交付

- [ ] 与后端联调鉴权、仪表盘、订单、客户、二级分销接口
- [ ] 编写关键路径单测与 Playwright 冒烟用例（登录→仪表盘→订单→退款申请）
- [ ] 跑通 `npm run lint`、`npm run prettier:check`、`npm run build` 并配置 CI
- [ ] 安排 UAT/QA 走查，覆盖角色切换、权限、文件上传、任务提醒
- [ ] 准备部署、监控与回滚方案，确认发布清单与上线检查表

## 附注

- Mock 数据与类型需同步后端更新，避免字段漂移
- 图表默认使用 `recharts`，如后端提供自定义格式需同步适配计划
- 上传方案需预留 OSS/S3 签名策略，当前阶段使用占位存储
- 当前迭代仅交付浅色主题，无需实现暗黑模式
