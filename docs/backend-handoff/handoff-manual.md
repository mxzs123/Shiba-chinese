# 交接说明书

## 目标

帮助后端团队快速还原当前成果、验证主要流程，并理解后续扩展注意事项。

## 打包与交付

1. 更新依赖：`npm ci`。
2. 生成生产构建：`npm run build`。
3. 收集产物：
   - `.next/`（含 Server 与静态文件）。
   - `public/` 静态资源。
   - `package.json`、`package-lock.json`、`next.config.ts`、`middleware.ts`。
4. 可选：使用容器化时，在 CI 中执行 `npm ci --omit=dev && npm run build`，打包成镜像供后端部署环境测试。

## 部署验证步骤

- 运行 `npm run start`，确认 `/`、`/product/[handle]`、`/search`、`/cart`、`/checkout` 正常。
- 使用 `?device=m` 强制移动外壳（当前尚未完成，可观察 Middleware 行为）。
- 检查响应头：`x-device`、`Vary: x-device` 是否存在。
- 监控日志：遇到 500 时查看 `app/_shared` 内 Server Action 是否返回错误。

## 约定与注意事项

- **字体**：默认 Inter + 系统中文字体，通过 CSS 变量 `--font-sans` 控制，不建议在组件内直接覆盖 `font-family`。
- **图标**：统一由 `lucide-react` + `components/icons/` 提供；新增图标需在该目录封装。
- **动画**：使用 Framer Motion，动画配置集中在组件或 `hooks/`；避免直接在页面散落自定义动画逻辑。
- **主题与样式**：Tailwind v4 原子类按「布局 → 间距 → 视觉」排序；新增组件遵循 2 空格缩进、命名规范。
- **数据更新**：
  - 修改 `lib/api/mock-data.ts` 时同步 `types.ts`，并在 `docs/backend-handoff/` 记录字段变化。
  - 若与真实服务联调，保留 mock 作为离线 fallback。

## 与后端沟通重点

- 确认哪些接口计划在下一阶段上线（优先：商品、搜索、购物车、账户）。
- 约定增量发布节奏：接口支持逐个替换，保持 backward compatibility。
- 明确错误码与异常流程（库存不足、优惠券失效、身份审核失败）。
- 针对安全合规模块（实名、处方药）提前沟通审核流程与 SLA。

## 资料索引

- `readme-outline.md`：README 拓展大纲。
- `architecture-reuse.md`：分层架构与复用说明。
- `frontend-backend-guide.md`：接口约定与协作指南。
- `env-and-deployment.md`：环境变量、部署要求。
- `testing-and-validation.md`：测试校验流程。
- `openapi-plan.md`：OpenAPI 草案规划。

## 后续补充建议

- 上线移动外壳 `/m` 后，补充独立的导航/布局说明。
- 接入真实接口后，添加 `docs/backend-handoff/changelog.md` 记录字段与 API 迭代。
- 规划监控与告警（接口失败率、响应时间、订单漏斗），便于后端运维跟进。
