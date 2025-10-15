# 分销平台仪表盘交接说明（2025-10-09）

## 当前迭代范围

- 模块：`apps/distributor` 中销售中心 `/sales` 首页与分销商首页 `/distributor`。
- 目标：重构仪表盘卡片与图表，统一使用 shadcn/ui + charts 体系，并将每日任务清单置顶。
- 数据源：仍基于 `lib/mock/sales-dashboard.ts` 与 `lib/mock/distributor-dashboard.ts`。

## 已完成

- **新建共享模块**：`app/_shared/sales` 与 `app/_shared/distributor`，沉淀任务面板、业绩概览、产品贡献、客户洞察等组件及 view model。
- **页面改造**：
  - `/sales` 现使用共享组件，首屏为任务清单 + 业绩概览，后跟产品与客户洞察。
  - `/distributor` 复用业绩与产品组件，新增统一 KPI 卡片与伙伴概览。
- **图表体系升级**：通过 shadcn MCP 引入 `card/badge/progress/separator/scroll-area/checkbox/tooltip/chart`，所有图表改用 `components/ui/chart.tsx` + `recharts`。
- **依赖与路径**：
  - 根 `package.json` 增加 `recharts`、所需 Radix 依赖。
  - `apps/distributor/tsconfig.json` 更新 `@/*` alias 以支持引用根级别组件。
- **清理遗留实现**：移除 `components/trend-chart.tsx`、`horizontal-bar-list.tsx`、`metric-card.tsx`。
- **质量校验**：本地通过 `npm run lint:distributor`、`npm run prettier:check`、`npm run build:distributor`。

## 待办 / 下一步建议

1. **数据接入**：待真实 API 就绪时，替换 `_shared/sales/data.ts` 与 `_shared/distributor/data.ts` 的 Mock 来源；注意保持 `{ success, data, error }` 协议，必要时扩展 `packages/models`。
2. **样式验收**：与设计确认最新 Figma（蓝色主色）是否需要额外 token/阴影调整；重点关注移动端断点与高密度数据显示。
3. **指标扩展**：若需新增 KPI（如复购率、地区分布），优先在 `_shared/sales` 扩展 view model，再补充对应卡片，避免页面内写计算。
4. **可复用性**：当前组件依赖 `recharts`，若后续要抽离到 `packages/ui`，需要补充无 Mock 的 Story/usage 文档。
5. **QA 建议**：上线前至少手动走查 `/sales` 与 `/distributor` 在桌面与 1440/1280/1024 布局，确保滚动区域与 Tooltip 正常。

## 路径速览

- 共享数据/组件入口：`apps/distributor/app/_shared/sales/index.ts`、`apps/distributor/app/_shared/distributor/index.ts`
- 页面壳层：
  - 销售中心：`apps/distributor/app/(sales)/sales/page.tsx`
  - 分销商首页：`apps/distributor/app/(distributor)/distributor/page.tsx`
- Mock 数据：`apps/distributor/lib/mock/{sales,distributor}-dashboard.ts`

## 本地验证命令

```bash
npm install           # 根目录安装依赖
npm run dev:distributor
npm run lint:distributor
npm run prettier:check
npm run build:distributor
```

> 备注：`todo.md` 与 `docs/fenxiao/todo.md` 保持原状；如继续拆分任务，请同步更新文档并在 PR 描述中附带运行的校验命令。
