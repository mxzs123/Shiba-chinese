# Vercel 404 最新排查结论

## 背景

- 仓库为 pnpm workspace monorepo：根目录是主商城，`apps/distributor` 为独立的 Next.js 应用（分销后台）。
- Vercel 访问任意分销路由返回 `DEPLOYMENT_NOT_FOUND`，日志显示 `Module not found: Can't resolve 'lucide-react' / 'sonner' / 'zod'` 等错误。

## 根因确认

1. `apps/distributor/package.json` 未声明分销后台真实使用的依赖。根目录开发时依赖被 hoist 到顶层 `node_modules`，Vercel 在子目录构建时单独执行 `pnpm install`，因此缺包导致构建失败，从而展示 404。
2. Vercel 项目尚未绑定最新提交（构建日志仍指向 commit `6806479`），即便代码已修复也不会生效，需重新推送并部署。

## 已完成的代码修复

- `apps/distributor/package.json` 新增依赖：
  - `@shiba/i18n`, `@shiba/models`, `@shiba/monitoring`（版本 `0.0.0`，对应仓库内本地包）
  - 第三方包 `lucide-react@^0.544.0`, `sonner@^2.0.1`
- `pnpm-lock.yaml` 已同步更新，确保锁文件记录上述依赖。
- 本地验证：
  - `pnpm install --filter @shiba/distributor` ✅
  - `pnpm lint --filter @shiba/distributor` ✅

> 说明：由于当前 CLI 环境对 `.git` 目录只读，尚未执行 `git add/commit/push`。需要在开发者本机完成提交。

## 待专家执行事项

1. **提交并推送修复**
   ```bash
   cd /Users/nikuyaki/Desktop/shiba/chinese
   git add apps/distributor/package.json pnpm-lock.yaml
   git commit -m "fix: add distributor dependencies for vercel build"
   git push origin main
   ```
2. **在 Vercel 创建/更新分销后台项目**
   - Dashboard → Add New → Project，选择同一 Git 仓库。
   - 将 Root Directory 设置为 `apps/distributor`，其余命令保持默认（Install: `pnpm install`, Build: `pnpm build`, Output: `.next`）。
   - 补充环境变量（示例：`API_USE_MOCK=true`, `DISTRIBUTOR_ENVIRONMENT=production`）。
   - 部署完成后记录默认域名（示例：`https://shiba-distributor.vercel.app/`），访问 `/login` 验证。

3. **如需自定义域名**，在 Vercel 项目 Settings → Domains 添加即可。

## 额外备注

- 主商城项目仍运行在根目录部署，不受此次变更影响。
- 若后续引入新的 workspace 依赖，记得同时更新 `apps/distributor/package.json`。
