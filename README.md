# Next.js Commerce（Shiba Edition）

本项目基于 Next.js App Router，提供电商前端所需的商品浏览、搜索、购物车、营销页等模块。默认通过 `lib/api` 与第三方后端交互；当未配置远端接口时，系统会回退到 `lib/api/mock-data.ts` 中的模拟数据，便于本地开发与组件调试。

## 主要特性

- **现代前端栈**：React Server Components、Server Actions、`useOptimistic` 等能力开箱即用。
- **可替换数据层**：`lib/api` 封装商品、集合、页面与购物车操作，可按需接入内部 API。
- **Tailwind v4 + Geist 字体**：统一视觉风格，快速迭代 UI。
- **响应式体验**：内置首页网格、轮播、搜索筛选与移动端导航。

## 开始使用

1. 安装依赖：
   ```bash
   npm install
   ```
2. 复制 `.env.example` 为 `.env.local` 并填写：
   - `COMMERCE_API_URL`：内部商品服务地址（未配置时使用模拟数据）。
   - `COMMERCE_CHECKOUT_URL`：下单跳转地址。
   - `REVALIDATION_SECRET`：用于触发 `/api/revalidate` 的安全令牌。
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
4. 打开 [http://localhost:3000](http://localhost:3000) 查看页面。

## 数据对接

- 所有数据访问方法位于 `lib/api/index.ts`，类型定义见 `lib/api/types.ts`。
- 若需要改用真实后端，可在这些函数中调用内部网关或 GraphQL，并移除 `mock-data` 中的演示内容。
- 购物车实现基于服务端 Cookie 存储，方便与现有会话体系对接，可在 `addToCart`、`updateCart` 等方法内替换为实际 API。

## 常用脚本

- `npm run dev`：启动 Turbopack 开发模式。
- `npm run build`：构建生产包。
- `npm run start`：预览生产构建。
- `npm run lint`：运行 ESLint（Next.js 集成）。
- `npm run prettier` / `npm run prettier:check`：格式化与校验代码风格。

## 目录速览

- `app/`：页面、路由与 Server Component。
- `components/`：复用 UI 组件与业务模块。
- `lib/api/`：第三方后端对接与模拟数据。
- `docs/`：额外的设计与流程文档。

欢迎根据自身后端协议扩展 `lib/api`，也可继续使用模拟数据完成独立的前端演示。
