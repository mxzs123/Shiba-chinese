# 设计规范（Design System）

面向本仓库的统一 UI 设计规范。该规范与 AGENTS.md 中的工程约束保持一致：

- 技术栈：Next.js App Router + Tailwind v4 + shadcn/ui（new-york，baseColor: neutral）
- 主题与变量：使用 `@theme inline` 与 CSS 自定义属性
- 字体：Inter 作为主字体，`--font-sans` 聚合中英混排

本文定义主题色、圆角弧度、排版、动效、组件尺寸等标准与使用规则，并说明如何在 `app/globals.css` 中落地与演进。

## 1. 设计目标

- 一致：跨页面与组件统一外观与交互反馈
- 可扩展：变量化主题，支持品牌色扩展
- 可实现：紧贴 shadcn/ui 约定与 Tailwind v4 能力，最小改动即可复用
- 可维护：通过文档和 tokens 规范组件实现，减少分歧与重造

## 2. 主题架构与变量来源

- 主题层使用 CSS 变量承载语义色与尺寸，Tailwind v4 通过 `@theme inline` 映射为原子类：
  - 变量声明：`app/globals.css :root`
  - 原子映射：`@theme inline` 中的 `--color-*`、`--radius-*`
  - shadcn/ui 组件默认消费上述语义变量；新增组件也应优先使用这些语义变量而非硬编码颜色/尺寸。

> 变量总览（与当前实现保持一致，更多见 app/globals.css）：

- 语义色：`--background`、`--foreground`、`--card`、`--popover`、`--primary`、`--secondary`、`--muted`、`--accent`、`--destructive`、`--border`、`--input`、`--ring`
- 扩展色：`--chart-1..5`、`--sidebar-*`
- 半径基准：`--radius`，派生：`--radius-sm`、`--radius-md`、`--radius-lg`、`--radius-xl`

## 3. 颜色系统（Colors）

本项目基础色为中性（neutral），兼顾电商场景的可读性与内容优先。推荐遵循以下语义分层：

- 基础（Background & Surface）

  - `--background`：页面背景
  - `--card` / `--popover`：容器/浮层背景
  - `--border` / `--input`：边框与输入描边

- 文本（Foreground）

  - `--foreground`：正文与主要文本
  - `--muted-foreground`：次级/弱化文本

- 交互（Actions）

  - `--primary` / `--primary-foreground`：主操作、强调态
  - `--secondary` / `--secondary-foreground`：次操作、弱强调
  - `--accent` / `--accent-foreground`：营销/吸引注意的点状强调（例如徽标、新品标签）
  - `--ring`：可访问性焦点环颜色

- 状态（States）

  - `--destructive`：危险/删除/错误
  - 成功/警告如有需要，优先通过组件语义类（如 `text-green-600`）或新增 `--success`、`--warning` 语义变量统一。

- 数据可视（DataViz）
  - `--chart-1..5`：图表序列色；如需更多序列，按 OKLCH 均匀调节 `l/c/h` 保持对比度。

实现与示例请参考：`app/globals.css: :root`。

### 3.1 品牌色定义

- 主色（Primary）：`#019d68`（rgb(1,157,104)）
  - Tokens：`--primary: #019d68`，`--primary-foreground: #ffffff`
  - 用途：主操作按钮、强调链接、关键状态
- 辅助色（Accent）：`#019d68`（与主色一致）
  - Tokens：`--accent: #019d68`，`--accent-foreground: #ffffff`
  - 用途：徽章、营销标识、少量点状强调
- 交互亮度建议：
  - hover：在当前主题基础上整体降低亮度约 0.03–0.06
  - active：在 hover 基础上再降低约 0.02
  - 保持 `--ring` 与 `--primary` 的对比度达到 WCAG AA

## 4. 圆角与形状（Radius）

- 基准：`--radius: 10px`（当前配置为 `0.625rem`），派生：
  - `--radius-sm = --radius - 4px`：徽章、Tag、紧凑控件
  - `--radius-md = --radius - 2px`：输入框、按钮、开关
  - `--radius-lg = --radius`：卡片、列表单元
  - `--radius-xl = --radius + 4px`：模态、抽屉、大型容器
- 组件建议：
  - 表单类（Input/Select/Textarea）：`rounded-md`
  - 按钮：默认 `rounded-md`，圆形按钮使用 `rounded-full`
  - 卡片/弹层：卡片 `rounded-lg`；模态/抽屉 `rounded-xl`（或顶部/底部定向圆角）

## 5. 阴影与分层（Elevation）

