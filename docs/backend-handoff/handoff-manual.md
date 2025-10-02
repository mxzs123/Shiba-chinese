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

## Design Tokens / 样式变量

### 触屏交互标准

#### 按钮高度

- **最小高度**: `h-11` (44px)
- **标准**: 符合 iOS Human Interface Guidelines 和 Material Design 触屏最小点击区域要求
- **应用**: PrimaryButton、AddToCartButton 等所有主要操作按钮
- **变更记录**: 原 PrimaryButton 使用响应式 `h-9 xl:h-11`，已统一为固定 `h-11` 以保证移动端体验

### 商品卡片样式

#### ProductCard 默认样式

- **容器**: `rounded-xl border shadow-sm`
- **内边距**: `p-4` (16px)
- **间距**: `gap-2.5` (10px)
- **标题**: `text-base` (16px)
- **描述**: `text-sm` (14px)
- **应用场景**: 搜索结果页、商品列表页

#### ProductCard Compact 样式（移动端优化）

- **容器**: `rounded-xl border shadow-sm`
- **内边距**: `p-3` (12px)
- **间距**: `gap-2` (8px)
- **标题**: `text-sm` (14px)
- **描述**: `text-xs` (12px)
- **应用场景**: 首页推荐、移动端商品详情推荐列表
- **开启方式**: `<ProductCard compact={true} />`

**样式对比表**:

| 元素          | 默认样式            | Compact 样式      |
| ------------- | ------------------- | ----------------- |
| 容器 padding  | `p-4` (16px)        | `p-3` (12px)      |
| 容器 gap      | `gap-2.5` (10px)    | `gap-2` (8px)     |
| 标题/描述间距 | `space-y-1.5` (6px) | `space-y-1` (4px) |
| 标题字号      | `text-base` (16px)  | `text-sm` (14px)  |
| 描述字号      | `text-sm` (14px)    | `text-xs` (12px)  |

### SKU 选择器

#### Inline 模式（桌面端）

- **选项按钮**: `rounded-full border px-4 py-1 text-sm`
- **间距**: `gap-2`
- **交互**: 点击直接选中，视觉反馈通过边框和背景色变化
- **应用场景**: 桌面端商品详情页

#### Sheet 模式（移动端）

- **触发器**: `rounded-lg border h-10` (40px 高度，符合触屏标准)
- **抽屉**: `rounded-t-2xl shadow-xl` 从底部滑入
- **选项按钮**: `rounded-lg border px-4 py-3` (更大点击区域，12px 垂直内边距)
- **动画**: 300ms ease-out 缓动曲线
- **应用场景**: 移动端商品详情页
- **开启方式**: `<SkuSelector presentation="sheet" />`

**展示模式对比**:

| 特性         | Inline 模式          | Sheet 模式                    |
| ------------ | -------------------- | ----------------------------- |
| 触发器       | 无需触发器，直接展示 | `rounded-lg border h-10` 按钮 |
| 选项按钮高度 | `py-1` (~26px)       | `py-3` (~44px)                |
| 选项按钮圆角 | `rounded-full`       | `rounded-lg`                  |
| 容器         | 内联在页面中         | 底部抽屉 `rounded-t-2xl`      |
| 动画         | 无                   | 从底部滑入，300ms             |

### 设计原则

1. **触屏优先**: 移动端所有可交互元素最小点击区域为 44x44px
2. **渐进增强**: 桌面端可使用更紧凑的样式（如 Inline 模式），移动端自动切换为更大的点击区域（如 Sheet 模式）
3. **一致性**: 相同功能的组件在不同设备上保持视觉和交互一致性，仅调整尺寸和布局
4. **性能**: 动画统一使用 300ms 标准时长，避免过长或过短造成的体验问题

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
