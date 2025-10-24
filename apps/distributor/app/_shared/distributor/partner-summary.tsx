"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";
import { CHART_COLORS, CHART_CONFIG } from "../../../lib/chart-theme";

import type { PartnerStatusSlice, PartnerSummaryData } from "./data";
import { formatPercent } from "../sales/formatters";

interface PartnerSummaryProps {
  data: PartnerSummaryData;
  className?: string;
}

const STATUS_PROGRESS_CLASS: Record<PartnerStatusSlice["tone"], string> = {
  primary:
    "bg-blue-100 [&_[data-slot=progress-indicator]]:bg-blue-600 [&_[data-slot=progress-indicator]]:shadow-none",
  warning:
    "bg-amber-100 [&_[data-slot=progress-indicator]]:bg-amber-500 [&_[data-slot=progress-indicator]]:shadow-none",
};

function getStatusColor(
  tone: PartnerStatusSlice["tone"],
  index: number,
): string {
  if (tone === "warning") return CHART_COLORS.status.warning;
  return (
    CHART_COLORS.data[index % CHART_COLORS.data.length] ?? CHART_COLORS.data[0]
  );
}

export function PartnerSummary({ data, className }: PartnerSummaryProps) {
  return (
    <Card className={cn("bg-white", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          伙伴概览
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-6">
          {/* 饼图区域 - 居中显示 */}
          <div className="flex justify-center">
            <ChartContainer
              config={data.statusSlices.reduce(
                (config, slice, index) => ({
                  ...config,
                  [slice.id]: {
                    label: slice.label,
                    color: getStatusColor(slice.tone, index),
                  },
                }),
                {},
              )}
              className="mx-auto aspect-square max-h-[240px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                      labelClassName="text-sm font-semibold text-neutral-900"
                      nameKey="id"
                      formatter={(value, _name, item) => {
                        const payload = item?.payload as
                          | PartnerStatusSlice
                          | undefined;
                        if (!payload) {
                          return null;
                        }

                        return (
                          <div className="flex w-full items-center justify-between gap-4">
                            <span className="text-sm text-neutral-600">
                              {payload.label}
                            </span>
                            <span className="font-mono text-sm font-semibold text-neutral-900">
                              {formatPercent(payload.ratio, 1)} ·{" "}
                              {Math.round(Number(value))} 家
                            </span>
                          </div>
                        );
                      }}
                    />
                  }
                />
                <Pie
                  data={data.statusSlices.map((slice) => ({
                    ...slice,
                    value: slice.value,
                  }))}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={CHART_CONFIG.pie.innerRadius}
                  outerRadius={CHART_CONFIG.pie.outerRadius}
                  paddingAngle={CHART_CONFIG.pie.paddingAngle}
                  strokeWidth={CHART_CONFIG.pie.strokeWidth}
                >
                  {data.statusSlices.map((slice, index) => (
                    <Cell
                      key={slice.id}
                      fill={getStatusColor(slice.tone, index)}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <g>
                            <circle
                              cx={viewBox.cx}
                              cy={viewBox.cy}
                              r={56}
                              fill="#ffffff"
                              opacity={0.9}
                            />
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-neutral-900 text-3xl font-bold"
                              >
                                {data.totalManaged}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-neutral-500 text-xs font-medium"
                              >
                                管理总数
                              </tspan>
                            </text>
                          </g>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* 状态卡片 - 网格布局 */}
          <div className="grid gap-3 sm:grid-cols-2">
            {data.statusSlices.map((slice) => (
              <StatusCard key={slice.id} slice={slice} />
            ))}
          </div>

          {/* 底部说明 */}
          <div className="rounded-lg bg-neutral-50 px-4 py-3">
            <p className="text-xs text-neutral-600 leading-relaxed">
              当前共管理 <span className="font-semibold text-neutral-900">{data.totalManaged}</span> 家一级/二级分销伙伴，
              其中 <span className="font-semibold text-primary">{data.activeCount}</span> 家活跃，
              <span className="font-semibold text-amber-600">{data.inactiveCount}</span> 家长期未活跃。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatusCardProps {
  slice: PartnerStatusSlice;
}

function StatusCard({ slice }: StatusCardProps) {
  const isPrimary = slice.tone === "primary";
  const isWarning = slice.tone === "warning";

  const Icon = isPrimary ? TrendingUp : AlertCircle;
  const iconColor = isPrimary ? "text-blue-600" : "text-amber-600";
  const bgColor = isPrimary ? "bg-blue-50" : "bg-amber-50";
  const borderColor = isPrimary ? "border-blue-200" : "border-amber-200";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200",
        bgColor,
        borderColor
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("size-4", iconColor)} />
          <span className="text-sm font-semibold text-neutral-900">
            {slice.label}
          </span>
        </div>
        <span className="text-lg font-bold text-neutral-900">
          {slice.value}
          <span className="text-xs font-normal text-neutral-500 ml-1">家</span>
        </span>
      </div>
      <div className="space-y-2">
        <Progress
          value={Math.round(slice.ratio * 100)}
          className={cn("h-2", STATUS_PROGRESS_CLASS[slice.tone])}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">占比</span>
          <span className="font-mono text-xs font-semibold text-neutral-900">
            {formatPercent(slice.ratio, 1)}
          </span>
        </div>
      </div>
    </div>
  );
}