- 分层阶梯（可映射到 Tailwind）：
  - Base：无阴影
  - Level 1（交互容器）：`shadow-sm`（或自定义 `--shadow-1`）
  - Level 2（浮层/Popover）：`shadow-md`
  - Level 3（模态/对话框）：`shadow-lg` + `ring-1 ring-border/50`
- 避免在可滚动大容器使用高阶阴影；优先通过 `border` 与背景对比制造层次。

## 6. 字体与排版（Typography）

- 字体：全局 `font-family: var(--font-sans)`，勿直接覆盖为具体字体；必要时在组件内扩展变量。
- 层级：
  - H1：`text-3xl/none font-semibold`
  - H2：`text-2xl/none font-semibold`
  - H3：`text-xl/none font-semibold`
  - Body: `text-base leading-7`
  - Small: `text-sm leading-6 text-muted-foreground`
- 数字/价格：在关键区域可使用 `tabular-nums` 保持对齐。
- 行高：中文正文建议 `1.6–1.75`，标题更紧凑 `1.2–1.35`。

## 7. 间距与尺寸（Spacing & Sizing）

- 控件高度（与 shadcn/ui 对齐）：
  - XS: `h-8 px-3`（密集场景）
  - SM: `h-9 px-3.5`（默认表单）
  - MD: `h-10 px-4`
  - LG: `h-11 px-5`（重要主按钮）
- 区块内边距：卡片 `p-4`，弹层 `p-4 md:p-6`
- 栅格与间距：内容区 `gap-4/6/8`，同级兄弟元素优先使用统一 `gap-*` 控制间距

## 8. 图标与插图（Icons & Imagery）

- 图标库：`lucide-react`，务必通过 `components/icons/` 二次封装命名
- 尺寸：常用 `16/18/20/24`；默认 `20`，工具条 `18`，按钮内 `16`
- 线宽：与库默认保持一致；颜色使用 `currentColor`

## 9. 交互动效（Motion）

- 基础时间函数：
  - 入场：`duration-200 ease-out`
  - 退场：`duration-150 ease-in`
  - 重要转场/抽屉：`duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]`
- Framer Motion：将变体集中在 hooks 或驱动组件内复用，避免分散硬编码。
- 微交互：悬浮上移 `translate-y-[-1px]`、阴影增强一阶；避免大幅缩放。

## 10. 组件规范速查（与 shadcn/ui 对齐）

- Button
  - 语义色：`variant=default` 使用 `--primary`；`secondary` 使用 `--secondary`；`destructive` 使用 `--destructive`
  - 尺寸：默认 `h-9 px-3.5`；圆角 `rounded-md`
  - 焦点：`ring-2 ring-ring ring-offset-2`
- Input/Select/Textarea
  - 边框：`border-input`；圆角 `rounded-md`；禁用使用 `opacity-50` 与 `cursor-not-allowed`
- Card/Sheet/Popover
  - 背景：`bg-card`/`bg-popover`；文本 `text-card-foreground`/`text-popover-foreground`
  - 阴影：Level 1/2/3 视层级选择
- Badge
  - 默认 `rounded-sm`；语义色使用 `--accent` 或灰阶 muted

## 11. 可访问性（A11y）

- 焦点可见：始终保留 `focus-visible` 的 `ring`（当前默认 `ring-neutral-400` 与 `ring-offset-neutral-50`）
- 对比度：正文与背景建议达标 WCAG AA（对比度 ≥ 4.5:1）
- 触控目标：可点击区域不小于 `40×40` 设备像素（在高密度屏约等于 `h-10`）

## 12. 实施与变更流程

- 修改主题变量：直接在 `app/globals.css` 中维护 `:root`
- 新增组件：
  1. `npx shadcn@latest add <component>` 生成到 `components/ui/`
  2. 仅使用语义变量与尺寸 tokens，不直接写死颜色
- 调整品牌色/主题：提交 PR 时附视觉对比截图；确保 `npm run build` 与 `npm run prettier:check` 通过
- 外链图与远程资源：按 AGENTS.md 说明维护 `next.config.ts` 的 `images.remotePatterns`

## 13. 品牌色落地

已在 `app/globals.css: :root` 中设置：

- `--primary: #019d68; --primary-foreground: #ffffff`
- `--accent: #019d68; --accent-foreground: #ffffff`

—— 以上为规范性文档。若设计更新，请同步调整本文与 `app/globals.css`，并在 PR 中说明影响范围（按钮、输入、卡片等）与手动验证清单（移动端、关键流程）。
