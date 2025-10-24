/**
 * 分销平台图表主题配置
 * 纯色扁平化设计系统（无渐变）
 */

export const CHART_COLORS = {
  // 主题色（单一数据系列）
  primary: {
    DEFAULT: "#3b82f6",
    dark: "#2563eb",
    light: "#60a5fa",
  },

  // 数据色（多维度对比 - 5色循环）
  data: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"] as const,

  // 数据色深色版本（用于 Hover 状态）
  dataHover: ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"] as const,

  // 状态色（语义化）
  status: {
    positive: "#10b981",
    negative: "#ef4444",
    warning: "#f59e0b",
    neutral: "#6b7280",
  },

  // 透明度变体（用于填充和背景）
  alpha: {
    primary8: "rgba(59, 130, 246, 0.08)",
    primary10: "rgba(59, 130, 246, 0.1)",
    primary12: "rgba(59, 130, 246, 0.12)",
    primary15: "rgba(59, 130, 246, 0.15)",
    primary20: "rgba(59, 130, 246, 0.2)",
  },

  // 背景色（层次区分）
  surface: {
    card: "#ffffff",
    elevated: "#f9fafb",
    muted: "#f3f4f6",
  },
} as const;

// 图表配置常量
export const CHART_CONFIG = {
  // 动画配置
  animation: {
    duration: 600,
    easing: "ease-out" as const,
    begin: 0,
  },

  // 区域图配置
  area: {
    strokeWidth: 2.5,
    fillOpacity: 0.12,
    dotRadius: 4,
    activeDotRadius: 6,
  },

  // 柱状图配置
  bar: {
    radius: [6, 6, 0, 0] as [number, number, number, number],
    maxSize: 24,
    activeOpacity: 0.8,
  },

  // 饼图配置
  pie: {
    innerRadius: 64,
    outerRadius: 80,
    activeOuterRadius: 86,
    paddingAngle: 3,
    strokeWidth: 0,
  },

  // 进度条配置
  progress: {
    height: 10,
    colors: {
      primary: {
        track: "#dbeafe",
        bar: "#3b82f6",
      },
      warning: {
        track: "#fef3c7",
        bar: "#f59e0b",
      },
      success: {
        track: "#d1fae5",
        bar: "#10b981",
      },
      neutral: {
        track: "#e5e7eb",
        bar: "#6b7280",
      },
    },
  },

  // 网格配置
  grid: {
    strokeDasharray: "3 3",
    strokeOpacity: 0.3,
    stroke: "#e5e7eb",
  },
} as const;

// 卡片样式变体
export const CARD_STYLES = {
  primary: {
    className: "border-2 border-primary/20 bg-primary/[0.02]",
    labelColor: "text-primary-600",
  },
  warning: {
    className: "border-2 border-amber-500/20 bg-amber-50",
    labelColor: "text-amber-700",
  },
  success: {
    className: "border-2 border-emerald-500/20 bg-emerald-50",
    labelColor: "text-emerald-700",
  },
  neutral: {
    className: "border border-neutral-200 bg-white",
    labelColor: "text-neutral-500",
  },
} as const;

// Tooltip 默认样式
export const TOOLTIP_STYLE = {
  className:
    "bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2",
  labelClassName: "text-sm font-semibold text-neutral-900",
  contentClassName: "text-sm text-neutral-600",
} as const;
