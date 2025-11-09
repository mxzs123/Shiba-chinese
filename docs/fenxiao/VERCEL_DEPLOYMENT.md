# 分销平台 Vercel 部署指南

本文档提供详细的步骤说明，帮助您在 Vercel 上独立部署芝园分销平台。

## 📋 前提条件

- 已在 Vercel 账户中连接 GitHub 仓库 `mxzs123/Shiba-chinese`
- 主商城已部署在 https://shiba-chinese.vercel.app/
- 需要为分销平台创建**独立的 Vercel 项目**

## 🚀 部署步骤

### 步骤 1：创建新项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 在导入页面，选择已连接的 GitHub 仓库：`mxzs123/Shiba-chinese`
   - 如果已部署主商城，Vercel 会显示"Already imported"，点击 **"Import anyway"** 继续

### 步骤 2：配置项目基本信息

在项目配置页面填写：

| 配置项               | 值                                       |
| -------------------- | ---------------------------------------- |
| **Project Name**     | `shiba-distributor`（或您偏好的名称）    |
| **Framework Preset** | Next.js（会自动检测）                    |
| **Root Directory**   | `apps/distributor` ⚠️ **重要：必须设置** |

点击 **"Edit"** 按钮设置 Root Directory：

- 在弹出的目录选择器中，导航到 `apps/distributor`
- 或者直接输入：`apps/distributor`

### 步骤 3：配置构建设置

展开 **"Build and Output Settings"**，确认/修改：

| 配置项               | 值             | 说明                              |
| -------------------- | -------------- | --------------------------------- |
| **Build Command**    | `pnpm build`   | Vercel 会在 Root Directory 中执行 |
| **Output Directory** | `.next`        | Next.js 默认输出目录              |
| **Install Command**  | `pnpm install` | 默认即可                          |

> **注意**：由于设置了 Root Directory，Vercel 会在 `apps/distributor` 目录下执行这些命令，并自动处理 workspace 依赖。

### 步骤 4：配置环境变量

在 **"Environment Variables"** 部分添加以下变量：

#### 必需变量

| 变量名         | 值           | 环境                             | 说明               |
| -------------- | ------------ | -------------------------------- | ------------------ |
| `API_USE_MOCK` | `true`       | Production, Preview, Development | 使用 Mock 数据模式 |
| `NODE_ENV`     | `production` | Production                       | Node 运行环境      |

#### 可选变量

| 变量名                     | 示例值                     | 环境       | 说明            |
| -------------------------- | -------------------------- | ---------- | --------------- |
| `DISTRIBUTOR_ENVIRONMENT`  | `production`               | Production | 部署环境标识    |
| `SENTRY_DSN`               | `https://...`              | All        | Sentry 错误监控 |
| `DISTRIBUTOR_LOG_ENDPOINT` | `https://logs.example.com` | All        | 日志上报地址    |

**添加方法**：

1. 点击 **"Add More"** 按钮
2. 输入变量名和值
3. 选择应用的环境（Production / Preview / Development）
4. 点击 **"Add"** 保存

### 步骤 5：部署

1. 确认所有配置无误后，点击 **"Deploy"**
2. Vercel 开始构建和部署（通常需要 2-3 分钟）
3. 部署完成后，点击访问链接查看结果

## 🔗 访问分销平台

### 默认 URL

部署成功后，Vercel 会生成默认域名：

- **Production**: `https://shiba-distributor.vercel.app/`
- **Preview**: `https://shiba-distributor-<branch>-<team>.vercel.app/`

### 关键路由

| 路由            | 说明                         |
| --------------- | ---------------------------- |
| `/`             | 首页（未登录会跳转到登录页） |
| `/login`        | 登录页                       |
| `/sales`        | 销售工作台（需销售角色）     |
| `/distributor`  | 分销商工作台（需分销商角色） |
| `/unauthorized` | 403 无权限页面               |

## 🧪 测试登录

使用以下测试账号验证部署：

| 角色     | 邮箱                   | 密码 | 跳转页面       |
| -------- | ---------------------- | ---- | -------------- |
| 销售人员 | `sales@test.com`       | 任意 | `/sales`       |
| 分销商   | `distributor@test.com` | 任意 | `/distributor` |

