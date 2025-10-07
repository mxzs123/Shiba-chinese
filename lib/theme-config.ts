/**
 * 主题配置常量
 * 统一管理设计 tokens，避免魔法数字
 */

export const THEME_CONFIG = {
  // 安全区域偏移
  safeArea: {
    topOffset: "64px",
    bottomOffset: "16px",
  },

  // Toast 配置
  toast: {
    offset: "calc(env(safe-area-inset-top) + 64px)",
    defaultDuration: 4500,
  },

  // 按钮高度（触屏优化）
  button: {
    mobile: {
      minHeight: "44px", // iOS 推荐最小触摸目标
      padding: "12px 24px",
    },
    desktop: {
      minHeight: "40px",
      padding: "10px 20px",
    },
  },

  // 断点
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // 动画时长
  animation: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Z-index 层级
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;
