# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
pnpm dev              # 启动 Turbopack 开发模式（默认主应用）
pnpm build            # 生产构建
pnpm lint             # ESLint 全量检查
pnpm prettier         # 自动格式化代码
pnpm prettier:check   # CI 用格式检查

# 分销平台（apps/distributor）
pnpm dev:distributor
pnpm build:distributor
pnpm lint:distributor
```

## 架构概览

这是一个基于 Next.js 15 (App Router) + TypeScript + Tailwind v4 + Zustand 的电商前端项目。

### 设备分流架构

项目采用单 URL、middleware 按设备自动分流的架构：

- `app/d/`：桌面端页面壳
- `app/m/`：移动端页面壳
- `app/_shared/`：核心业务逻辑，供双端复用

**关键规则**：业务逻辑只写在 `_shared`，`app/d` 和 `app/m` 仅做壳层与布局。

### 数据层

- 所有数据访问经 `lib/api/`，类型定义在 `lib/api/types.ts`
- 未配置后端时自动回退到 `lib/api/mock-*.ts` 模拟数据
- 新增字段需同步更新：类型定义 → mock 数据 → 相关 finder

### Monorepo 结构

```
apps/distributor/    # 分销平台独立应用
packages/
  api-client/        # API 客户端
  models/            # 数据模型
  monitoring/        # 监控
  stores/            # Zustand stores
  ui/                # shadcn/ui 组件
```

路径别名：`@/*`、`~/*` 指向根目录，`@shiba/*` 指向对应 package。

## 代码规范

### 链接规范

`next/link` 使用用户感知路径，**不带** `/d` 或 `/m` 前缀（middleware 自动分流）。

### Server Action

必须返回 `{ success, data, error }` 结构，放在 `_shared/*/actions.ts`。

### 样式

Tailwind 原子类按"布局 → 间距 → 视觉"顺序排列。

### 命名

- 组件：PascalCase
- Hook：camelCase
- 常量：SCREAMING_SNAKE_CASE

## 本地调试设备切换

- 移动端：访问 `/?device=m`
- 桌面端：访问 `/?device=d`

## 提交前检查

```bash
pnpm lint
pnpm prettier:check
pnpm build
```
