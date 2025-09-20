# Repository Guidelines

## 项目结构与模块组织

本仓库基于 Next.js App Router。页面与路由集中在 `app/`，其中 `/product`、`/search`、`/[page]` 等目录映射核心业务流；`app/api/revalidate` 提供后端通知后的增量刷新入口。UI 组件位于 `components/`，按功能域拆分到 `cart/`、`layout/`、`product/` 等子目录，方便逐层替换，公共布局相关的图片与 SVG 可集中在 `components/icons/` 便于复用。数据访问封装在 `lib/api/`：`index.ts` 负责第三方后端交互或模拟数据拼装，`mock-data.ts` 保存演示商品、集合与页面内容，`types.ts` 统一接口契约，同时导出辅助查找函数。字体资源放在 `fonts/`，公共文档记录在 `docs/`，若需放置静态宣传图可新建 `public/assets/` 并在组件中引用。

## shadcn/ui 集成

已通过 `npx shadcn@latest init` 初始化 UI 模板，配置文件位于 `components.json`，主题为 `new-york` 且基础色选择 `neutral`。Tailwind v4 已自动注入 `@theme inline` 变量以及 `@custom-variant dark`，新增依赖包括 `class-variance-authority`、`lucide-react`、`tailwind-merge` 与 `tw-animate-css`。如需新增组件，使用 `npx shadcn@latest add <component>`，CLI 会同步生成到 `components/ui/` 并复用 `@/lib/utils` 内的 `cn` 方法；如需调整主题变量，可直接在 `app/globals.css` 中修改。

## 动画、图标与状态管理

图标体系统一使用 `lucide-react`，新增图标时优先通过 `components/icons/` 封装再分发，保持语义化命名。交互动效采用 Framer Motion，请以驱动组件或 hooks 的方式集中声明动画变体，便于横向复用与调优。全局及局部状态管理基于 Zustand，可在 `hooks/` 下维护 store 定义，并结合 selector 减少无关重渲染，持久化需求可搭配 `zustand/middleware`。

## 字体策略

默认字体切换为 Inter，并在 `app/layout.tsx` 暴露 `--font-inter` 变量；`app/globals.css` 内的 `--font-sans` 将 Inter 与系统中文字体（`PingFang SC`、`Microsoft YaHei`、`Noto Sans SC` 等）组合，确保中英混排一致性。新增组件请避免手动覆盖 `font-family`，如需定制请基于 `--font-sans` 或 `--font-inter` 扩展。

## 构建、测试与开发命令

本项目使用 npm 脚本统一工具链：`npm run dev` 启动 Turbopack 开发服务器（默认 http://localhost:3000），热更新依赖 RSC 与 Server Actions；`npm run build` 生成生产构建，需在提交与发版前运行，捕获类型或打包错误；`npm run start` 以生产模式预览构建结果，适合联调阶段的终端验收，并可复现实际缓存策略；`npm run lint` 调用 Next.js 提供的 ESLint 集成；`npm run prettier:check` / `npm run prettier` 负责格式校验与自动修复，确保提交记录保持整洁一致。

## 代码风格与命名规范

全部使用 TypeScript 函数组件，两空格缩进。导入顺序推荐：第三方包 → `lib/` → 相对路径，命名导出优先。组件文件、导出保持 PascalCase，hooks 用 camelCase，常量使用 SCREAMING_SNAKE_CASE。Tailwind v4 原子类建议按布局 → 间距 → 视觉顺序书写，复用场景可抽提成子组件或工具函数；涉及复杂交互时，为关键容器添加注释说明设计意图。已启用 ESLint（`next/core-web-vitals` + `prettier`），提交前务必运行 `npm run lint` 与 `npm run prettier:check`。

## 测试指引

暂未接入自动化测试，计划落地 Jest + `next/jest` 与 React Testing Library。组件测试文件命名为 `Component.test.tsx` 并与源码邻近；跨模块用例可集中在 `tests/`。Mock `lib/api` 中的请求层即可隔离后端依赖，必要时使用 MSW 或 `fetch` polyfill。当前阶段需结合 `npm run prettier:check`、关键购买流程（搜索 → 商品详情 → 加入购物车）、移动端断点、深浅色主题以及重要文案的多语言展示做手动验证。

