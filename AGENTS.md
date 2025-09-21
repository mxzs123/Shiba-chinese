# Repository Guidelines

## 项目结构与模块组织

本仓库基于 Next.js App Router。页面与路由集中在 `app/`，其中 `/product`、`/search`、`/[page]` 等目录映射核心业务流；`app/api/revalidate` 提供后端通知后的增量刷新入口。UI 组件位于 `components/`，按功能域拆分到 `cart/`、`layout/`、`product/` 等子目录，方便逐层替换，公共布局相关的图片与 SVG 可集中在 `components/icons/` 便于复用。数据访问封装在 `lib/api/`：`index.ts` 负责第三方后端交互或模拟数据拼装，`mock-data.ts` 保存演示商品、集合与页面内容，`types.ts` 统一接口契约，同时导出辅助查找函数。字体资源放在 `fonts/`，公共文档记录在 `docs/`。

## shadcn/ui 集成

新增组件：`npx shadcn@latest add <component>`（生成到 `components/ui/` 并复用 `@/lib/utils` 的 `cn`）。主题变量入口：`app/globals.css`。

## 动画、图标与状态管理

图标体系统一使用 `lucide-react`，新增图标时优先通过 `components/icons/` 封装再分发，保持语义化命名。交互动效采用 Framer Motion，请以驱动组件或 hooks 的方式集中声明动画变体，便于横向复用与调优。全局及局部状态管理基于 Zustand，可在 `hooks/` 下维护 store 定义，并结合 selector 减少无关重渲染，持久化需求可搭配 `zustand/middleware`。

## 字体策略

默认字体切换为 Inter，并在 `app/layout.tsx` 暴露 `--font-inter` 变量；`app/globals.css` 内的 `--font-sans` 将 Inter 与系统中文字体（`PingFang SC`、`Microsoft YaHei`、`Noto Sans SC` 等）组合，确保中英混排一致性。新增组件请避免手动覆盖 `font-family`，如需定制请基于 `--font-sans` 或 `--font-inter` 扩展。

## 代码风格与命名规范

全部使用 TypeScript 函数组件，两空格缩进。导入顺序推荐：第三方包 → `lib/` → 相对路径，命名导出优先。组件文件、导出保持 PascalCase，hooks 用 camelCase，常量使用 SCREAMING_SNAKE_CASE。Tailwind v4 原子类建议按布局 → 间距 → 视觉顺序书写，复用场景可抽提成子组件或工具函数；涉及复杂交互时，为关键容器添加注释说明设计意图。已启用 ESLint（`next/core-web-vitals` + `prettier`），提交前务必运行 `npm run lint` 与 `npm run prettier:check`。

## 测试指引

当前阶段手动验证清单：

- 运行 `npm run prettier:check` 保持格式一致。
- 关键购买流程：搜索 → 商品详情 → 加入购物车。
- 移动端断点与导航交互。
- 深/浅色主题切换与样式一致性。
- 重要文案的多语言展示。

## 环境与配置提示

敏感变量写入 `.env.local`：`COMMERCE_API_URL`（第三方后端地址，缺省则使用 mock 数据）、`COMMERCE_CHECKOUT_URL`、`REVALIDATION_SECRET`。新增变量请同步更新 `.env.example` 与文档，并在 PR 描述中提示。静态资源使用远程图时别忘在 `next.config.ts` 中维护 `images.remotePatterns` 白名单，避免构建时报错；若依赖外部 API，还需在部署平台配置同名环境变量。

## 数据与后端协作

默认逻辑通过 `lib/api/index.ts` 读取本地模拟数据并写入服务端 Cookie 维护轻量购物车，Cookie 名称为 `commerce-cart`，可无缝映射到会话或 Redis。接入真实服务时，在对应函数内调用后端 API 并移除或替换 `mock-data.ts`，确保返回值仍满足 `types.ts` 定义；需要分页或排序时，可在函数签名内扩展参数并同步更新前端筛选项。若后端提供 Webhook，可对 `/api/revalidate` 增补通知逻辑，并使用 `REVALIDATION_SECRET` 进行校验，必要时针对产品与集合分别触发 `revalidateTag`。

## 使用 MOCK 数据

仅负责前端占位时，可直接扩展 `mock-data.ts` 中的集合、商品与页面；提交前确保注释清晰，便于后端联调时定位并替换为真实接口，同时在 PR 中说明哪些字段仍为模拟值，避免误判上线数据。若 mock 数据覆盖了重要业务流程，请在测试计划中明确哪些结果来自静态数据，以免 QA 误判。

## 安全与发布提示

勿将 `.env.local`、模拟账号或后端凭证提交到仓库；如需共享测试口令，请通过内部密钥管理平台。上线前在部署环境补齐 `COMMERCE_API_URL` 等变量，并根据第三方后端的安全策略配置允许的域名或 IP 白名单，必要时向运维申请限流策略。若引入埋点或第三方脚本，请在 PR 说明中声明用途与数据去向，方便安全审核并加速合规评估，必要时与合规团队同步评估。

## 单 URL · 双外壳 · Middleware 重写

目标：在保持单一用户 URL 的前提下，提供桌面与移动两套“外壳”（布局/导航/交互），通过 Middleware 在服务端选择外壳并重写到内部路径（/d 或 /m），实现 SSR 首屏无水合错位。

### 关键原则

