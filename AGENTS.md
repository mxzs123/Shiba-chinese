# Repository Guidelines

## 项目结构与模块组织
本仓库基于 Next.js App Router。核心界面位于 `src/app`：`layout.tsx` 负责全局框架，`page.tsx` 是默认路由，`globals.css` 引入 Tailwind v4 主题变量。静态资源放在 `public/`，通过 `/logo.svg` 等路径引用。根目录中的 `next.config.ts`、`tsconfig.json`、`eslint.config.mjs` 与 `postcss.config.mjs` 定义构建、类型与样式规则；设计或流程文档请存放在 `docs/`，方便后续成员查阅。

## 构建、测试与开发命令
使用 `npm run dev` 启动 Turbopack 开发服务器（默认 http://localhost:3000）。提交前执行 `npm run build` 生成生产包，`npm run start` 可在本地验证构建产物。质量检查依赖 `npm run lint`，会加载 ESLint 与 Next.js 预设，请保持通过。

## 代码风格与命名规范
全部代码使用 TypeScript 函数组件，遵循两空格缩进。导入顺序建议：Node/第三方包 → 绝对路径 → 相对路径。组件与文件名采用 PascalCase（如 `HeroBanner.tsx`），自定义 Hook 使用 camelCase（如 `useLocaleDate`），常量使用 SCREAMING_SNAKE_CASE。Tailwind 类名按照布局、间距、排版的顺序书写，重复组合可抽取为小型组件以保持可读性。

## 测试指引
当前尚未接入自动化测试，计划采用 Jest 搭配 `next/jest` 预设与 React Testing Library。建议将单元测试命名为 `Component.test.tsx` 并与源码同目录存放，跨模块场景可放在 `src/__tests__/`。对 `next/navigation`、`next/image` 等模块进行 Mock，确保测试可重复。自动化之前，请结合 lint、移动端视图与深浅色模式的手动巡检。

## 提交与拉取请求规范
现有提交信息多为简短祈使句（示例：`Initial commit from Create Next App`），延续此风格即可；若能提升清晰度，可加上 `feat:`、`fix:` 等轻量前缀。创建 PR 时需关联相关 Issue，界面改动提供截图或录屏，并注明配置或依赖的调整。确保 `npm run lint` 已通过，同时列出手动验证步骤，便于审核者复现。

## 环境与配置提示
敏感变量请写入 `.env.local` 并排除在版本控制外。若需公开运行时变量，应在 `next.config.ts` 中声明并同步到 `docs/`，以免部署环境缺失配置。

## 涉及后端实现的事项
一律提 Issue 并标记 CR needed，不要私自扩展范围。

## 使用MOCK数据
只负责前端部分的开发工作，涉及到占位使用的地方全部使用JSON的MOCK数据。