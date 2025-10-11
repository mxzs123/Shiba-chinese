# 芝园分销平台

基于 Next.js 15 的分销管理系统，为销售人员和分销商提供独立工作台。

## 快速开始

### 开发环境

```bash
# 在项目根目录运行
npm install
npm run dev:distributor

# 或者在当前目录运行
npm run dev
```

访问 http://localhost:3000

### 测试账号

系统当前使用 Mock 数据模式，任意邮箱+密码均可登录：

| 角色   | 邮箱示例               | 密码 | 说明                          |
| ------ | ---------------------- | ---- | ----------------------------- |
| 销售   | `sales@test.com`       | 任意 | 邮箱不包含 "distributor" 字样 |
| 分销商 | `distributor@test.com` | 任意 | 邮箱包含 "distributor" 字样   |

登录后会根据角色自动跳转到对应工作台：

- 销售人员 → `/sales`
- 分销商 → `/distributor`

## 功能模块

### 销售工作台 (`/sales`)

- **主页仪表盘**：销售数据分析、客户统计、任务清单
- **订单管理**：订单列表、详情、退款申请
- **客户管理**：客户信息、跟进记录、客户分类
- **任务中心**：任务列表、任务详情、状态更新
- **个人中心**：账户信息、资料设置

### 分销商工作台 (`/distributor`)

- **主页仪表盘**：提成统计、产品销售分析
- **订单管理**：一级/二级分销订单列表与详情
- **合作伙伴**：二级分销商管理、申请审批、状态控制
- **个人中心**：账户信息、资料设置

## Vercel 部署指南

### 创建独立项目

1. 在 [Vercel Dashboard](https://vercel.com/dashboard) 点击 "Add New Project"
2. 选择 GitHub 仓库（如果已连接主商城项目，需要再次导入）
3. 配置项目设置：

```
Project Name: shiba-distributor
Framework Preset: Next.js
Root Directory: apps/distributor
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

4. 添加环境变量：

```
API_USE_MOCK=true
DISTRIBUTOR_ENVIRONMENT=production
NODE_ENV=production
```

5. 点击 "Deploy"

### 部署后访问

- 默认 URL：`https://shiba-distributor.vercel.app/`
- 登录页面：`https://shiba-distributor.vercel.app/login`
- 可以在 Vercel 项目设置中配置自定义域名

### 环境变量说明

| 变量名                     | 必填 | 说明                                      |
| -------------------------- | ---- | ----------------------------------------- |
| `API_USE_MOCK`             | 否   | 是否使用 Mock 数据（默认开发环境为 true） |
| `DISTRIBUTOR_ENVIRONMENT`  | 否   | 部署环境标识                              |
| `SENTRY_DSN`               | 否   | Sentry 错误监控地址                       |
| `DISTRIBUTOR_LOG_ENDPOINT` | 否   | 日志上报端点                              |

## 技术栈

- **框架**: Next.js 15.5.4 (App Router + Turbopack)
- **UI**: React 19, Server Components, Server Actions
- **样式**: Tailwind CSS v4
- **状态**: Zustand
- **类型**: TypeScript 5.9.3
- **代码规范**: ESLint + Prettier

## 项目结构

```
apps/distributor/
├── app/
│   ├── (auth)/           # 认证相关页面
│   │   └── login/        # 登录页
│   ├── (sales)/          # 销售工作台
│   │   └── sales/        # 主页、订单、客户、任务
│   ├── (distributor)/    # 分销商工作台
│   │   └── distributor/  # 主页、订单、合作伙伴
│   ├── lib/              # 业务逻辑
│   │   ├── auth.ts       # 认证逻辑
│   │   └── mock/         # Mock 数据
│   └── unauthorized/     # 403 页面
├── components/           # 共享组件
│   ├── data-table.tsx    # 数据表格
│   ├── trend-chart.tsx   # 趋势图表
│   ├── workspace-shell.tsx # 工作台框架
│   └── ...
└── lib/
    ├── auth.ts           # 认证工具
    └── mock/             # Mock 数据生成器
```

## 开发规范

- 使用 2 空格缩进
- 提交前运行 `npm run lint` 检查代码
- 使用 TypeScript 编写类型安全的代码
- Server Actions 统一返回 `{ success, data, error }` 结构

## 相关文档

- [技术方案](../../docs/fenxiao/分销平台技术方案.md)
- [需求文档](../../docs/fenxiao/xuqiu.md)
- [TODO 列表](../../docs/fenxiao/todo.md)

## 常见问题

### 如何切换 Mock/真实 API？

修改环境变量 `API_USE_MOCK`：

- `true`：使用 Mock 数据（适合开发和演示）
- `false`：连接真实后端 API

### 如何添加新的 Mock 数据？

编辑 `lib/mock/` 目录下的相应文件：

- `customers.ts` - 客户数据
- `orders.ts` - 订单数据
- `partners.ts` - 合作伙伴数据
- `tasks.ts` - 任务数据
- 等等

### 权限控制如何实现？

使用 `lib/auth.ts` 中的守卫函数：

- `ensureSession()` - 确保已登录
- `ensureRole('sales')` - 确保是销售角色
- `ensureRole('distributor')` - 确保是分销商角色

未授权访问会自动重定向到登录页或 403 页面。
