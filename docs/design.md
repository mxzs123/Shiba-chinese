「安心感」设计规范 (Anshin-kan Design System)
我们的北极星指标：让每一次点击都像在值得信赖的药师指导下完成。本规范保留品牌语气，同时补足设计 Token、组件尺寸与主题切换的可执行细节。所有规则与 AGENTS.md 的工程约束保持一致：Next.js App Router、Tailwind v4、shadcn/ui（new-york，baseColor: neutral）、Inter 作为主字体，`--font-sans` 聚合中英混排。

## 快速参考

在动笔或编码前，可先对照下列速查表确认核心 token 与组件基线。所有值的权威来源是 `app/globals.css`；Tailwind 原子类通过 `@theme inline` 自动映射 `--color-*` 变量。

### 颜色语义

| 语义       | CSS 变量                                 | Tailwind 变量                            | Light 值                               | 说明                             |
| ---------- | ---------------------------------------- | ---------------------------------------- | -------------------------------------- | -------------------------------- |
| 背景       | `--background`                           | `bg-background`                          | `oklch(1 0 0)`                         | 默认页面背景，维持「間」的留白   |
| 前景       | `--foreground`                           | `text-foreground`                        | `oklch(0.145 0 0)`                     | 主文本颜色，满足 8:1 对比        |
| 卡片       | `--card` / `--card-foreground`           | `bg-card` / `text-card-foreground`       | `oklch(1 0 0)` / `oklch(0.145 0 0)`    | 信息容器与正文组合               |
| Popover    | `--popover` / `--popover-foreground`     | `bg-popover`                             | 同卡片                                 | 用于浮层与 Tooltip               |
| 主要按钮   | `--primary` / `--primary-foreground`     | `bg-primary` / `text-primary-foreground` | `#019d68` / `#ffffff`                  | 签名式主色，SR ratio 4.5+        |
| 次要按钮   | `--secondary` / `--secondary-foreground` | `bg-secondary`                           | `oklch(0.97 0 0)` / `oklch(0.205 0 0)` | 低强调操作，保持 3:1             |
| 提示色     | `--accent` / `--accent-foreground`       | `bg-accent`                              | `#019d68` / `#ffffff`                  | 点状提醒，与主色一致减轻认知负担 |
| 错误       | `--destructive` / `--foreground`         | `bg-destructive`                         | `oklch(0.577 0.245 27.325)`            | 致命错误，必须达 4.5:1           |
| 边框       | `--border`                               | `border-border`                          | `oklch(0.922 0 0)`                     | 规则清晰但不过度强调             |
| 输入框     | `--input`                                | `border-input`                           | `oklch(0.922 0 0)`                     | 输入控件描边                     |
| 焦点环     | `--ring`                                 | `ring-ring`                              | `oklch(0.708 0 0)`                     | 辅助键盘导航                     |
| 侧栏系     | `--sidebar-*`                            | `bg-sidebar` 等                          | `oklch(0.985 0 0)` 等                  | 侧栏独立调色，保持温差感         |
| 数据可视化 | `--chart-1` … `--chart-5`                | `text-chart-1` 等                        | 见 `globals.css`                       | 定量对照的配色参考               |

> 构建设计稿时，请直接标注语义名称（如「Primary / Default」），而非写死颜色值，确保研发能复用 token。

### 圆角与分层

| Token         | Light 值                    | 建议用途             |
| ------------- | --------------------------- | -------------------- |
| `--radius`    | `0.625rem`                  | 卡片、弹窗的基础半径 |
| `--radius-sm` | `calc(var(--radius) - 4px)` | 徽章、标签           |
| `--radius-md` | `calc(var(--radius) - 2px)` | 按钮、输入框         |
| `--radius-lg` | 与 `--radius` 相同          | 卡片壳体             |
| `--radius-xl` | `calc(var(--radius) + 4px)` | 模态框等大型容器     |

| 层级    | 阴影建议    | 典型场景               |
| ------- | ----------- | ---------------------- |
| Base    | 无阴影      | 卡片列表、表格背景     |
| Level 1 | `shadow-sm` | 按钮 hover、可点击控件 |
| Level 2 | `shadow-md` | Popover、浮层          |
| Level 3 | `shadow-lg` | 模态框、关键信息提示   |

### 排版

| 语义       | Tailwind 类              | 字号 / 行高 | 用途               |
| ---------- | ------------------------ | ----------- | ------------------ |
| H1         | `text-3xl font-semibold` | 30px / 1.25 | 页面主标题         |
| H2         | `text-2xl font-semibold` | 24px / 1.3  | 模块标题           |
| H3         | `text-xl font-semibold`  | 20px / 1.35 | 区块标题           |
| Body       | `text-base leading-7`    | 16px / 1.7  | 正文说明           |
| Body Small | `text-sm leading-6`      | 14px / 1.6  | 次要说明、表单描述 |
| Caption    | `text-xs leading-5`      | 12px / 1.5  | 标签、脚注         |

字体统一使用 `font-sans`（Inter + 中文系统字体），除非有特定品牌需求。

### 间距与控件尺寸