## 提交与拉取请求规范

提交信息保持简短祈使句，必要时辅以 `feat:`、`fix:` 等前缀说明范围。PR 必须关联 Issue，UI 变更附截图或录屏，并标记配置/依赖调整。合并前确认 `npm run build` 与 `npm run prettier:check` 均通过，同时列出手动验证步骤以便复核。

## 环境与配置提示

敏感变量写入 `.env.local`：`COMMERCE_API_URL`（第三方后端地址，缺省则使用 mock 数据）、`COMMERCE_CHECKOUT_URL`、`REVALIDATION_SECRET`。新增变量请同步更新 `.env.example` 与文档，并在 PR 描述中提示。静态资源使用远程图时别忘在 `next.config.ts` 中维护 `images.remotePatterns` 白名单，避免构建时报错；若依赖外部 API，还需在部署平台配置同名环境变量。

## 数据与后端协作

默认逻辑通过 `lib/api/index.ts` 读取本地模拟数据并写入服务端 Cookie 维护轻量购物车，Cookie 名称为 `commerce-cart`，可无缝映射到会话或 Redis。接入真实服务时，在对应函数内调用后端 API 并移除或替换 `mock-data.ts`，确保返回值仍满足 `types.ts` 定义；需要分页或排序时，可在函数签名内扩展参数并同步更新前端筛选项。若后端提供 Webhook，可对 `/api/revalidate` 增补通知逻辑，并使用 `REVALIDATION_SECRET` 进行校验，必要时针对产品与集合分别触发 `revalidateTag`。

## 使用 MOCK 数据

仅负责前端占位时，可直接扩展 `mock-data.ts` 中的集合、商品与页面；提交前确保注释清晰，便于后端联调时定位并替换为真实接口，同时在 PR 中说明哪些字段仍为模拟值，避免误判上线数据。若 mock 数据覆盖了重要业务流程，请在测试计划中明确哪些结果来自静态数据，以免 QA 误判。

## 安全与发布提示

勿将 `.env.local`、模拟账号或后端凭证提交到仓库；如需共享测试口令，请通过内部密钥管理平台。上线前在部署环境补齐 `COMMERCE_API_URL` 等变量，并根据第三方后端的安全策略配置允许的域名或 IP 白名单，必要时向运维申请限流策略。若引入埋点或第三方脚本，请在 PR 说明中声明用途与数据去向，方便安全审核并加速合规评估，必要时与合规团队同步评估。

## 单 URL · 双外壳 · Middleware 重写

目标：在保持单一用户 URL 的前提下，提供桌面与移动两套“外壳”（布局/导航/交互），并通过 Middleware 在服务端选择外壳并重写到内部路径（/d 或 /m），实现 SSR 首屏无水合错位。

### 关键原则

- 内部真实渲染路径使用 `app/d` 与 `app/m`（用户不可见），配合 Middleware 的 `rewrite` 将用户请求透明转发至对应外壳。
- 避免使用 `app/(desktop)` 与 `app/(mobile)` 并在其下放置同名路由页面。Next.js 会将其视为不同组下的路径冲突而报错。
- 纯领域/展示组件与工具放在 `app/_shared`，两端复用；外壳差异聚焦在 `(shell)/layout.tsx` 和少量外壳专属组件。
- 为防缓存串包，重写时附带 `x-device` 响应头并设置 `Vary: x-device`；同时由于内部路径不同（/d 与 /m），可获得天然的构建/缓存隔离。
- 首屏一致性：不要在根布局通过客户端条件逻辑（如 `useMediaQuery`）切换两套 DOM。设备分流应在 Middleware 完成，客户端仅做微交互差异，避免水合错位。

### 目录结构（本仓库适配）

单仓（本项目）建议使用下列结构：

```
app/
  d/                        # 桌面外壳（真实渲染路径，用户不可见）
    (shell)/layout.tsx
    product/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    ...
  m/                        # 移动外壳（真实渲染路径，用户不可见）
    (shell)/layout.tsx
    product/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    ...
  _shared/                  # 纯领域/展示组件（两端复用）
    components/
      ProductCard.tsx
      Price.tsx
      Rating.tsx
      SkuSelector.tsx
    lib/
      format.ts
      currency.ts
  page.tsx                  # （可选）兜底或静态说明
middleware.ts               # UA→x-device 判定 + 重写
```

