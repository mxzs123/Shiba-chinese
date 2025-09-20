# 芝园药局（Shiba Park Pharmacy）设计系统规范

## 1. 代码规范

### 技术栈

- **框架**: Next.js App Router (Server Components 优先)
- **样式方案**: CSS Variables + Tailwind CSS 或 CSS-in-JS
- **类型系统**: TypeScript 严格模式
- **代码质量**: ESLint + Prettier
- **版本管理**: Conventional Commits

### 开发约定

```typescript
// 注释语言：中文

// TypeScript 主题类型定义
export type Theme = {
  color: {
    primary: { 700: string; 600: string; 500: string; 100: string };
    secondary: { 600: string; 500: string; 100: string };
    ink: { 900: string; 700: string; 400: string };
    bg: { base: string; white: string };
    semantic: {
      success: string;
      info: string;
      warning: string;
      danger: string;
    };
  };
  radius: { sm: string; md: string };
  shadow: { card: string; pop: string };
};
```

### CSS Variables 定义

```css
:root {
  /* Brand Colors */
  --color-p-700: #018759; /* 主按钮/重色，WCAG AA 达标 */
  --color-p-600: #029464;
  --color-p-500: #029e68; /* 品牌主色 */
  --color-p-100: #ccebe0;

  --color-s-600: #48c9b2;
  --color-s-500: #5cd2bd;
  --color-s-100: #e6f6f1;

  /* Neutrals */
  --ink-900: #16352d; /* 主文本 */
  --ink-700: #3b5a52; /* 次要文本 */
  --ink-400: #93a6a0; /* 禁用/占位 */
  --bg-base: #fafcfb; /* 品牌调和白 */
  --bg-white: #ffffff;

  /* Semantic */
  --success-500: #2bb673;
  --info-500: #3374cd;
  --warning-500: #f0a020;
  --danger-500: #f2596b;

  /* Effects */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-pop: 0 8px 24px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
}
```

## 2. 设计原则

### 品牌定位

- **核心价值**: 日本连锁药局的中国区电商门店
- **强调**: 正规渠道、药学专业、自然疗愈
- **气质关键词**:
  - Calm（沉静）
  - Trust（可信）
  - Natural（自然）
  - Precise（克制）

### 文案语调

- 专业、克制、不过度营销
- 以"功效与用法"为主
- 避免夸张承诺

### Logo 使用规范

- **构成**: 圆形人形与双叶，象征"关怀与守护的疗愈"
- **安全距离**: 以 LOGO 圆点直径为 1X，四周留白 ≥ 1X
- **最小尺寸**:
  - 仅图形: ≥ 16px (Favicon/Tab)
  - 横向组合: ≥ 120px 宽 (Web 头部)
  - 竖向组合: ≥ 80px 高 (App/小程序)

### 禁止事项

- 拉伸变形
- 添加描边/投影
- 低对比度放置
- 复杂图片叠加
- 改变品牌色相
- 不使用 emoji 表情
- 仅按钮组件使用悬停效果

## 3. 开发原则

### 组件化架构

```
UI 原子 → 复合组件 → 模块
```

### 交互规范

- **动效时长**: 不超过 150ms
- **缓动曲线**: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- **特殊规则**: 仅按钮组件允许明显 hover 效果，其余组件 hover 轻量或无

### 栅格系统

- **基础网格**: 8pt (Web & App 一致)
- **间距层级**: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- **圆角规范**:
  - 按钮与输入: 8px
  - 卡片与弹窗: 12px

### 无障碍 (A11y)

- **对比度要求**:
  - WCAG AA 小字对比度 ≥ 4.5
  - 大字 (≥18px 或 14px Bold) ≥ 3.0
- **触控目标**: ≥ 44×44px
- **键盘焦点**: 明显外描边
- **表单**: 必须有 label 与错误提示

## 4. 色彩规范

### 品牌色使用场景

#### Primary 品牌主色（药学绿）

- **P-700 (#018759)**: 主按钮底色，白字对比度达标
- **P-600 (#029464)**: 链接悬停色
- **P-500 (#029e68)**: 品牌标识，重点标签，图表主线
- **P-100 (#ccebe0)**: 淡底色

#### Secondary 品牌辅色（薄荷绿）

- **S-600 (#48c9b2)**: 辅助图表线
- **S-500 (#5cd2bd)**: 大面积铺底，二级按钮
- **S-100 (#e6f6f1)**: 信息分组背景

#### 品牌渐变

```css
background: linear-gradient(135deg, #029e68 0%, #5cd2bd 100%);
/* 用途: Hero 背景、进度条、品牌分隔条 */
/* 禁止: 用于正文或小文本底色 */
```

### 按钮状态色

```css
/* Primary Button */
.btn-primary {
  background: #018759;
  color: #ffffff;
}
.btn-primary:hover {
  background: #01734d;
  box-shadow: 0 0 0 4px rgba(1, 135, 89, 0.1);
}
.btn-primary:active {
  background: #016845;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}
.btn-primary:disabled {
  background: #b3e1d1;
  color: rgba(255, 255, 255, 0.8);
}

/* Secondary Button */
.btn-secondary {
  border: 1px solid #029e68;
  color: #029464;
  background: #ffffff;
}
.btn-secondary:hover {
  background: #e6f6f1;
}
```

## 5. 字体规范

### 字体栈

```css
/* 中文 */
font-family:
  "Noto Sans SC", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;

/* 日文 */
font-family:
  "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif;

/* 英文 */
font-family:
  Inter,
  system-ui,
  -apple-system,
  sans-serif;
```

### 字重层级

- **标题 (H1/H2/H3)**: font-weight: 700
- **按钮/强调**: font-weight: 500-600
- **正文**: font-weight: 400-500

### 排版参数

- **基准字号**:
  - 移动端: 14px
  - 桌面端: 16px
- **基准行高**: 1.6
- **字间距**:
  - 中文/日文: 默认 0
  - 英文大写标题: 0.02em
- **数字**: 使用等宽数字 `font-variant-numeric: tabular-nums`

### 文本色彩

```css
.text-primary {
  color: #16352d;
} /* 主文本 */
.text-secondary {
  color: #3b5a52;
} /* 次要文本 */
.text-disabled {
  color: #93a6a0;
} /* 禁用/占位 */
.text-brand {
  color: #029464;
} /* 品牌强调 */
.text-error {
  color: #f2596b;
} /* 错误提示 */
```