- 内部真实渲染路径使用 `app/d` 与 `app/m`（用户不可见），由 Middleware 进行重写。
- 避免在 `app/(desktop)` 与 `app/(mobile)` 下放置同名路由页面，防止“不同组下的路径冲突”。
- 纯领域/展示组件集中于 `app/_shared`，外壳差异聚焦 `(shell)/layout.tsx` 与少量外壳专属组件。
- 重写应附带 `x-device` 并设置 `Vary: x-device`，确保缓存隔离与可观测性。
- 设备分流放在 Middleware，根布局不做两套 DOM 的客户端条件切换，避免水合错位。

> 重要澄清（经官方文档验证）：不要在 `app/(desktop)` / `app/(mobile)` 路由组下维护两套同名页面。路由组不改变真实路径，既无法作为重写锚点，也容易造成同路径缓存/预取串包与水合告警。请使用真实内部子路径 `/d`、`/m` 并通过 Middleware 重写。

### 目录组织

- `app/d`：桌面外壳（真实渲染路径）。
- `app/m`：移动外壳（真实渲染路径）。
- `app/_shared`：复用的领域组件与纯展示逻辑（如 ProductCard、Price、Rating、SkuSelector；以及 format/currency 等工具）。
- `app/page.tsx`：可选兜底或静态说明。
- `middleware.ts`：UA 判定、query/cookie 覆盖与重写；设置 `x-device` 与 `Vary: x-device`。

### Middleware 策略

- 判定：以 UA 为主，支持 query（`?device=d|m`）与 cookie 覆盖以便调试。
- 重写：将用户 URL 映射到内部 `/${device}${pathname}`，地址栏保持不变。
- 忽略：静态资源与通用文件（`/_next/*`、`favicon.ico`、`robots.txt`、`sitemap.xml` 等）。
- 头与缓存：设置 `x-device` 与 `Vary: x-device`，必要时持久化 `device` 覆盖到 cookie。
- 匹配：限定 Middleware 仅作用于应用路由，排除静态资源路径。

#### 实施要点（落地规范）

- Cookie 与头部：
  - 覆盖用 `device` Cookie（取值 `d|m`），不要把 Cookie 命名为 `x-device`。
  - 在请求/响应头使用 `x-device` 标记设备，并设置响应头 `Vary: x-device` 做缓存隔离。
- UA 识别：`userAgent(req)`（`next/server`）读取 `device.type`，将 `mobile`、`tablet` 归为 `m`，其余归为 `d`。
- 头部透传：在 `rewrite` 调用中通过 `request.headers` 透传 `x-device`，使其参与上游（RSC/预取）缓存键。
- 覆盖优先级：`?device` > `device` Cookie > UA 推断；当存在 `?device` 且与 Cookie 不一致时，写回 Cookie。
- 匹配范围：建议排除 `api`、`/_next/static`、`/_next/image`、`favicon.ico`、`robots.txt`、`sitemap.xml` 等路径。

#### `middleware.ts` 示例（精简）

```ts
import { NextRequest, NextResponse, userAgent } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const q = url.searchParams.get("device"); // query 覆盖
  const c = req.cookies.get("device")?.value; // cookie 覆盖
  const { device } = userAgent(req); // UA 推断
  const inferred =
    device.type === "mobile" || device.type === "tablet" ? "m" : "d";
  const dev = (q || c || inferred) === "m" ? "m" : "d";

  // 目标内部路径（地址栏保持原始 URL）
  const dest = url.clone();
  dest.pathname = `/${dev}${url.pathname}`;

  // 将 x-device 透传到上游请求头，参与缓存键
  const headers = new Headers(req.headers);
  headers.set("x-device", dev);

  const res = NextResponse.rewrite(dest, { request: { headers } });
  res.headers.set("x-device", dev);
  res.headers.set("Vary", "x-device");
  if (q && q !== c) res.cookies.set("device", dev, { path: "/" });
  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)",
  ],
};
```

### 路由形状与实现约束

- `app/d` 与 `app/m` 路由形状需一致（如都具备 `product/[slug]/page.tsx`）。
- 业务组件尽量放入 `app/_shared`，减少重复与发散。
- 链接/跳转（`next/link`）始终使用用户 URL（不含 `/d`、`/m`），由 Middleware 负责分流。

#### 开发 Checklist（桌面/移动外壳）

- `app/d` 与 `app/m` 路由树一致，页面主体复用 `app/_shared` 组合。
- 各自 `(shell)/layout.tsx` 承载导航/页眉/页脚等外壳差异；尽量保持骨架 DOM 结构一致，减少水合差异。
- 组件内的 `<Link>` 和编程式跳转统一指向用户 URL，不携带 `/d`、`/m` 前缀。
- 若必须读取窗口尺寸，仅做微交互，不改变关键节点顺序与数量。

### SSR 与水合一致性

- 服务端完成设备分流，客户端仅做微交互差异，不更换关键 DOM 结构。
- 响应式优先使用 CSS/Tailwind；若必须读取窗口尺寸，确保不更改骨架与节点顺序。

### 渐进迁移步骤

- 建立 `app/_shared`，将领域组件抽离到共享目录。
- 在 `app/d` 与 `app/m` 复制现有页面，主体复用 `_shared` 组合，外壳差异放入各自 `(shell)/layout.tsx`。
- 新增 `middleware.ts`，实现 UA 判定、query/cookie 覆盖与重写。
- 联调自测：确认两端 SSR 首屏无水合告警，导航/预取/缓存按设备分流。

### 测试清单

- 桌面 UA 命中 `/d`，移动/平板 UA 命中 `/m`；地址栏不出现内部路径。
- 首屏无水合错位与 Hydration 警告。
- 返回/前进、`next/link` 预取、RSC 缓存正常；无跨设备缓存串包（`x-device` 与 `Vary` 生效）。
- 手动覆盖：通过 `?device=m|d` 或 `device` cookie 可稳定切换外壳。