如未来迁移至 Monorepo，可演进为：

```
apps/web/
  app/
    d/ ...
    m/ ...
    _shared/ ...
    page.tsx
  middleware.ts
packages/
  ui/    # 设计系统 & 基础组件（tailwind v4 + shadcn/ui）
  api/   # OpenAPI 生成 TS SDK（后端交付后生成）
```

### Middleware 示例（UA 判定 + 重写）

> 注意：以下为设计草案，落地时请根据路由实际情况调整忽略列表与匹配规则。

```ts
// middleware.ts
import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 忽略静态资源与常见文件
  const IGNORE = [/^\/_next\//, /^\/favicon\.ico$/, /^\/robots\.txt$/, /^\/sitemap\.xml$/];
  if (IGNORE.some((re) => re.test(url.pathname))) return NextResponse.next();

  // 允许 query/cookie 覆盖，便于本地调试
  const qp = url.searchParams.get("device") as "d" | "m" | null;
  const cookieOverride = req.cookies.get("device")?.value as "d" | "m" | undefined;

  const ua = userAgent(req);
  const isMobile = ua.device.type === "mobile" || ua.device.type === "tablet";
  const device: "d" | "m" = qp ?? cookieOverride ?? (isMobile ? "m" : "d");

  // 重写到内部路径：/d 或 /m，用户地址栏保持不变
  const target = `/${device}${url.pathname === "/" ? "" : url.pathname}`;
  url.pathname = target;

  const res = NextResponse.rewrite(url);
  // 设置调试/缓存友好头
  res.headers.set("x-device", device);
  res.headers.set("Vary", "x-device");
  // 可选：将 query 覆盖写入 cookie，便于刷新/跳转后保留
  if (qp === "d" || qp === "m") {
    res.cookies.set("device", qp, { path: "/", maxAge: 60 * 60 * 24 * 7 });
  }
  return res;
}

// 限定匹配范围，避免作用于静态资源
export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
};
```

### 路由与实现约束

- 不要在 `app/(desktop)` 与 `app/(mobile)` 下同时放置与用户 URL 同名的 `page.tsx`。这属于 Next.js 的“不同组下的路径冲突（path conflict across groups）”。
- `app/d` 与 `app/m` 必须保证路由形状一致（例如都存在 `product/[slug]/page.tsx`），以简化重写逻辑与链接复用。
- 业务组件尽量放入 `app/_shared`，外壳差异留在 `(shell)/layout.tsx` 或小范围装饰组件，以减少重复。
- 链接/跳转（如 `next/link`）仍指向用户 URL（不含 `/d`、`/m`）。内部导航由 Middleware 再次重写，无需曝光内部路径。

### SSR 首屏与水合一致性建议

- 设备分流只在 Middleware 进行，根布局避免使用客户端条件渲染切换两套 DOM。
- 客户端响应式仅在叶子组件做有限差异，或优先使用 CSS/Tailwind 处理显示差异，避免结构性变化。
- 若必须在客户端读取窗口尺寸，请确保不会改变关键骨架/节点顺序，避免 React Hydration 警告。

### 渐进迁移步骤（本仓库）

1. 新增 `app/_shared`，将领域组件逐步上移至共享目录。
2. 复制现有页面到 `app/d` 与 `app/m`，将页面主体替换为 `_shared` 组合；外壳差异写入各自 `(shell)/layout.tsx`。
3. 添加 `middleware.ts` 并验证 UA 与 cookie 强制覆盖（`?device=m`/`?device=d`）。
4. 自测：桌面/移动 UA 下 SSR 首屏是否无水合告警；导航、预取与缓存是否按预期分流。

### 测试清单

- 桌面 UA 命中 `/d`，移动/平板 UA 命中 `/m`；地址栏保持原始 URL。
- 首屏无水合错位；不出现 React Hydration 警告。
- 返回/前进、`next/link` 预取、RSC 数据缓存正常；无跨设备缓存串包（检查 `x-device` 与 `Vary`）。
- 手动覆盖：`?device=m` 或设置 `device=m` cookie 可稳定切换外壳。