| 场景           | 建议值  | Tailwind 类            |
| -------------- | ------- | ---------------------- |
| 主操作按钮高度 | 44px    | `h-11` / `px-6`        |
| 次操作按钮高度 | 40px    | `h-10` / `px-5`        |
| 输入框高度     | 40px    | `h-10` / `px-4`        |
| 表单垂直间距   | 16px    | `space-y-4` 或 `gap-4` |
| 模块外边距     | 32px    | `py-8`、`mt-8`         |
| 卡片内边距     | 24px    | `p-6`                  |
| 列表项间距     | 12~16px | `gap-3` ~ `gap-4`      |

控件最小可点击区域保持 ≥ 40×40px，必要时通过额外的 `px`/`py` 补足。

## 设计支柱与目标

我们继续以三大支柱指导全局设计决策：

1. **医药品级别的正确性（0 容错）**：建立可维护、一致的实现策略。所有颜色、间距、排版均通过 Token 管理，避免临时值。
2. **温泉旅馆般的おもてなし（预判需求）**：设计优先照顾高龄与低熟练用户，无障碍与键盘体验视为默认要求。
3. **神社般的静寂（不打扰，只守护）**：克制视觉噪点，让界面成为内容的宁静容器。

## 主题架构与实现

1. `:root` 内维护语义 Token；新增主题或 Token 时，保持命名在「语义而非表现」层面。
2. `@theme inline` 将 `--color-*` 映射到 Tailwind 原子类，设计稿不需关心具体类名，只需标注语义。
3. 新增组件必须通过 `cn` 与 Tailwind 原子类引用上述变量，避免硬编码颜色/间距。

## 色彩使用细则

- **层级优先**：先选语义层级（背景、表面、交互、状态），再选择对应 Token，杜绝自定义色块。
- **密度控制**：Primary/Accent 同色系，避免页面出现超过 2 种高饱和度颜色。
- **对比度**：正文、按钮文案与背景至少达到 4.5:1，高龄用户常用的说明文字至少 7:1。
- **焦点状态**：`focus-visible` 必须显示 `ring`，Hover/Active 状态用于补充反馈但不改变 DOM 结构。

## 组件尺寸与布局

- **按钮**：使用 shadcn/ui Button 作为基线；Primary 采用 `h-11 px-6 text-base font-semibold`，Secondary 保持 `h-10 px-5` 与 `border-border`。
- **输入控件**：Input、Select、Combobox 统一 `h-10 px-4`，错误状态添加 `data-[invalid=true]:border-destructive`。
- **卡片**：默认 `rounded-lg shadow-sm p-6`，信息密集场景可缩至 `p-4`，但需保持 ≥ 24px 的内部空隙。
- **导航/页眉**：桌面端 `h-16`，移动端 `h-14`，左右留白 `px-6`（桌面）/`px-4`（移动）。
- **列表与表格**：垂直节奏使用 `gap-4`；表格行高维持 ≥ 44px，确保触控友好。

## 图标与动效

- 图标统一封装在 `components/icons/`；默认尺寸 20px，与文字对齐时设置 `className="size-5"`。
- 颜色继承文字，禁用状态降低透明度至 40%。
- 动效以 Framer Motion 实现：
  - 入场使用 `transition={{ type: "spring", damping: 20, stiffness: 180 }}` 或简化 `ease-out`。
  - 退场使用 `ease-in`，时间 ≤ 180ms。
  - 悬浮/聚焦微交互建议使用 `scale` 1.02 以下或轻微阴影，不破坏静寂感。

## 可访问性承诺

- 焦点环不可移除；若视觉冲突，可通过 `ring-offset` 调整层次。
- 表单控件需搭配 `<Label>` 与 `aria-describedby`，错误文本使用 `text-destructive`。
- 所有触发对话框的操作需提供可见提示（icon + 文案），避免仅依赖颜色传达含义。
- 移动端触控元素保持最小 40×40px；复杂交互加上动效反馈以确认操作。

## 实施流程与变更管理

1. 设计或产品提出新需求 → 评估是否已有 Token/组件能覆盖；如需新增 Token，预先在 `globals.css` 定义并更新本规范表格。
2. 设计稿在交付时附带外壳（桌面/移动）对照与交互说明；研发通过 Tailwind 语义类实现。
3. 开发完成后提交 PR：
   - 指明使用或新增的 Token。
   - 附带截图（两套外壳）。
   - 运行 `npm run lint`、`npm run prettier:check` 并在说明中确认通过。
4. 规范变更需记录在 `docs/changelog.md`，简述原因与影响范围。

## Checklists

- [ ] 新组件是否完全使用语义 Token？
- [ ] 桌面/移动外壳是否同步更新？
- [ ] 按钮、输入框是否满足最小尺寸与触控要求？
- [ ] 焦点状态在键盘操作下是否可见？
- [ ] 文案对齐「安心感」语气，无多余视觉噪点？

## 结语

「良いデザインは、気づかぬうちに病みつかれる安心感である。」——好的设计，是在不知不觉间构筑起来的信赖。愿这份更具操作性的规范，帮助我们在每一次像素调整中兑现药师般的陪伴。