> **原理**：Mock 模式下，邮箱包含 "distributor" 字样判定为分销商，否则为销售人员。

## 🌐 配置自定义域名（可选）

### 添加域名

1. 进入项目的 **Settings** → **Domains**
2. 点击 **"Add"** 输入域名，例如：
   - `distributor.yourdomain.com`（推荐）
   - `fenxiao.yourdomain.com`
3. 按照 Vercel 提示在 DNS 提供商处添加记录：
   - **A 记录**：指向 Vercel IP
   - **CNAME 记录**：指向 `cname.vercel-dns.com`

### SSL 证书

Vercel 会自动为自定义域名申请和配置 SSL 证书（Let's Encrypt），通常几分钟内生效。

## 🔄 持续部署

### 自动部署

配置完成后，每次向 GitHub 推送代码时：

- **main 分支** → 自动部署到 Production
- **其他分支** → 自动创建 Preview 部署

### 手动触发

在 Vercel Dashboard 中：

1. 进入项目的 **Deployments** 页面
2. 点击最新部署右侧的 **"⋯"** 菜单
3. 选择 **"Redeploy"**

### 触发条件筛选（可选）

如果不希望每次 push 都触发分销平台部署，可以配置 Ignored Build Step：

1. 进入 **Settings** → **Git**
2. 在 **Ignored Build Step** 输入：
   ```bash
   git diff HEAD^ HEAD --quiet -- apps/distributor packages
   ```
3. 这样只有 `apps/distributor` 或 `packages/` 变更时才会触发构建

## 📊 两个项目的关系

| 项目         | Vercel 项目名     | Root Directory     | 默认 URL                             | 说明                 |
| ------------ | ----------------- | ------------------ | ------------------------------------ | -------------------- |
| **主商城**   | shiba-chinese     | `.` (根目录)       | https://shiba-chinese.vercel.app     | 消费者前台，电商功能 |
| **分销平台** | shiba-distributor | `apps/distributor` | https://shiba-distributor.vercel.app | 销售/分销商后台管理  |

两个项目：

- 共享同一个 GitHub 仓库
- 独立部署、独立域名、独立环境变量
- 互不影响，符合"独立入口"的架构设计

## ⚠️ 常见问题

### Q1: 部署后访问 404

**原因**：Root Directory 未正确设置

**解决**：

1. 进入 **Settings** → **General**
2. 找到 **Root Directory**，点击 **"Edit"**
3. 设置为 `apps/distributor`
4. 保存后重新部署

### Q2: 构建失败，提示找不到依赖

**原因**：monorepo workspace 依赖未正确安装

**解决**：

1. 检查 Root Directory 是否设置为 `apps/distributor`
2. 确认 Install Command 为 `pnpm install`
3. Vercel 会自动处理 workspace 依赖，从仓库根目录安装

### Q3: 登录后返回 Mock 数据，如何连接真实 API？

**原因**：环境变量 `API_USE_MOCK=true`

**解决**：

1. 准备好后端 API 地址
2. 修改环境变量：
   - 删除或设置 `API_USE_MOCK=false`
   - 添加 `DISTRIBUTOR_API_URL=<后端地址>`
3. 在代码中更新 API 调用逻辑（替换 Mock 实现）
4. 重新部署

### Q4: 想在 Preview 环境使用不同的配置

**解决**：

1. 在添加环境变量时，针对不同环境设置不同值
2. 例如：
   - Production: `API_USE_MOCK=false`, `DISTRIBUTOR_API_URL=https://api.prod.com`
   - Preview: `API_USE_MOCK=true`（继续用 Mock）

## 📚 相关资源

- [Vercel Monorepo 官方文档](https://vercel.com/docs/monorepos)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [分销平台 README](../../apps/distributor/README.md)
- [技术方案文档](./分销平台技术方案.md)

## 🆘 获取帮助

如有部署问题，请：

1. 检查 Vercel Deployment Logs 中的错误信息
2. 参考本文档的常见问题部分
3. 查看 [Vercel Support](https://vercel.com/support)
