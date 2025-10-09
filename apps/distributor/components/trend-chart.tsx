"use client";

import type { CSSProperties } from "react";
import { useId } from "react";

interface TrendPoint {
  label: string;
  value: number;
}

interface TrendChartProps {
  data: TrendPoint[];
  height?: number;
  color?: string;
  className?: string;
  latestValueLabel?: string;
}

export function TrendChart({
  data,
  height = 160,
  color = "#2563eb",
  className,
  latestValueLabel,
}: TrendChartProps) {
  const gradientId = useId();

  if (data.length === 0) {
    return (
      <div className={className}>
        <p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          暂无可展示的趋势数据
        </p>
      </div>
    );
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const width = Math.max(1, (data.length - 1) * 60);

  const points = data.map((point, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * width;
    const y = height - ((point.value - min) / range) * height;
    return { ...point, x, y };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  const areaPath = `${pathD} L${width},${height} L0,${height} Z`;

  const latest = points[points.length - 1];
  const valueLabel = latestValueLabel ?? (latest ? latest.value : "--");
  const latestLabel = latest ? latest.label : "--";

  return (
    <div
      className={className}
      style={{ "--chart-color": color } as CSSProperties}
    >
      <div className="mb-3 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-neutral-400">
            本期趋势
          </p>
          <p className="text-lg font-semibold text-neutral-900">{valueLabel}</p>
        </div>
        <span className="rounded-md bg-[var(--chart-color)]/10 px-2 py-1 text-xs font-medium text-[var(--chart-color)]">
          最新：{latestLabel}
        </span>
      </div>
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-40 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {points.map((point) => (
            <circle
              key={point.label}
              cx={point.x}
              cy={point.y}
              r={3.5}
              fill="#fff"
              stroke={color}
              strokeWidth={1.5}
            />
          ))}
        </svg>
        <div className="mt-3 flex w-full justify-between text-xs text-neutral-400">
          {data.map((point) => (
            <span key={point.label}>{point.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
